export const ENGLISH_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12
};

export const SPANISH_NUMBERS: Record<string, number> = {
  uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10
};

export const HINDI_NUMBERS: Record<string, number> = {
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5, chhah: 6, saat: 7, aath: 8, nau: 9, das: 10
};

export function parseLanguageNumbers(lang: string): Record<string, number> {
  if (lang.startsWith("es")) {
    return SPANISH_NUMBERS;
  }
  if (lang.startsWith("hi")) {
    return HINDI_NUMBERS;
  }
  return ENGLISH_NUMBERS;
}

// Extracted quantity from standard strings (used in Cp)
export function extractQuantity(text: string, lang: string): { qty: number | null; remainder: string } {
  const trimmed = text.trim();
  
  // Try matching numbers like "3" or "24"
  const digitMatch = trimmed.match(/\b(\d{1,3})\b/);
  if (digitMatch) {
    const qty = Math.max(1, Number(digitMatch[1]));
    const remainder = trimmed.replace(digitMatch[0], " ").replace(/\s+/g, " ").trim();
    return { qty, remainder };
  }
  
  // Try matching words like "two", "dos" based on language
  const tokens = trimmed.toLowerCase().split(/\s+/);
  const dict = lang.startsWith("es") ? SPANISH_NUMBERS : ENGLISH_NUMBERS; // note: gp vs vp in bundle
  
  for (let i = 0; i < tokens.length; i++) {
    const qty = dict[tokens[i]];
    if (typeof qty === "number") {
      const remainder = [...tokens.slice(0, i), ...tokens.slice(i + 1)].join(" ").trim();
      return { qty, remainder };
    }
  }
  
  return { qty: null, remainder: trimmed };
}

// Extracted quantity from words preceding an item name in multiple item parser (used in Rp)
export function parsePrecedingQuantity(text: string, lang: string): number {
  // Normalize string to words
  const cleanText = text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
  const tokens = cleanText.split(" ").filter(Boolean);
  
  // Get language dictionary
  const dict = lang.startsWith("es") 
    ? SPANISH_NUMBERS 
    : lang.startsWith("hi") 
      ? HINDI_NUMBERS 
      : { ...ENGLISH_NUMBERS, a: 1, an: 1 };
      
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (/^\d{1,3}$/.test(token)) {
      return Number(token);
    }
    const val = dict[token];
    if (typeof val === "number") {
      return val;
    }
  }
  
  return 1;
}
