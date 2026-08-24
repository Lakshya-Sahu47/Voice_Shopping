import { normalizeName } from "./nlp";

export type HistoryStore = Record<string, number[]>; // normalized -> timestamps

export type HistorySuggestion = {
  item: string;
  reason: string;
  kind: "history";
};

export function recordPurchase(history: HistoryStore, itemName: string, timestamp: number): HistoryStore {
  const norm = normalizeName(itemName);
  const existing = history[norm] ?? [];
  const updated = [...existing, timestamp].slice(-10); // Keep last 10 purchases
  return {
    ...history,
    [norm]: updated
  };
}

export function calculateAverageIntervalDays(timestamps: number[]): number | null {
  if (timestamps.length < 2) return null;
  
  const sorted = [...timestamps].sort((a, b) => a - b);
  const diffs: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    diffs.push(sorted[i] - sorted[i - 1]);
  }
  
  const averageMs = diffs.reduce((sum, val) => sum + val, 0) / diffs.length;
  return averageMs / (1000 * 60 * 60 * 24);
}

export function getRunningLowSuggestions(
  history: HistoryStore,
  activeItemsSet: Set<string>,
  now: number
): { item: string; reason: string }[] {
  const suggestions: { item: string; reason: string }[] = [];
  
  for (const [item, timestamps] of Object.entries(history)) {
    if (activeItemsSet.has(item) || timestamps.length < 2) {
      continue;
    }
    
    const avg = calculateAverageIntervalDays(timestamps);
    const lastPurchase = Math.max(...timestamps);
    const daysSince = (now - lastPurchase) / (1000 * 60 * 60 * 24);
    
    // Clamp average interval between 3 and 21 days, defaulting to 7 if invalid/null
    const intervalClamp = avg && Number.isFinite(avg) 
      ? Math.min(21, Math.max(3, avg)) 
      : 7;
      
    if (daysSince >= intervalClamp * 1.2) {
      suggestions.push({
        item,
        reason: `You usually buy this every ~${Math.round(intervalClamp)} days (last purchased ${Math.round(daysSince)} days ago).`
      });
    }
  }
  
  // Sort suggestions by total frequency of purchase (descending)
  return suggestions
    .sort((a, b) => {
      const lenA = history[a.item]?.length ?? 0;
      const lenB = history[b.item]?.length ?? 0;
      return lenB - lenA;
    })
    .slice(0, 6);
}
