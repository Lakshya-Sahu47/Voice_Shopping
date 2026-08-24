import { IntentResult, ConversationContext } from "../types";
import { parseLanguageNumbers } from "../utils/numbers";

export interface IntentEngine {
  parse(input: string, lang: string, context?: ConversationContext): IntentResult;
}

// -------------------------------------------------------------
// Dictionaries and Verb Configs
// -------------------------------------------------------------

export const ENGLISH_VERBS = {
  add: ["add", "need", "buy", "get", "include", "put", "want"],
  remove: ["remove", "delete", "drop", "cancel", "erase"],
  update: ["change", "set", "update", "modify"],
  complete: ["complete", "finish", "check off", "mark", "bought", "purchased", "checked", "done"],
  search: ["find", "search", "look for", "show me", "get me"],
  clear: ["clear list", "empty list", "reset list", "clear"],
  help: ["help", "what can i say", "commands", "instructions"],
  suggest: ["suggest", "recommend", "sugest", "sugestions", "suggestions", "what can i eat", "what should i buy"]
};

export const SPANISH_VERBS = {
  add: ["agrega", "agregar", "añade", "añadir", "necesito", "comprar", "quiero"],
  remove: ["quita", "quitar", "elimina", "eliminar", "borra", "borrar"],
  update: ["cambia", "cambiar", "actualiza", "actualizar", "poner"],
  complete: ["completa", "completar", "marca", "marcar", "comprado", "comprada", "hecho"],
  search: ["busca", "buscar", "encuentra", "encontrar"],
  clear: ["limpia la lista", "vacía la lista", "reinicia la lista", "limpiar"],
  help: ["ayuda", "comandos"],
  suggest: ["sugiere", "sugerencia", "sugerencias", "recomendar", "recomendaciones"]
};

export const HINDI_VERBS = {
  add: ["जोड़", "जोड़ो", "डाल", "डालो", "मुझे चाहिए", "खरीद", "buy", "add", "लाओ"],
  remove: ["हटा", "हटाओ", "निकाल", "निकालो", "remove", "delete"],
  update: ["बदल", "बदलो", "सेट", "update", "change"],
  complete: ["खरीद लिया", "चेक", "मार्क", "done", "complete"],
  search: ["ढूंढ", "ढूंढो", "खोज", "खोजो", "search", "find", "दिखाओ"],
  clear: ["लिस्ट साफ", "लिस्ट खाली", "clear list", "साफ"],
  help: ["मदद", "help", "commands", "निर्देश"],
  suggest: ["सुझाव", "सजेस्ट", "सजेशन", "बताओ", "suggest"]
};

export const FRENCH_VERBS = {
  add: ["ajouter", "ajoute", "prendre", "achete", "acheter", "mettre", "veux"],
  remove: ["supprimer", "supprime", "enlever", "enleve", "retirer", "retire"],
  update: ["changer", "change", "modifier", "modifie"],
  complete: ["completer", "termine", "coche", "cocher", "achete", "fait"],
  search: ["trouver", "trouve", "chercher", "cherche", "rechercher", "recherche"],
  clear: ["vider", "vide", "nettoyer", "nettoye", "effacer"],
  help: ["aide", "commandes", "manuel"],
  suggest: ["suggere", "suggerer", "suggestions", "recommande", "recommandations"]
};

export function getVerbsForLanguage(lang: string) {
  if (lang.startsWith("es")) return SPANISH_VERBS;
  if (lang.startsWith("hi")) return HINDI_VERBS;
  if (lang.startsWith("fr")) return FRENCH_VERBS;
  return ENGLISH_VERBS;
}

// -------------------------------------------------------------
// Core String Cleaners
// -------------------------------------------------------------

