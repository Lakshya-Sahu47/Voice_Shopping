export type SeasonalItem = {
  item: string;
  note: string;
};

export const SEASONAL_CATALOG: Record<number, SeasonalItem[]> = {
  1: [
    { item: "oranges", note: "citrus season" },
    { item: "spinach", note: "winter greens" }
  ],
  2: [
    { item: "oranges", note: "citrus season" },
    { item: "tomatoes", note: "good deals" }
  ],
  3: [
    { item: "mango", note: "early season" },
    { item: "lettuce", note: "fresh produce" }
  ],
  4: [
    { item: "mango", note: "in season" },
    { item: "avocado", note: "great for salads" }
  ],
  5: [
    { item: "mango", note: "peak season" },
    { item: "watermelon", note: "summer staple" }
  ],
  6: [
    { item: "watermelon", note: "hot weather pick" },
    { item: "bananas", note: "great smoothies" }
  ],
  7: [
    { item: "tomatoes", note: "summer harvest" },
    { item: "corn", note: "grilling season" }
  ],
  8: [
    { item: "apples", note: "early harvest" },
    { item: "spinach", note: "back on shelves" }
  ],
  9: [
    { item: "apples", note: "peak apple season" },
    { item: "pumpkin", note: "seasonal baking" }
  ],
  10: [
    { item: "apples", note: "great pies" },
    { item: "oranges", note: "early citrus" }
  ],
  11: [
    { item: "oranges", note: "citrus returns" },
    { item: "potatoes", note: "holiday staples" }
  ],
  12: [
    { item: "oranges", note: "winter citrus" },
    { item: "tomatoes", note: "sale season" }
  ]
};

export function getSeasonalSuggestions(date: Date = new Date()): SeasonalItem[] {
  const month = date.getMonth() + 1; // getMonth is 0-indexed
  return SEASONAL_CATALOG[month] ?? [];
}
