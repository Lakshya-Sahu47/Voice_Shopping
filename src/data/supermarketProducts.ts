export type ProductPricing = {
  mrp: number;
  discountPercent: number;
  sellingPrice: number;
  unit: string;
};

export type SupermarketProduct = {
  id: string;
  name: string;
  category: string;
  brand?: string;
  packageSize?: string;
  aliases: string[];
  pricing: ProductPricing;
  tags: string[]; // cheap, healthy, filling, breakfast, snack, quick, sweet, salty, organic, seasonal
  availability: boolean;
};

export const SUPERMARKET_PRODUCTS: SupermarketProduct[] = [
  // --- FRUITS ---
  {
    id: "fr_apple_organic",
    name: "Organic Apples",
    category: "Fruits",
    brand: "Organic Valley",
    packageSize: "1 kg",
    aliases: ["apples", "sev", "seb", "apple", "organic apple"],
    pricing: { mrp: 200, discountPercent: 10, sellingPrice: 180, unit: "kg" },
    tags: ["fruit", "healthy", "quick", "snack", "organic"],
    availability: true
  },
  {
    id: "fr_banana",
    name: "Bananas",
    category: "Fruits",
    brand: "FreshPick",
    packageSize: "1 dozen",
    aliases: ["banana", "kela", "kele", "kelaa"],
    pricing: { mrp: 60, discountPercent: 16.67, sellingPrice: 50, unit: "dozen" },
    tags: ["fruit", "cheap", "healthy", "filling", "breakfast", "quick", "snack", "sweet"],
    availability: true
  },
  {
    id: "fr_mango",
    name: "Mangoes",
    category: "Fruits",
    brand: "Alphonso",
    packageSize: "1 kg",
    aliases: ["mango", "aam", "hafuz"],
    pricing: { mrp: 150, discountPercent: 20, sellingPrice: 120, unit: "kg" },
    tags: ["fruit", "healthy", "filling", "seasonal", "sweet"],
    availability: true
  },
  {
    id: "fr_papaya",
    name: "Papaya",
    category: "Fruits",
    brand: "FreshPick",
    packageSize: "1 kg",
    aliases: ["papayas", "papita"],
    pricing: { mrp: 80, discountPercent: 25, sellingPrice: 60, unit: "kg" },
    tags: ["fruit", "cheap", "healthy", "filling", "breakfast", "sweet"],
    availability: true
  },

  // --- VEGETABLES ---
  {
    id: "vg_potato",
    name: "Potato",
    category: "Vegetables",
    brand: "Local Farm",
    packageSize: "1 kg",
    aliases: ["potatoes", "aloo", "alu"],
    pricing: { mrp: 35, discountPercent: 14.28, sellingPrice: 30, unit: "kg" },
    tags: ["vegetable", "cheap", "filling"],
    availability: true
  },
  {
    id: "vg_onion",
    name: "Onions",
    category: "Vegetables",
    brand: "Local Farm",
    packageSize: "1 kg",
    aliases: ["onion", "pyaaz", "pyaz"],
    pricing: { mrp: 40, discountPercent: 12.5, sellingPrice: 35, unit: "kg" },
    tags: ["vegetable", "cheap"],
    availability: true
  },
  {
    id: "vg_tomato",
    name: "Tomatoes",
    category: "Vegetables",
    brand: "Local Farm",
    packageSize: "1 kg",
    aliases: ["tomato", "tamatar"],
    pricing: { mrp: 50, discountPercent: 20, sellingPrice: 40, unit: "kg" },
    tags: ["vegetable", "cheap", "healthy"],
    availability: true
  },
  {
    id: "vg_spinach",
    name: "Spinach",
    category: "Vegetables",
    brand: "Organic Valley",
    packageSize: "250 g",
    aliases: ["spinach", "palak"],
    pricing: { mrp: 30, discountPercent: 16.67, sellingPrice: 25, unit: "packet" },
    tags: ["vegetable", "cheap", "healthy", "organic"],
    availability: true
  },

  // --- DAIRY & EGGS ---
  {
    id: "dy_amul_milk",
    name: "Amul Milk",
    category: "Dairy & Eggs",
    brand: "Amul",
    packageSize: "1 L",
    aliases: ["milk", "doodh", "dudh", "amul milk", "litre milk", "liter milk"],
    pricing: { mrp: 60, discountPercent: 3.33, sellingPrice: 58, unit: "L" },
    tags: ["dairy", "cheap", "healthy", "filling", "breakfast"],
    availability: true
  },
  {
    id: "dy_milk_unavailable",
    name: "Regular Milk",
    category: "Dairy & Eggs",
    brand: "Mother Dairy",
    packageSize: "1 L",
    aliases: ["regular milk"],
    pricing: { mrp: 56, discountPercent: 0, sellingPrice: 56, unit: "L" },
    tags: ["dairy", "cheap", "filling"],
    availability: false // Marked unavailable to test substitute trigger
  },
  {
    id: "dy_almond_milk",
    name: "Almond Milk",
    category: "Dairy & Eggs",
    brand: "Raw Pressery",
    packageSize: "1 L",
    aliases: ["almond milk"],
    pricing: { mrp: 250, discountPercent: 20, sellingPrice: 200, unit: "L" },
    tags: ["dairy", "healthy", "breakfast"],
    availability: true
  },
  {
    id: "dy_curd",
    name: "Curd",
    category: "Dairy & Eggs",
    brand: "Amul",
    packageSize: "400 g",
    aliases: ["curd", "dahi", "yogurt"],
    pricing: { mrp: 50, discountPercent: 10, sellingPrice: 45, unit: "cup" },
    tags: ["dairy", "cheap", "healthy", "breakfast", "snack"],
    availability: true
  },
  {
    id: "dy_paneer",
    name: "Paneer",
    category: "Dairy & Eggs",
    brand: "Amul",
    packageSize: "200 g",
    aliases: ["paneer", "cottage cheese"],
    pricing: { mrp: 90, discountPercent: 5.56, sellingPrice: 85, unit: "packet" },
    tags: ["dairy", "healthy", "filling"],
    availability: true
  },
  {
    id: "dy_eggs",
    name: "Eggs",
    category: "Dairy & Eggs",
    brand: "Eggo",
    packageSize: "6 pieces",
    aliases: ["egg", "eggs", "ande", "anda"],
    pricing: { mrp: 50, discountPercent: 10, sellingPrice: 45, unit: "pack" },
    tags: ["dairy", "cheap", "healthy", "filling", "breakfast", "quick"],
    availability: true
  },

  // --- STAPLES & GRAINS ---
  {
    id: "st_atta",
    name: "Aashirvaad Atta",
    category: "Atta & Flour",
    brand: "Aashirvaad",
    packageSize: "5 kg",
    aliases: ["atta", "wheat flour", "aata", "ashirvaad atta"],
    pricing: { mrp: 280, discountPercent: 10, sellingPrice: 252, unit: "pack" },
    tags: ["staples", "filling"],
    availability: true
  },
  {
    id: "st_basmati_rice",
    name: "Basmati Rice",
    category: "Rice & Grains",
    brand: "India Gate",
    packageSize: "1 kg",
    aliases: ["basmati rice", "chawal", "rice", "basmati"],
    pricing: { mrp: 120, discountPercent: 15, sellingPrice: 102, unit: "kg" },
    tags: ["staples", "filling"],
    availability: true
  },
  {
    id: "st_oats",
    name: "Quaker Oats",
    category: "Rice & Grains",
    brand: "Quaker",
    packageSize: "500 g",
    aliases: ["oats", "oatmeal"],
    pricing: { mrp: 99, discountPercent: 19.19, sellingPrice: 80, unit: "packet" },
    tags: ["staples", "cheap", "healthy", "filling", "breakfast"],
    availability: true
  },
  {
    id: "st_toor_dal",
    name: "Toor Dal",
    category: "Pulses / Dal",
    brand: "Tata Sampann",
    packageSize: "1 kg",
    aliases: ["toor dal", "arhar dal", "dal", "peeli dal"],
    pricing: { mrp: 160, discountPercent: 12.5, sellingPrice: 140, unit: "kg" },
    tags: ["staples", "healthy", "filling"],
    availability: true
  },

  // --- SNACKS & BISCUITS ---
  {
    id: "sn_chips",
    name: "Lays Chips",
    category: "Snacks",
    brand: "Lays",
    packageSize: "50 g",
    aliases: ["chips", "wafer", "wafers", "potato chips", "salty chips"],
    pricing: { mrp: 20, discountPercent: 0, sellingPrice: 20, unit: "packet" },
    tags: ["snack", "cheap", "quick", "salty"],
    availability: true
  },
  {
    id: "sn_biscuits",
    name: "Good Day Cookies",
    category: "Biscuits",
    brand: "Britannia",
    packageSize: "100 g",
    aliases: ["biscuit", "biscuits", "cookies", "cookie"],
    pricing: { mrp: 30, discountPercent: 10, sellingPrice: 27, unit: "packet" },
    tags: ["snack", "cheap", "quick", "sweet"],
    availability: true
  },
  {
    id: "sn_peanuts",
    name: "Roasted Peanuts",
    category: "Namkeen",
    brand: "Haldirams",
    packageSize: "150 g",
    aliases: ["peanuts", "mungfali", "salty peanuts", "salted peanuts"],
    pricing: { mrp: 60, discountPercent: 8.33, sellingPrice: 55, unit: "packet" },
    tags: ["snack", "cheap", "filling", "salty", "quick"],
    availability: true
  },
  {
    id: "sn_chocolate_bar",
    name: "Dairy Milk Chocolate",
    category: "Chocolates",
    brand: "Cadbury",
    packageSize: "50 g",
    aliases: ["chocolate", "chocolates", "dairy milk", "sweet chocolate"],
    pricing: { mrp: 45, discountPercent: 11.11, sellingPrice: 40, unit: "packet" },
    tags: ["snack", "sweet", "quick"],
    availability: true
  },

  // --- INSTANT FOOD ---
  {
    id: "sn_maggie",
    name: "Maggi Noodles",
    category: "Noodles",
    brand: "Nestle",
    packageSize: "70 g",
    aliases: ["maggi", "maggie", "noodles", "instant noodles"],
    pricing: { mrp: 15, discountPercent: 0, sellingPrice: 15, unit: "packet" },
    tags: ["instant", "cheap", "filling", "quick", "salty"],
    availability: true
  },

  // --- BEVERAGES ---
  {
    id: "bv_tea_powder",
    name: "Taj Mahal Tea",
    category: "Tea",
    brand: "Taj Mahal",
    packageSize: "250 g",
    aliases: ["tea", "chai", "cha", "tea powder"],
    pricing: { mrp: 120, discountPercent: 8.33, sellingPrice: 110, unit: "packet" },
    tags: ["beverage", "quick", "breakfast"],
    availability: true
  },
  {
    id: "bv_coffee",
    name: "Nescafe Classic",
    category: "Coffee",
    brand: "Nescafe",
    packageSize: "50 g",
    aliases: ["coffee", "nescafe", "instant coffee"],
    pricing: { mrp: 95, discountPercent: 5.26, sellingPrice: 90, unit: "jar" },
    tags: ["beverage", "quick", "breakfast"],
    availability: true
  },
  {
    id: "bv_mineral_water",
    name: "Bisleri Water",
    category: "Beverages",
    brand: "Bisleri",
    packageSize: "1 L",
    aliases: ["water", "pani", "paani", "mineral water"],
    pricing: { mrp: 20, discountPercent: 0, sellingPrice: 20, unit: "bottle" },
    tags: ["beverage", "cheap", "healthy", "quick"],
    availability: true
  }
];

export function getProductByKeyword(keyword: string): SupermarketProduct | null {
  const normalized = keyword.toLowerCase().trim();
  
  // 1. Direct match or synonym match
  for (const product of SUPERMARKET_PRODUCTS) {
    if (
      product.name.toLowerCase() === normalized ||
      product.aliases.some((s) => s.toLowerCase() === normalized)
    ) {
      return product;
    }
  }

  // 2. Substring matching
  for (const product of SUPERMARKET_PRODUCTS) {
    if (
      product.name.toLowerCase().includes(normalized) ||
      product.aliases.some((s) => s.toLowerCase().includes(normalized))
    ) {
      return product;
    }
  }

  return null;
}
