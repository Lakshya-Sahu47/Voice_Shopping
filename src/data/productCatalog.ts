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

export const CATALOG: Product[] = [
  {
    id: "p_milk_1",
    name: "Whole Milk",
    category: "Dairy",
    brand: "DairyPure",
    priceUsd: 3.79,
    size: "1 gal",
    tags: ["regular"],
    available: true
  },
  {
    id: "p_milk_2",
    name: "Almond Milk",
    category: "Dairy",
    brand: "Silk",
    priceUsd: 3.99,
    size: "64 oz",
    tags: ["substitute", "vegan"],
    available: true
  },
  {
    id: "p_bread_1",
    name: "Whole Wheat Bread",
    category: "Bakery",
    brand: "Nature's Own",
    priceUsd: 2.89,
    size: "20 oz",
    tags: ["whole wheat"],
    available: true
  },
  {
    id: "p_eggs_1",
    name: "Eggs",
    category: "Dairy",
    brand: "Generic",
    priceUsd: 3.49,
    size: "12 ct",
    tags: [],
    available: true
  },
  {
    id: "p_apples_1",
    name: "Organic Apples",
    category: "Produce",
    brand: "FreshFarm",
    priceUsd: 4.99,
    size: "3 lb bag",
    tags: ["organic"],
    available: true
  },
  {
    id: "p_apples_2",
    name: "Gala Apples",
    category: "Produce",
    brand: "FreshFarm",
    priceUsd: 2.49,
    size: "1 lb",
    tags: [],
    available: true
  },
  {
    id: "p_bananas_1",
    name: "Bananas",
    category: "Produce",
    brand: "Chiquita",
    priceUsd: 1.29,
    size: "1 lb",
    tags: [],
    available: true
  },
  {
    id: "p_oranges_1",
    name: "Oranges",
    category: "Produce",
    brand: "CitrusCo",
    priceUsd: 3.19,
    size: "3 lb bag",
    tags: [],
    available: true
  },
  {
    id: "p_rice_1",
    name: "Basmati Rice",
    category: "Pantry",
    brand: "Daawat",
    priceUsd: 12.99,
    size: "10 lb",
    tags: [],
    available: true
  },
  {
    id: "p_water_1",
    name: "Bottled Water",
    category: "Beverages",
    brand: "Aquafina",
    priceUsd: 4.99,
    size: "24 pk",
    tags: [],
    available: true
  },
  {
    id: "p_toothpaste_1",
    name: "Toothpaste",
    category: "Personal Care",
    brand: "Colgate",
    priceUsd: 3.99,
    size: "6 oz",
    tags: [],
    available: true
  },
  {
    id: "p_toothpaste_2",
    name: "Herbal Toothpaste",
    category: "Personal Care",
    brand: "Himalaya",
    priceUsd: 2.49,
    size: "5.3 oz",
    tags: ["herbal"],
    available: true
  },
  {
    id: "p_detergent_1",
    name: "Laundry Detergent",
    category: "Household",
    brand: "Tide",
    priceUsd: 10.99,
    size: "92 oz",
    tags: [],
    available: true
  },
  {
    id: "p_spinach_1",
    name: "Spinach",
    category: "Produce",
    brand: "GreenLeaf",
    priceUsd: 2.99,
    size: "10 oz",
    tags: [],
    available: true
  },
  {
    id: "p_tomatoes_1",
    name: "Tomatoes",
    category: "Produce",
    brand: "VineRipe",
    priceUsd: 2.29,
    size: "1 lb",
    tags: [],
    available: true
  }
];

export function getActiveCatalog(overrides?: Record<string, boolean>): Product[] {
  if (!overrides || Object.keys(overrides).length === 0) {
    return CATALOG;
  }
  return CATALOG.map(p => {
    return overrides[p.id] === undefined ? p : { ...p, available: overrides[p.id] };
  });
}
