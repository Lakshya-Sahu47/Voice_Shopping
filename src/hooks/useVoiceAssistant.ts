import { useState, useRef, useCallback } from "react";
import { ConversationContext, ToastItem } from "../types";
import { RuleBasedIntentEngine } from "../services/intent";
import { RecommendationEngine } from "../services/recommendations";
import { SUPERMARKET_PRODUCTS, SupermarketProduct } from "../data/supermarketProducts";
import { SuggestionUIItem } from "./useShoppingList";

export type VoiceState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR" | "UNSUPPORTED";

type VoiceAssistantParams = {
  lang: string;
  handleAddItem: (name: string, qty: number, unit?: string) => void;
  handleRemoveItemByName: (name: string) => void;
  handleUpdateQtyByName: (name: string, qty: number, unit?: string) => void;
  handleCompleteItemByName: (name: string) => void;
  handleClearList: () => void;
  publishToast: (toast: Omit<ToastItem, "id">) => void;
  publishEvent: (msg: string) => void;
  setSubstituteSuggestion: (suggestion: SuggestionUIItem | null) => void;
};

export const useVoiceAssistant = ({
  lang,
  handleAddItem,
  handleRemoveItemByName,
  handleUpdateQtyByName,
  handleCompleteItemByName,
  handleClearList,
  publishToast,
  publishEvent,
  setSubstituteSuggestion
}: VoiceAssistantParams) => {
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [context, setContext] = useState<ConversationContext>({});
  const [transcriptFeedback, setTranscriptFeedback] = useState("");
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [clarificationPrompt, setClarificationPrompt] = useState<string | null>(null);

  const intentEngine = useRef(new RuleBasedIntentEngine());

  const handleUtterance = useCallback((transcript: string) => {
    setVoiceState("PROCESSING");
    setTranscriptFeedback(transcript);
    setSubstituteSuggestion(null);

    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) {
      setVoiceState("IDLE");
      return;
    }

    // Parse command with active conversation context
    const intent = intentEngine.current.parse(cleanTranscript, lang, context);

    // 1. Process Suggestion Confirmations (Multi-turn Yes/No)
    if (context.pendingAction === "SUGGEST_CONFIRMATION" && context.suggestedItems) {
      if (intent.type === "CONFIRM_YES") {
        const addedNames: string[] = [];
        context.suggestedItems.forEach((name) => {
          // Find standard unit if available
          const match = SUPERMARKET_PRODUCTS.find(p => p.name === name);
          handleAddItem(name, 1, match?.pricing.unit);
          addedNames.push(name);
        });
        
        const feedback = `Added ${addedNames.join(" and ")} to your list.`;
        setAssistantResponse(feedback);
        publishToast({
          kind: "success",
          title: "Suggestions Added",
          detail: addedNames.join(", ")
        });
        publishEvent(`Added suggested: ${addedNames.join(", ")}`);
        setContext({});
        setClarificationPrompt(null);
        setVoiceState("SUCCESS");
        return;
      }
      
      if (intent.type === "CONFIRM_NO") {
        const feedback = "Okay, I won't add them.";
        setAssistantResponse(feedback);
        publishToast({
          kind: "info",
          title: "Cancelled",
          detail: "Suggestions discarded."
        });
        publishEvent("Suggestions addition cancelled by user.");
        setContext({});
        setClarificationPrompt(null);
        setVoiceState("SUCCESS");
        return;
      }
    }

    // 2. Process Search Selection (Index key or product substring match)
    if (context.pendingAction === "SEARCH_SELECTION" && context.lastSearchResults) {
      if (intent.type === "ADD_ITEM" && intent.items.length > 0) {
        const selected = intent.items[0];
        handleAddItem(selected.name, 1, selected.unit);
        setAssistantResponse(`Added ${selected.name} to list.`);
        setContext({});
        setClarificationPrompt(null);
        setVoiceState("SUCCESS");
        return;
      }
    }

    // 3. Process Standard Intent Types
    setClarificationPrompt(null);
    setAssistantResponse(null);

    switch (intent.type) {
      case "ADD_ITEM": {
        const addedList: string[] = [];
        let isBlockedByAvailability = false;
        let blockedProduct: SupermarketProduct | null = null;

        // Check if any of the items are marked unavailable in SUPERMARKET_PRODUCTS
        for (const item of intent.items) {
          const prod = SUPERMARKET_PRODUCTS.find(
            (p) => p.name.toLowerCase() === item.name.toLowerCase() || p.aliases.some(alias => alias.toLowerCase() === item.name.toLowerCase())
          );
          if (prod && !prod.availability) {
            isBlockedByAvailability = true;
            blockedProduct = prod;
            break;
          }
        }

        if (isBlockedByAvailability && blockedProduct) {
          const substitutes = SUPERMARKET_PRODUCTS.filter(
            (p) => p.category === blockedProduct!.category && p.availability && p.id !== blockedProduct!.id
          ).slice(0, 2);

          if (substitutes.length > 0) {
            const subNames = substitutes.map(s => s.name);
            const prompt = `${blockedProduct.name} is currently unavailable. I can suggest ${subNames.join(" or ")} instead. Would you like me to add one? (You can say: add the first one, or specify its name)`;
            
            setAssistantResponse(prompt);
            setClarificationPrompt(prompt);
            setContext({
              pendingAction: "SEARCH_SELECTION",
              lastSearchResults: substitutes
            });
            publishToast({
              kind: "info",
              title: "Out of Stock",
              detail: `${blockedProduct.name} is unavailable. Alternatives offered.`
            });
          } else {
            const failMsg = `${blockedProduct.name} is currently unavailable and no substitutes exist.`;
            setAssistantResponse(failMsg);
            setClarificationPrompt(failMsg);
          }
          setVoiceState("SUCCESS");
          return;
        }

        intent.items.forEach((item) => {
          handleAddItem(item.name, item.qty, item.unit);
          const displayUnit = item.unit ? ` ${item.unit}` : "";
          addedList.push(`${item.qty}${displayUnit} ${item.name}`);
        });

        const feedback = `Added: ${addedList.join(", ")}`;
        setAssistantResponse(feedback);
        publishEvent(`Added from speech: ${addedList.join(", ")}`);
        setContext({});
        setVoiceState("SUCCESS");
        break;
      }

      case "REMOVE_ITEM":
        handleRemoveItemByName(intent.item);
        setAssistantResponse(`Removed ${intent.item}`);
        setVoiceState("SUCCESS");
        break;

      case "UPDATE_QUANTITY":
        handleUpdateQtyByName(intent.item, intent.qty, intent.unit);
        {
          const displayUnit = intent.unit ? ` ${intent.unit}` : "";
          setAssistantResponse(`Updated ${intent.item} quantity to ${intent.qty}${displayUnit}`);
        }
        setVoiceState("SUCCESS");
        break;

      case "COMPLETE_ITEM":
        handleCompleteItemByName(intent.item);
        setAssistantResponse(`Checked off ${intent.item}`);
        setVoiceState("SUCCESS");
        break;

      case "SUGGEST": {
        const hasConstraints = Object.values(intent.constraints).some(v => v !== undefined && v !== false);
        let suggestions: SupermarketProduct[] = [];

        if (hasConstraints) {
          suggestions = RecommendationEngine.getConstrainedSuggestions(intent.constraints);
        } else {
          // Default: Seasonal and discounted items (Part 18 and 19 requirements)
          suggestions = SUPERMARKET_PRODUCTS.filter(p => p.tags.includes("seasonal") || p.pricing.discountPercent > 0);
        }

        const topSuggestions = suggestions.slice(0, 2);

        if (topSuggestions.length > 0) {
          const names = topSuggestions.map((s) => s.name);
          let explanation = "";
          
          if (hasConstraints) {
            explanation = topSuggestions
              .map((s) => RecommendationEngine.getConstraintExplanation(s, intent.constraints))
              .join(" Also, ");
          } else {
            explanation = topSuggestions
              .map((s) => {
                const typeDesc = s.tags.includes("seasonal") ? "currently in season" : "discounted";
                return `${s.name} is ${typeDesc} (selling price ₹${s.pricing.sellingPrice}).`;
              })
              .join(" Also, ");
          }

          const prompt = `I'd suggest ${names.join(" and ")}. ${explanation} Would you like me to add them?`;
          
          setAssistantResponse(prompt);
          setClarificationPrompt(prompt);
          
          setContext({
            pendingAction: "SUGGEST_CONFIRMATION",
            suggestedItems: names
          });

          publishToast({
            kind: "info",
            title: "Suggestions Ready",
            detail: names.join(" & ")
          });
          publishEvent(`Offered suggestions: ${names.join(", ")}`);
        } else {
          const failMsg = "I couldn't find any products in the knowledge base matching those criteria. Try asking for something cheap or healthy.";
          setAssistantResponse(failMsg);
          setClarificationPrompt(failMsg);
        }
        setVoiceState("SUCCESS");
        break;
      }

      case "SEARCH": {
        // Match against SUPERMARKET_PRODUCTS (Voice search - Part 16 and 17)
        const results = SUPERMARKET_PRODUCTS.filter((product) => {
          if (intent.term && intent.term !== "product") {
            const normTerm = intent.term.toLowerCase();
            const nameMatch = product.name.toLowerCase().includes(normTerm);
            const aliasMatch = product.aliases.some(alias => alias.toLowerCase().includes(normTerm));
            const catMatch = product.category.toLowerCase().includes(normTerm);
            if (!nameMatch && !aliasMatch && !catMatch) return false;
          }
          if (intent.brand) {
            if (product.brand?.toLowerCase() !== intent.brand.toLowerCase()) return false;
          }
          if (typeof intent.minPriceInr === "number") {
            if (product.pricing.sellingPrice < intent.minPriceInr) return false;
          }
          if (typeof intent.maxPriceInr === "number") {
            if (product.pricing.sellingPrice > intent.maxPriceInr) return false;
          }
          if (intent.packageSize) {
            const sizeNum = intent.packageSize.replace(/[^\d]/g, "");
            if (sizeNum && product.packageSize) {
              if (!product.packageSize.includes(sizeNum)) return false;
            }
          }
          if (intent.tags) {
            if (!intent.tags.every(tag => product.tags.includes(tag))) return false;
          }
          return true;
        });

        if (results.length > 0) {
          const topResults = results.slice(0, 4);
          const listText = topResults.map((r, i) => `${i + 1}. ${r.name} (${r.brand}) — ₹${r.pricing.sellingPrice} (${r.packageSize || r.pricing.unit})`).join("\n");
          const prompt = `Found ${results.length} option${results.length > 1 ? "s" : ""}:\n${listText}\nWould you like me to add one? (You can say: add the first one, or specify its name)`;
          
          setAssistantResponse(prompt);
          setClarificationPrompt(`I found ${results.length} results. Would you like me to add one?`);
          setContext({
            pendingAction: "SEARCH_SELECTION",
            lastSearchResults: topResults
          });
        } else {
          const failMsg = "I couldn't find any products in the database matching those criteria.";
          setAssistantResponse(failMsg);
          setClarificationPrompt(failMsg);
        }
        setVoiceState("SUCCESS");
        break;
      }

      case "CLEAR_LIST":
        handleClearList();
        setAssistantResponse("Cleared your shopping list.");
        setVoiceState("SUCCESS");
        break;

      case "HELP":
        setAssistantResponse("You can say: 'Add 1 kg mango and papaya', 'Remove milk', 'Mark apples as purchased', or 'Suggest something cheap and filling'.");
        publishToast({
          kind: "info",
          title: "Supported Commands",
          detail: "Add <item>, Remove <item>, Check off <item>, Clear list, Suggest <constraint>."
        });
        setVoiceState("SUCCESS");
        break;

      default:
        publishToast({
          kind: "error",
          title: "Not Understood",
          detail: `Could not interpret: “${transcript}”`
        });
        publishEvent(`Unknown command: "${transcript}"`);
        setAssistantResponse(`I heard: "${transcript}", but couldn't understand the command.`);
        setVoiceState("ERROR");
        break;
    }
  }, [
    lang,
    context,
    handleAddItem,
    handleRemoveItemByName,
    handleUpdateQtyByName,
    handleCompleteItemByName,
    handleClearList,
    publishToast,
    publishEvent,
    setSubstituteSuggestion
  ]);

  return {
    voiceState,
    context,
    transcriptFeedback,
    assistantResponse,
    clarificationPrompt,
    setVoiceState,
    setTranscriptFeedback,
    setClarificationPrompt,
    handleUtterance
  };
};
