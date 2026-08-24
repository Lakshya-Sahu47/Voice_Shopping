import { ListItem } from "../types";

export const STORAGE_KEYS = {
  LIST: "svca:list:v2", // Upgraded version for V2 settings
  LANG: "svca:lang:v2",
  HISTORY: "svca:history:v2",
  AVAILABILITY: "svca:availability:v2",
  ONBOARDING: "svca:onboarding:v2"
};

// Fallback legacy storage checks
const LEGACY_KEYS = {
  LIST: "svca:list:v1",
  LANG: "svca:lang:v1",
  HISTORY: "svca:history:v1",
  AVAILABILITY: "svca:availability:v1"
};

export function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn("Storage warning: failed to parse JSON data, using fallback.");
    return fallback;
  }
}

export function validateShoppingList(data: unknown): ListItem[] {
  if (!Array.isArray(data)) return [];
  
  return data.filter((item): item is ListItem => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Record<string, unknown>;
    
    return (
      typeof candidate.id === "string" &&
      typeof candidate.name === "string" &&
      typeof candidate.normalized === "string" &&
      typeof candidate.qty === "number" &&
      typeof candidate.category === "string" &&
      typeof candidate.addedAt === "number" &&
      typeof candidate.updatedAt === "number"
    );
  });
}

export function validateHistory(data: unknown): Record<string, number[]> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const record = data as Record<string, unknown>;
  const validated: Record<string, number[]> = {};

  for (const [key, val] of Object.entries(record)) {
    if (Array.isArray(val) && val.every((t) => typeof t === "number")) {
      validated[key] = val;
    }
  }
  return validated;
}

export function validateAvailability(data: unknown): Record<string, boolean> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const record = data as Record<string, unknown>;
  const validated: Record<string, boolean> = {};

  for (const [key, val] of Object.entries(record)) {
    if (typeof val === "boolean") {
      validated[key] = val;
    }
  }
  return validated;
}

export class StorageService {
  static loadShoppingList(): ListItem[] {
    let raw = localStorage.getItem(STORAGE_KEYS.LIST);
    if (!raw) {
      // Legacy fallback
      raw = localStorage.getItem(LEGACY_KEYS.LIST);
    }
    const parsed = safeParseJson(raw, []);
    return validateShoppingList(parsed);
  }

  static saveShoppingList(list: ListItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LIST, JSON.stringify(list));
    } catch (e) {
      console.error("Storage error: Failed to save shopping list due to storage limits.", e);
    }
  }

  static loadLanguage(defaultLang = "en-US"): string {
    let raw = localStorage.getItem(STORAGE_KEYS.LANG);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEYS.LANG);
    }
    const parsed = safeParseJson(raw, defaultLang);
    return typeof parsed === "string" ? parsed : defaultLang;
  }

  static saveLanguage(lang: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, JSON.stringify(lang));
    } catch (e) {
      console.error(e);
    }
  }

  static loadHistory(): Record<string, number[]> {
    let raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEYS.HISTORY);
    }
    const parsed = safeParseJson(raw, {});
    return validateHistory(parsed);
  }

  static saveHistory(history: Record<string, number[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }

  static loadAvailability(): Record<string, boolean> {
    let raw = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEYS.AVAILABILITY);
    }
    const parsed = safeParseJson(raw, {});
    return validateAvailability(parsed);
  }

  static saveAvailability(overrides: Record<string, boolean>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(overrides));
    } catch (e) {
      console.error(e);
    }
  }

  static loadOnboardingCompleted(): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    return safeParseJson(raw, false);
  }

  static saveOnboardingCompleted(completed: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(completed));
    } catch (e) {
      console.error(e);
    }
  }
}
