import { useState, useEffect, useCallback, useMemo } from "react";
import { ListItem, ToastItem, LogEvent, SearchQuery } from "../types";
import { StorageService } from "../services/storage";
import { getActiveCatalog, CATALOG } from "../data/productCatalog";
import { categorize } from "../data/categories";
import { getSubstituteKey, SUBSTITUTES_MAP } from "../data/substitutes";
import { recordPurchase, HistoryStore } from "../utils/history";
import { titleCase, normalizeName, matchProductByNameToken, sanitizeImplicitCommand } from "../utils/nlp";
import { SubstituteRanker } from "../services/recommendations";
import { SUPERMARKET_PRODUCTS } from "../data/supermarketProducts";

export type SuggestionUIItem = {
  item: string;
  reason: string;
  kind: "history" | "substitute" | "conversational";
  alternatives?: string[];
};

export const useShoppingList = () => {
  // --- Persistent States (Hardened Loading) ---
  const [items, setItems] = useState<ListItem[]>(() => StorageService.loadShoppingList());
  const [history, setHistory] = useState<HistoryStore>(() => StorageService.loadHistory());
  const [availabilityOverrides, setAvailabilityOverrides] = useState<Record<string, boolean>>(() =>
    StorageService.loadAvailability()
  );
  const [lang, setLang] = useState<string>(() => StorageService.loadLanguage("en-US"));
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() =>
    StorageService.loadOnboardingCompleted()
  );

  // --- Transient UI States ---
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [actionLog, setActionLog] = useState<LogEvent[]>([]);
  const [lastSearch, setLastSearch] = useState<SearchQuery | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [substituteSuggestion, setSubstituteSuggestion] = useState<SuggestionUIItem | null>(null);

  // --- Persistence Sync Hooks ---
  useEffect(() => {
    StorageService.saveShoppingList(items);
  }, [items]);

  useEffect(() => {
    StorageService.saveHistory(history);
  }, [history]);

  useEffect(() => {
    StorageService.saveAvailability(availabilityOverrides);
  }, [availabilityOverrides]);

  useEffect(() => {
    StorageService.saveLanguage(lang);
  }, [lang]);

  useEffect(() => {
    StorageService.saveOnboardingCompleted(onboardingCompleted);
  }, [onboardingCompleted]);

  // --- Helper ID Generator ---
  const generateId = useCallback((prefix = "id"): string => {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }, []);

  // --- UI feedback publishers ---
  const publishToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const newToast = { id: generateId("toast"), ...toast };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
  }, [generateId]);

  const publishEvent = useCallback((message: string) => {
    const newEvent = { id: generateId("ev"), ts: Date.now(), message };
    setActionLog((prev) => [newEvent, ...prev].slice(0, 20));
  }, [generateId]);

  const triggerUpdateDelay = useCallback(() => {
    setIsUpdating(true);
    window.setTimeout(() => setIsUpdating(false), 250);
  }, []);

  // --- V3 Estimated Total Calculation ---
  const estimatedTotal = useMemo(() => {
    return items
      .filter((item) => !item.purchasedAt)
      .reduce((sum, item) => {
        const prod = SUPERMARKET_PRODUCTS.find(
          (p) => p.name.toLowerCase() === item.normalized || p.aliases.some(alias => alias.toLowerCase() === item.normalized)
        );
        if (prod) {
          return sum + prod.pricing.sellingPrice * item.qty;
        }
        return sum;
      }, 0);
  }, [items]);

  // --- Core Transactions ---

  // ADD ITEM (With optional unit parameter)
  const handleAddItem = useCallback((rawName: string, qty: number, unit?: string) => {
    const catalog = getActiveCatalog(availabilityOverrides);
    const matchedProduct = matchProductByNameToken(rawName, catalog);
    const sanitizedInput = sanitizeImplicitCommand(rawName);
    
    const resolvedName = matchedProduct?.name ?? titleCase(sanitizedInput);
    const normalized = normalizeName(resolvedName);

    if (!normalized) return;

    // Availability validation check
    if (matchedProduct && !matchedProduct.available) {
      const subKey = getSubstituteKey(normalized);
      const subList = subKey ? SUBSTITUTES_MAP[subKey] : undefined;
      
      if (subList && subList.length) {
        const ranked = SubstituteRanker.rankSubstitutes(matchedProduct, availabilityOverrides, subList);
        
        if (ranked.length > 0) {
          setSubstituteSuggestion({
            kind: "substitute",
            item: ranked[0].product.name,
            reason: `${titleCase(resolvedName)} is unavailable. Consider: ${ranked.map(r => r.product.name).slice(0, 3).join(", ")}.`,
            alternatives: ranked.map(r => r.product.name)
          });
          publishToast({
            kind: "info",
            title: "Item Out of Stock",
            detail: `“${titleCase(resolvedName)}” is out of stock. Suggested alternatives are listed below.`
          });
        }
      } else {
        publishToast({
          kind: "error",
          title: "Item Out of Stock",
          detail: `“${titleCase(resolvedName)}” is out of stock and no substitutes exist.`
        });
      }
      publishEvent(`Out of stock: ${titleCase(resolvedName)}`);
      return;
    }

    setItems((prevItems) => {
      // For V3: Group identical items only if they carry the same unit
      const index = prevItems.findIndex((i) => i.normalized === normalized && i.unit === unit);
      if (index >= 0) {
        const updated = [...prevItems];
        updated[index] = {
          ...updated[index],
          qty: updated[index].qty + qty,
          updatedAt: Date.now(),
          purchasedAt: undefined
        };
        return updated;
      }
      
      const now = Date.now();
      const newItem: ListItem = {
        id: generateId("item"),
        name: resolvedName,
        normalized,
        qty: Math.max(1, qty),
        unit, // V3 addition
        category: categorize(normalized),
        addedAt: now,
        updatedAt: now
      };
      return [newItem, ...prevItems];
    });

    const displayUnit = unit ? ` ${unit}` : "";
    publishToast({
      kind: "success",
      title: "Added to List",
      detail: `${qty}${displayUnit} × ${titleCase(resolvedName)}`
    });
    publishEvent(`Added ${qty}${displayUnit} × ${titleCase(resolvedName)}`);
    triggerUpdateDelay();
  }, [availabilityOverrides, generateId, publishEvent, publishToast, triggerUpdateDelay]);

  // REMOVE (by name substring matching)
  const handleRemoveItemByName = useCallback((rawName: string) => {
    const normalizedQuery = normalizeName(rawName);
    if (!normalizedQuery) return;

    setItems((prevItems) => {
      const index = prevItems.findIndex(
        (i) => i.normalized.includes(normalizedQuery) || normalizedQuery.includes(i.normalized)
      );
      
      if (index < 0) {
        publishToast({
          kind: "error",
          title: "Not Found",
          detail: `No item matching “${titleCase(normalizedQuery)}”.`
        });
        publishEvent(`Remove failed: ${titleCase(normalizedQuery)} not found`);
        return prevItems;
      }

      const itemToRemove = prevItems[index];
      const filtered = [...prevItems.slice(0, index), ...prevItems.slice(index + 1)];
      
      publishToast({
        kind: "info",
        title: "Removed",
        detail: titleCase(itemToRemove.name)
      });
      publishEvent(`Removed ${titleCase(itemToRemove.name)}`);
      triggerUpdateDelay();
      return filtered;
    });
  }, [publishEvent, publishToast, triggerUpdateDelay]);

  // UPDATE QUANTITY (by name substring matching)
  const handleUpdateQtyByName = useCallback((rawName: string, targetQty: number, unit?: string) => {
    const normalizedQuery = normalizeName(rawName);
    if (!normalizedQuery || !targetQty) return;

    setItems((prevItems) => {
      const index = prevItems.findIndex(
        (i) => i.normalized.includes(normalizedQuery) || normalizedQuery.includes(i.normalized)
      );

      if (index < 0) {
        publishToast({
          kind: "error",
          title: "Not Found",
          detail: `No item matching “${titleCase(normalizedQuery)}”.`
        });
        publishEvent(`Update qty failed: ${titleCase(normalizedQuery)} not found`);
        return prevItems;
      }

      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        qty: Math.max(1, targetQty),
        unit: unit !== undefined ? unit : updated[index].unit,
        updatedAt: Date.now()
      };

      const displayUnit = updated[index].unit ? ` ${updated[index].unit}` : "";
      publishToast({
        kind: "success",
        title: "Quantity updated",
        detail: `${titleCase(updated[index].name)} → ${targetQty}${displayUnit}`
      });
      publishEvent(`Changed ${titleCase(updated[index].name)} quantity to ${targetQty}${displayUnit}`);
      triggerUpdateDelay();
      return updated;
    });
  }, [publishEvent, publishToast, triggerUpdateDelay]);

  // COMPLETE / CHECK OFF (by name substring matching)
  const handleCompleteItemByName = useCallback((rawName: string) => {
    const normalizedQuery = normalizeName(rawName);
    if (!normalizedQuery) return;

    setItems((prevItems) => {
      const index = prevItems.findIndex(
        (i) => i.normalized.includes(normalizedQuery) || normalizedQuery.includes(i.normalized)
      );

      if (index < 0) {
        publishToast({
          kind: "error",
          title: "Not Found",
          detail: `No item matching “${titleCase(normalizedQuery)}”.`
        });
        publishEvent(`Check-off failed: ${titleCase(normalizedQuery)} not found`);
        return prevItems;
      }

      const updated = [...prevItems];
      const target = updated[index];
      const isPurchasing = !target.purchasedAt;
      const now = Date.now();

      updated[index] = {
        ...target,
        purchasedAt: isPurchasing ? now : undefined,
        updatedAt: now
      };

      if (isPurchasing) {
        setHistory((prevHistory) => recordPurchase(prevHistory, target.normalized, now));
        publishToast({
          kind: "success",
          title: "Marked purchased",
          detail: titleCase(target.name)
        });
        publishEvent(`Completed ${titleCase(target.name)}`);
      } else {
        publishToast({
          kind: "info",
          title: "Unmarked purchased",
          detail: titleCase(target.name)
        });
        publishEvent(`Unmarked ${titleCase(target.name)}`);
      }

      triggerUpdateDelay();
      return updated;
    });
  }, [publishEvent, publishToast, triggerUpdateDelay]);

  // ID-based lookup wrappers for UI buttons
  const handleRemoveItem = useCallback((id: string) => {
    const matched = items.find((i) => i.id === id);
    if (matched) {
      handleRemoveItemByName(matched.normalized);
    }
  }, [items, handleRemoveItemByName]);

  const handleUpdateQty = useCallback((id: string, targetQty: number) => {
    const matched = items.find((i) => i.id === id);
    if (matched) {
      handleUpdateQtyByName(matched.normalized, targetQty);
    }
  }, [items, handleUpdateQtyByName]);

  const handleTogglePurchased = useCallback((id: string) => {
    const matched = items.find((i) => i.id === id);
    if (matched) {
      handleCompleteItemByName(matched.normalized);
    }
  }, [items, handleCompleteItemByName]);

  // CLEAR
  const handleClearList = useCallback(() => {
    setItems([]);
    publishToast({
      kind: "info",
      title: "Cleared",
      detail: "Shopping list cleared."
    });
    publishEvent("List cleared");
    triggerUpdateDelay();
  }, [publishEvent, publishToast, triggerUpdateDelay]);

  // CATALOG OVERRIDES
  const handleToggleAvailability = useCallback((productId: string) => {
    setAvailabilityOverrides((prevOverrides) => {
      const currentOverride = prevOverrides[productId];
      const defaultCatalogProduct = CATALOG.find((p) => p.id === productId);
      const defaultState = defaultCatalogProduct?.available ?? true;
      
      const nextOverride = currentOverride === undefined ? !defaultState : !currentOverride;
      const updated = {
        ...prevOverrides,
        [productId]: nextOverride
      };

      publishToast({
        kind: "info",
        title: "Catalog Updated",
        detail: `${productId} is now ${nextOverride ? "available" : "unavailable"}`
      });
      return updated;
    });
  }, [publishToast]);

  return {
    items,
    history,
    availabilityOverrides,
    lang,
    onboardingCompleted,
    setLang,
    setOnboardingCompleted,
    toasts,
    setToasts,
    actionLog,
    setActionLog,
    lastSearch,
    setLastSearch,
    isUpdating,
    substituteSuggestion,
    setSubstituteSuggestion,
    estimatedTotal, // V3 Estimated total property
    publishToast,
    publishEvent,
    triggerUpdateDelay,
    handleAddItem,
    handleRemoveItem,
    handleRemoveItemByName,
    handleUpdateQty,
    handleUpdateQtyByName,
    handleCompleteItemByName,
    handleTogglePurchased,
    handleToggleAvailability,
    handleClearList
  };
};
