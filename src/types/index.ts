export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  priceUsd: number;
  size?: string;
  tags: string[];
  available: boolean;
};

export type ListItem = {
  id: string;
  name: string;
  normalized: string;
  qty: number;
  unit?: string; // V3 addition
  category: string;
  addedAt: number;
  updatedAt: number;
  purchasedAt?: number;
};

export type LogEvent = {
  id: string;
  ts: number;
  message: string;
};

export type ToastItem = {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  detail?: string;
};

export type SearchQuery = {
  term: string;
  brand?: string;
  maxPriceUsd?: number;
  tags?: string[];
};

export type Recommendation = {
  productId: string;
  name: string;
  score: number;
  reason: string;
  kind: "history" | "seasonal";
};

import { SupermarketProduct } from "../data/supermarketProducts";

export type ConversationContext = {
  pendingAction?: "ADD_ITEM" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "SUGGEST_CONFIRMATION" | "SEARCH_SELECTION";
  pendingItem?: string;
  pendingQty?: number;
  pendingUnit?: string;
  suggestedItems?: string[]; // Holds recommended items awaiting confirmation
  lastSearchResults?: SupermarketProduct[]; // V3 Voice Search options list
};

export type IntentResult =
  | { type: "ADD_ITEM"; items: { name: string; qty: number; unit?: string }[]; confidence: "high" | "low" }
  | { type: "REMOVE_ITEM"; item: string; confidence: "high" | "low" }
  | { type: "UPDATE_QUANTITY"; item: string; qty: number; unit?: string; confidence: "high" | "low" }
  | { type: "COMPLETE_ITEM"; item: string; confidence: "high" | "low" }
  | { type: "SEARCH"; term: string; minPriceInr?: number; maxPriceInr?: number; brand?: string; tags?: string[]; packageSize?: string; confidence: "high" | "low" }
  | { type: "SUGGEST"; constraints: { cheap?: boolean; healthy?: boolean; filling?: boolean; salty?: boolean; sweet?: boolean; breakfast?: boolean; snack?: boolean; maxPriceInr?: number }; confidence: "high" }
  | { type: "CLEAR_LIST"; confidence: "high" }
  | { type: "HELP"; confidence: "high" }
  | { type: "CONFIRM_YES"; confidence: "high" }
  | { type: "CONFIRM_NO"; confidence: "high" }
  | { type: "UNKNOWN"; raw: string; confidence: "low" };