export function normalizeName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCase(text: string): string {
  return text
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stripFillers(text: string, lang: string): string {
  let clean = text
    .replace(/\b(to|from)\s+my\s+list\b/gi, " ")
    .replace(/\b(on|in)\s+my\s+list\b/gi, " ")
    .replace(/\b(in|into|to|on)\s+(the\s+)?shopping\s+cart\b/gi, " ")
    .replace(/\b(in|into|to|on)\s+(the\s+)?cart\b/gi, " ")
    .replace(/^\s*(hello|hi|hey)\b[:, \s]*/gi, " ")
    .replace(/\bplease\b/gi, " ")
    .replace(/\b(list)\b/gi, " ");
  
  if (lang.startsWith("es")) {
    clean = clean.replace(/\b(a|de)\s+mi\s+lista\b/gi, " ").replace(/\bpor\s+favor\b/gi, " ");
  } else if (lang.startsWith("fr")) {
    clean = clean.replace(/\b(a|dans)\s+ma\s+liste\b/gi, " ").replace(/\bs'il\s+vous\s+plait\b/gi, " ");
  }
  return clean;
}

export function trimCommandVerbs(text: string, verbs: string[]): string {
  let cleaned = text.trim();
  
  for (const verb of verbs) {
    const startRegex = new RegExp(`^${escapeRegex(verb)}\\b`, "i");
    if (startRegex.test(cleaned)) {
      cleaned = cleaned.replace(startRegex, " ").trim();
      return cleaned;
    }
  }

  for (const verb of verbs) {
    const endRegex = new RegExp(`\\b${escapeRegex(verb)}\\s*(karo|kar\\s+do|do|hata\\s+do|hatao|dhundo|search\\s+karo|kijiye|karen)?$`, "i");
    if (endRegex.test(cleaned)) {
      cleaned = cleaned.replace(endRegex, " ").trim();
      return cleaned;
    }
  }

  cleaned = cleaned.replace(/\b(add\\s+)?(karo|kar\\s+do|do|hata\\s+do|hatao|dhundo|search\\s+karo)$/i, "").trim();
  return cleaned;
}

// -------------------------------------------------------------
// Stemming & Singularization
// -------------------------------------------------------------

export function singularize(word: string): string {
  const lowercase = word.toLowerCase().trim();
  
  if (lowercase === "tomatoes") return "tomato";
  if (lowercase === "potatoes") return "potato";
  if (lowercase === "mangoes") return "mango";
  if (lowercase === "boxes") return "box";
  if (lowercase === "peaches") return "peach";
  
  if (lowercase.endsWith("ies") && lowercase.length > 3) {
    return `${word.slice(0, -3)}y`;
  }
  
  if (lowercase.endsWith("es") && lowercase.length > 3) {
    const base = lowercase.slice(0, -2);
    if (base.endsWith("s") || base.endsWith("sh") || base.endsWith("ch") || base.endsWith("x") || base.endsWith("o")) {
      return word.slice(0, -2);
    }
  }
  
  if (lowercase.endsWith("s") && lowercase.length > 2 && !lowercase.endsWith("ss")) {
    return word.slice(0, -1);
  }
  
  return word;
}

export function pluralize(word: string): string {
  const lowercase = word.toLowerCase().trim();
  if (lowercase === "tomato") return "tomatoes";
  if (lowercase === "potato") return "potatoes";
  if (lowercase === "box") return "boxes";
  if (lowercase === "peach") return "peaches";
  
  if (word.endsWith("y") && word.length > 1) {
    return `${word.slice(0, -1)}ies`;
  }
  if (word.endsWith("s")) {
    return word;
  }
  return `${word}s`;
}

export function singularizeNormalized(text: string): string {
  return singularize(normalizeName(text));
}

// -------------------------------------------------------------
// Quantity and Unit extraction per segment
// -------------------------------------------------------------

export function extractQuantityAndUnit(
  text: string,
  lang: string
): { qty: number; unit?: string; item: string } {
  const cleaned = text.trim();
  const langDict = parseLanguageNumbers(lang);
  
  const unitRegex = /\b(kg|kilo|kilos|g|gram|grams|litre|litres|liter|liters|l|packet|packets|bottle|bottles|dozen|dozens|ml|pack|packs|piece|pieces|packet\s+of|bottle\s+of|pack\s+of)\b/i;
  
  const tokens = cleaned.split(/\s+/);
  let qty = 1;
  let hasQty = false;
  let sliceStart = 0;

  if (tokens.length > 0) {
    const first = tokens[0].toLowerCase();
    
    // Combined dictionary for common language numbers
    const allDict: Record<string, number> = {
      ...langDict,
      "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
      "a": 1, "an": 1, "ek": 1, "do": 2, "teen": 3, "char": 4, "paanch": 5, "ek kilo": 1, "do kilo": 2,
      "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पाँच": 5, "पांच": 5, "छह": 6, "छः": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
      "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5
    };
    
    if (/^\d+$/.test(first)) {
      qty = Number(first);
      hasQty = true;
      sliceStart = 1;
    } else if (allDict[first] !== undefined) {
      qty = allDict[first];
      hasQty = true;
      sliceStart = 1;
    }
  }

  // Look for unit following the number
  let unit: string | undefined = undefined;
  if (hasQty && tokens.length > sliceStart) {
    const nextToken = tokens[sliceStart].toLowerCase();
    const unitMatch = nextToken.match(unitRegex);
    if (unitMatch) {
      unit = unitMatch[1];
      sliceStart += 1;
      
      // Handle "packet of cookies"
      if (tokens.length > sliceStart && tokens[sliceStart].toLowerCase() === "of") {
        sliceStart += 1;
      }
    }
  } else if (!hasQty && tokens.length > 0) {
    // Check if starts with "a packet of"
    const first = tokens[0].toLowerCase();
    if ((first === "a" || first === "an" || first === "one") && tokens.length > 1) {
      const second = tokens[1].toLowerCase();
      const unitMatch = second.match(unitRegex);
      if (unitMatch) {
        qty = 1;
        unit = unitMatch[1];
        sliceStart = 2;
        if (tokens.length > 2 && tokens[2].toLowerCase() === "of") {
          sliceStart = 3;
        }
      }
    }
  }

  const remainder = tokens.slice(sliceStart).join(" ").trim();
  
  // Format unit strings (e.g. standardizing kilo to kg)
  let formattedUnit = unit;
  if (unit) {
    const uLower = unit.toLowerCase();
    if (uLower === "kilo" || uLower === "kilos") formattedUnit = "kg";
    if (uLower === "liter" || uLower === "liters" || uLower === "litre" || uLower === "litres") formattedUnit = "L";
  }

  return { qty, unit: formattedUnit, item: remainder };
}

// -------------------------------------------------------------
// V3 Intent Parser Implementation
// -------------------------------------------------------------

export class RuleBasedIntentEngine implements IntentEngine {
  parse(input: string, lang: string, context?: ConversationContext): IntentResult {
    const dictionary = getVerbsForLanguage(lang);
    const cleaned = stripFillers(input.trim(), lang).trim();
    const lowercase = cleaned.toLowerCase();

    // 1. SUGGESTION CONFIRMATION CONTEXT
    if (context && context.pendingAction === "SUGGEST_CONFIRMATION") {
      const yesPattern = /\b(yes|yeah|yup|sure|add|add\s+them|add\s+it|okay|ok|do\s+it|haan|ha|sahi|kar\s+do|kar\s+de)\b/i;
      const noPattern = /\b(no|nope|dont|don't|nahi|na|naa|rehne\s+do|cancel)\b/i;
      
      if (yesPattern.test(lowercase)) {
        return { type: "CONFIRM_YES", confidence: "high" };
      }
      if (noPattern.test(lowercase)) {
        return { type: "CONFIRM_NO", confidence: "high" };
      }
    }

    // 2. SEARCH SELECTION CONTEXT (V3 selection of listed search results)
    if (context && context.pendingAction === "SEARCH_SELECTION" && context.lastSearchResults) {
      const indexKeywords = {
        first: 0, pehla: 0, "number one": 0, "1st": 0, "1": 0, "one": 0,
        second: 1, dusra: 1, "number two": 1, "2nd": 1, "2": 1, "two": 1,
        third: 2, tisra: 2, "number three": 2, "3rd": 2, "3": 2, "three": 2,
        fourth: 3, chotha: 3, "number four": 3, "4th": 3, "4": 3, "four": 3
      };

      for (const [key, idx] of Object.entries(indexKeywords)) {
        if (lowercase.includes(key)) {
          if (idx < context.lastSearchResults.length) {
            const chosen = context.lastSearchResults[idx];
            return {
              type: "ADD_ITEM",
              items: [{ name: chosen.name, qty: 1, unit: chosen.pricing.unit }],
              confidence: "high"
            };
          }
        }
      }

      // Check if matches specific result names
      for (const product of context.lastSearchResults) {
        const prodNameLower = product.name.toLowerCase();
        if (lowercase.includes(prodNameLower) || product.aliases.some(alias => lowercase.includes(alias.toLowerCase()))) {
          return {
            type: "ADD_ITEM",
            items: [{ name: product.name, qty: 1, unit: product.pricing.unit }],
            confidence: "high"
          };
        }
      }
    }

    if (!lowercase) {
      return { type: "UNKNOWN", raw: input, confidence: "low" };
    }

    // 3. Static command triggers
    if (lowercase.split(" ").some(w => dictionary.help.includes(w))) {
      return { type: "HELP", confidence: "high" };
    }

    if (dictionary.clear.some(verb => lowercase === verb || lowercase === "clear" || lowercase === "reset")) {
      return { type: "CLEAR_LIST", confidence: "high" };
    }

    // 4. SUGGEST (Conversational recommendations - NOT auto adding)
    if (
      dictionary.suggest.some(verb => lowercase.includes(verb)) ||
      /\b(sajesh|sajet|kuch\s+sasta|kuch\s+pet|rupaya|rupee|rs|price|under|cheap|sasta|healthy|filling|breakfast|snack|salty|sweet|what\s+should\s+i\s+buy)\b/i.test(lowercase)
    ) {
      // Analyze V3 constraints
      const cheap = /\b(cheap|sasta|saste|inexpensive|low|kam)\b/i.test(lowercase);
      const healthy = /\b(healthy|health|poshtik|accha)\b/i.test(lowercase);
      const filling = /\b(filling|heavy|pet|pet\s+bharne|weight)\b/i.test(lowercase);
      const salty = /\b(salty|namkeen|namkin|namak)\b/i.test(lowercase);
      const sweet = /\b(sweet|meetha|mitha|chocolate|sugar)\b/i.test(lowercase);
      const breakfast = /\b(breakfast|nashta|nashte|morning)\b/i.test(lowercase);
      const snack = /\b(snack|snacks|namkeen|crunchy|sham)\b/i.test(lowercase);
      
      // Parse under X rupees constraint (e.g. under 100 rupees, 100 ke andar)
      let maxPriceInr: number | undefined = undefined;
      const priceMatch = lowercase.match(/(?:under|below|se\s+kam|andar|rs\.?|rupees|rupee|₹)\s*(\d+)/i);
      if (priceMatch) {
        maxPriceInr = Number(priceMatch[1]);
      } else {
        const hindiUnderMatch = lowercase.match(/(\d+)\s*(rupia|rupiya|rupee|rupees|₹|rupaiye)?\s*(ke\s+andar|se\s+kam)/i);
        if (hindiUnderMatch) {
          maxPriceInr = Number(hindiUnderMatch[1]);
        }
      }

      return {
        type: "SUGGEST",
        constraints: { cheap, healthy, filling, salty, sweet, breakfast, snack, maxPriceInr },
        confidence: "high"
      };
    }

    // 5. COMPLETE / CHECK OFF
    if (dictionary.complete.some(verb => lowercase.includes(verb))) {
      let query = cleaned;
      query = trimCommandVerbs(query, dictionary.complete);
      const item = normalizeName(query);
      if (item) {
        return { type: "COMPLETE_ITEM", item, confidence: "high" };
      }
    }

    // 6. SEARCH (internal product/category constraint lookup - V3 voice-activated search)
    if (
      dictionary.search.some(verb => lowercase.includes(verb)) ||
      /\b(find|search|look\s+for|dhundo|khojo)\b/i.test(lowercase)
    ) {
      let query = cleaned;
      query = trimCommandVerbs(query, dictionary.search);
      query = query.replace(/\b(find|search|look\s+for|dhundo|khojo)\b/gi, "").trim();

      // Brand extraction matching
      const knownBrands = [
        "amul", "organic valley", "alphonso", "freshpick", "local farm", 
        "mother dairy", "raw pressery", "aashirvaad", "india gate", 
        "quaker", "tata sampann", "lays", "britannia", "haldirams", 
        "cadbury", "nestle", "taj mahal", "nescafe", "bisleri"
      ];
      let brand: string | undefined = undefined;
      for (const b of knownBrands) {
        if (query.toLowerCase().includes(b)) {
          brand = titleCase(b);
          const regex = new RegExp(`\\b${escapeRegex(b)}\\b`, "gi");
          query = query.replace(regex, "").trim();
        }
      }

      // Min/Max Price Range Extraction
      let minPriceInr: number | undefined = undefined;
      let maxPriceInr: number | undefined = undefined;

      const rangeMatch = query.match(/(?:between|se)\s*([$₹]?\s*\d+)\s*(?:and|aur|se)\s*([$₹]?\s*\d+)/i);
      if (rangeMatch) {
        minPriceInr = Number(rangeMatch[1].replace(/[^\d]/g, ""));
        maxPriceInr = Number(rangeMatch[2].replace(/[^\d]/g, ""));
        query = query.replace(rangeMatch[0], "").trim();
      } else {
        const underMatch = query.match(/(?:under|below|less than|se\s+kam|ke\s+andar)\s*[$₹]?\s*(\d+)/i);
        if (underMatch) {
          maxPriceInr = Number(underMatch[1]);
          query = query.replace(underMatch[0], "").trim();
        }
        const aboveMatch = query.match(/(?:above|greater than|se\s+jyada|se\s+adhik)\s*[$₹]?\s*(\d+)/i);
        if (aboveMatch) {
          minPriceInr = Number(aboveMatch[1]);
          query = query.replace(aboveMatch[0], "").trim();
        }
      }

      // Package size extraction
      let packageSize: string | undefined = undefined;
      const sizeMatch = query.match(/(\d+)\s*(gram|g|kg|kilo|litre|litres|liter|liters|l|ml|pack|packet|bottle|dozen)/i);
      if (sizeMatch) {
        packageSize = `${sizeMatch[1]} ${sizeMatch[2]}`;
        query = query.replace(sizeMatch[0], "").trim();
      }

      // Tag extraction
      const tags: string[] = [];
      if (/\borganic\b/i.test(query)) {
        tags.push("organic");
        query = query.replace(/\borganic\b/gi, "").trim();
      }
      if (/\bcheap|sasta\b/i.test(query)) {
        tags.push("cheap");
        query = query.replace(/\bcheap|sasta\b/gi, "").trim();
      }
      if (/\bhealthy\b/i.test(query)) {
        tags.push("healthy");
        query = query.replace(/\bhealthy\b/gi, "").trim();
      }
      if (/\bsalty\b/i.test(query)) {
        tags.push("salty");
        query = query.replace(/\bsalty\b/gi, "").trim();
      }
      if (/\bsweet\b/i.test(query)) {
        tags.push("sweet");
        query = query.replace(/\bsweet\b/gi, "").trim();
      }

      const term = normalizeName(query);
      if (term || brand || minPriceInr || maxPriceInr || packageSize || tags.length) {
        return {
          type: "SEARCH",
          term: term || "product",
          minPriceInr,
          maxPriceInr,
          brand,
          tags: tags.length ? tags : undefined,
          packageSize,
          confidence: "high"
        };
      }
    }

    // 7. REMOVE
    if (dictionary.remove.some(verb => lowercase.includes(verb)) || /\b(remove|delete|drop|hata|hatao|hata\s+do)\b/i.test(lowercase)) {
      let query = cleaned;
      query = trimCommandVerbs(query, dictionary.remove);
      query = query.replace(/\bfrom\b/gi, " ");
      const item = normalizeName(query);
      if (item) {
        return { type: "REMOVE_ITEM", item, confidence: "high" };
      }
    }

    // 8. UPDATE QUANTITY
    if (dictionary.update.some(verb => lowercase.includes(verb)) || /\b(change|set|update|change\s+to)\b/i.test(lowercase)) {
      let query = cleaned;
      query = trimCommandVerbs(query, dictionary.update);
      const parts = query.split(/\b(to|a)\b/i).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const item = normalizeName(parts[0]);
        const { qty, unit } = extractQuantityAndUnit(parts.slice(1).join(" "), lang);
        if (item && qty !== null) {
          return { type: "UPDATE_QUANTITY", item, qty, unit, confidence: "high" };
        }
      }
    }

    // 9. ADD (Default action + multi item parsing trigger)
    let query2 = cleaned;
    query2 = trimCommandVerbs(query2, dictionary.add);
    query2 = query2
      .replace(/^i\s+(really\s+)?(need|want|would\s+like)\s+(to\s+)?(buy|get)?\s*/i, "")
      .replace(/^mujhe\s+(chahiye|chahie)\s*/i, "")
      .trim();

    const segments = query2.split(/\b(?:and|plus|also|aur)\b|,/gi).map(s => s.trim()).filter(Boolean);
    
    if (segments.length > 0) {
      const itemsList = segments.map((seg) => {
        const { qty, unit, item } = extractQuantityAndUnit(seg, lang);
        return {
          name: singularizeNormalized(item),
          qty,
          unit
        };
      }).filter(x => x.name.length > 0);

      if (itemsList.length > 0) {
        return {
          type: "ADD_ITEM",
          items: itemsList,
          confidence: "high"
        };
      }
    }

    return { type: "UNKNOWN", raw: input, confidence: "low" };
  }
}
