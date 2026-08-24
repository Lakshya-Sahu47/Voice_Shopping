export type CategoryMapping = {
  category: string;
  keywords: string[];
};

export const CATEGORIES: CategoryMapping[] = [
  {
    category: "Dairy",
    keywords: ["milk", "cheese", "yogurt", "butter"]
  },
  {
    category: "Produce",
    keywords: [
      "apple", "apples", "banana", "bananas", "orange", "oranges",
      "tomato", "tomatoes", "spinach", "lettuce", "onion", "onions",
      "potato", "potatoes", "mango", "mangos", "avocado"
    ]
  },
  {
    category: "Bakery",
    keywords: ["bread", "bun", "buns", "bagel", "bagels"]
  },
  {
    category: "Meat & Seafood",
    keywords: ["chicken", "fish", "salmon", "shrimp", "mutton", "beef", "prawns"]
  },
  {
    category: "Pantry",
    keywords: ["rice", "pasta", "lentils", "dal", "beans", "flour", "oil", "salt", "sugar", "spices"]
  },
  {
    category: "Snacks",
    keywords: ["chips", "cookies", "biscuits", "chocolate"]
  },
  {
    category: "Beverages",
    keywords: ["water", "juice", "coffee", "tea"]
  },
  {
    category: "Household",
    keywords: ["detergent", "soap", "paper towels", "tissues"]
  },
  {
    category: "Personal Care",
    keywords: ["toothpaste", "shampoo", "conditioner"]
  }
];

export function categorize(normalizedName: string): string {
  for (const mapping of CATEGORIES) {
    for (const kw of mapping.keywords) {
      if (normalizedName.includes(kw)) {
        return mapping.category;
      }
    }
  }
  return "Other";
}
