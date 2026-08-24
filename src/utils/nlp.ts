import { Product } from "../data/productCatalog";
import { parsePrecedingQuantity } from "./numbers";
import {
  normalizeName,
  titleCase,
  escapeRegex,
  singularize,
  pluralize,
  singularizeNormalized
} from "../services/intent";

export { normalizeName, titleCase, escapeRegex, singularize, pluralize, singularizeNormalized };

export type ProductVariantMatch = {
  product: Product;
  normalized: string;
  variants: string[];
};

export function getProductVariants(name: string): string[] {
  const norm = normalizeName(name);
  const variants = new Set([norm]);
  const words = norm.split(" ").filter(Boolean);
  if (!words.length) return [...variants];
  
  const lastWord = words[words.length - 1];
  const singLast = singularize(lastWord);
  const plurLast = pluralize(lastWord);
  
  if (singLast !== lastWord) {
    variants.add([...words.slice(0, -1), singLast].join(" "));
  }
  if (plurLast !== lastWord) {
    variants.add([...words.slice(0, -1), plurLast].join(" "));
  }
  if (words.length === 1) {
    variants.add(singLast);
    variants.add(plurLast);
  }
  return [...variants];
}

export function getCatalogVariants(catalog: Product[]): ProductVariantMatch[] {
  return catalog.map(p => {
    const norm = normalizeName(p.name);
    return {
      product: p,
      normalized: norm,
      variants: getProductVariants(norm)
    };
  });
}

const STOPWORDS = new Set(["the", "my", "a", "an", "some", "of", "for", "to", "on", "in", "into", "shopping", "list", "cart", "card", "and"]);

export function matchProductByNameToken(rawInput: string, catalog: Product[]): Product | null {
  const sanitized = sanitizeImplicitCommand(rawInput);
  if (!sanitized) return null;
  
  const catalogVariants = getCatalogVariants(catalog);
  const resolved = resolveProductFromVariants(sanitized, catalogVariants);
  if (resolved) return resolved;
  
  const tokens = sanitized.split(" ").filter(t => !STOPWORDS.has(t));
  if (!tokens.length) return null;
  
  let bestMatch: { product: Product; score: number } | null = null;
  for (const item of catalogVariants) {
    const itemTokens = item.normalized.split(" ").map(singularizeNormalized);
    const overlap = tokens.filter(tok => itemTokens.includes(singularizeNormalized(tok)));
    if (!overlap.length) continue;
    
    const score = overlap.length;
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { product: item.product, score };
    }
  }
  
  return bestMatch?.product ?? null;
}

export function resolveProductFromVariants(text: string, catalogVariants: ProductVariantMatch[]): Product | null {
  const normalized = normalizeName(text);
  if (!normalized) return null;
  
  let match: { product: Product; score: number } | null = null;
  
  for (const entry of catalogVariants) {
    for (const v of entry.variants) {
      if (new RegExp(`\\b${escapeRegex(v)}\\b`, "i").test(normalized)) {
        const score = v.length + (v === entry.normalized ? 10 : 0);
        if (!match || score > match.score) {
          match = { product: entry.product, score };
        }
      }
    }
  }
  if (match) return match.product;
  
  if (/\bmilk\b/.test(normalized)) {
    const almond = catalogVariants.find(c => c.normalized === "almond milk");
    const whole = catalogVariants.find(c => c.normalized === "whole milk");
    if (/\balmond\b/.test(normalized) && almond) return almond.product;
    if (/\bwhole\b/.test(normalized) && whole || whole) return whole.product;
  }
  
  return null;
}

export function sanitizeImplicitCommand(text: string): string {
  return normalizeName(text)
    .replace(/^\s*(hello|hi|hey)\b/g, " ")
    .replace(/\b(please|kindly|uh|um)\b/g, " ")
    .replace(/\b(in|into|to|on)\s+(the\s+)?(shopping\s+)?(cart|card|list)\b/g, " ")
    .replace(/\b(add|need|buy|get|put|include)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isImplicitAddCommand(text: string): boolean {
  const sanitized = sanitizeImplicitCommand(text);
  if (!sanitized) return false;
  
  if (/\b(remove|delete|drop|cancel|change|set|update|find|search|look|show|clear|reset|help)\b/.test(sanitized)) {
    return false;
  }
  
  return (
    /\b(add|need|buy|get|put|include|cart|card|list|shopping)\b/.test(sanitized) ||
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|an|a|\d+)\b/.test(sanitized) ||
    /\band\b|,/.test(sanitized)
  );
}

export function parseImplicitMultipleItems(text: string, lang: string, catalog: Product[]): { item: string; qty: number }[] {
  const sanitized = sanitizeImplicitCommand(text);
  if (!sanitized || !isImplicitAddCommand(sanitized)) {
    return [];
  }
  
  const catalogVariants = getCatalogVariants(catalog);
  const bySplit = parseSplitPhrases(sanitized, lang, catalogVariants);
  const byVariant = parseContiguousVariants(sanitized, lang, catalog);
  
  if (!bySplit.length) return byVariant;
  if (!byVariant.length) return bySplit;
  
  const merged = new Map<string, number>();
  for (const entry of bySplit) {
    merged.set(entry.item, entry.qty);
  }
  for (const entry of byVariant) {
    merged.set(entry.item, Math.max(merged.get(entry.item) ?? 0, entry.qty));
  }
  
  return [...merged.entries()].map(([item, qty]) => ({ item, qty }));
}

export function parseSplitPhrases(text: string, lang: string, catalogVariants: ProductVariantMatch[]): { item: string; qty: number }[] {
  const phrases = text.split(/\b(?:and|plus|also)\b|,/gi).map(p => p.trim()).filter(Boolean);
  if (!phrases.length) return [];
  
  const matches: { item: string; qty: number }[] = [];
  for (const phrase of phrases) {
    const product = resolveProductFromVariants(phrase, catalogVariants);
    if (!product) continue;
    const qty = parsePrecedingQuantity(phrase, lang);
    matches.push({ item: product.name, qty: Math.max(1, qty) });
  }
  return matches;
}

export function parseContiguousVariants(text: string, lang: string, catalog: Product[]): { item: string; qty: number }[] {
  const catalogVariants = getCatalogVariants(catalog);
  const sortedVariants = catalogVariants
    .flatMap(cv => cv.variants.map(v => ({ product: cv.product, variant: v })))
    .sort((a, b) => b.variant.length - a.variant.length);
    
  const occurrences: { product: Product; start: number; end: number; qty: number }[] = [];
  
  for (const entry of sortedVariants) {
    const regex = new RegExp(`\\b${escapeRegex(entry.variant)}\\b`, "gi");
    let match;
    while ((match = regex.exec(text))) {
      const start = match.index;
      const end = start + entry.variant.length;
      
      if (occurrences.some(o => start < o.end && end > o.start)) {
        continue;
      }
      
      const precedingSegment = text.slice(Math.max(0, start - 24), start);
      const qty = parsePrecedingQuantity(precedingSegment, lang);
      occurrences.push({ product: entry.product, start, end, qty });
    }
  }
  
  if (!occurrences.length) return [];
  
  occurrences.sort((a, b) => a.start - b.start);
  const results = new Map<string, number>();
  for (const occ of occurrences) {
    results.set(occ.product.name, (results.get(occ.product.name) ?? 0) + Math.max(1, occ.qty));
  }
  
  return [...results.entries()].map(([item, qty]) => ({ item, qty }));
}
