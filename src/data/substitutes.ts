export const SUBSTITUTES_MAP: Record<string, string[]> = {
  milk: ["almond milk", "oat milk", "lactose free milk"],
  bread: ["whole wheat bread", "multigrain bread", "gluten free bread"],
  toothpaste: ["herbal toothpaste"]
};

export function getSubstituteKey(normalizedItemName: string): string | null {
  const keys = Object.keys(SUBSTITUTES_MAP);
  for (const k of keys) {
    if (normalizedItemName.includes(k) || k.includes(normalizedItemName)) {
      return k;
    }
  }
  return null;
}
