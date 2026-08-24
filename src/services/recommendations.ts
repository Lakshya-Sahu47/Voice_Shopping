import { SupermarketProduct, SUPERMARKET_PRODUCTS } from "../data/supermarketProducts";
import { Product } from "../types";
import { getActiveCatalog } from "../data/productCatalog";
import { normalizeName } from "../utils/nlp";

export type SuggestionConstraint = {
  cheap?: boolean;
  healthy?: boolean;
  filling?: boolean;
  salty?: boolean;
  sweet?: boolean;
  breakfast?: boolean;
  snack?: boolean;
  maxPriceInr?: number;
};

export class RecommendationEngine {
  static getConstrainedSuggestions(constraints: SuggestionConstraint): SupermarketProduct[] {
    return SUPERMARKET_PRODUCTS.filter((product) => {
      // 1. Max Price Constraint
      if (typeof constraints.maxPriceInr === "number") {
        if (product.pricing.sellingPrice > constraints.maxPriceInr) {
          return false;
        }
      }

      // 2. Tag Matching (If any tag is requested, at least one must match)
      let requestedTagCount = 0;
      let matchedTagCount = 0;

      if (constraints.cheap) {
        requestedTagCount++;
        // Classify items under 80 INR or with cheap tags as cheap
        if (product.pricing.sellingPrice < 80 || product.tags.includes("cheap")) {
          matchedTagCount++;
        }
      }
      if (constraints.healthy) {
        requestedTagCount++;
        if (product.tags.includes("healthy")) {
          matchedTagCount++;
        }
      }
      if (constraints.filling) {
        requestedTagCount++;
        if (product.tags.includes("filling")) {
          matchedTagCount++;
        }
      }
      if (constraints.salty) {
        requestedTagCount++;
        if (product.tags.includes("salty")) {
          matchedTagCount++;
        }
      }
      if (constraints.sweet) {
        requestedTagCount++;
        if (product.tags.includes("sweet")) {
          matchedTagCount++;
        }
      }
      if (constraints.breakfast) {
        requestedTagCount++;
        if (product.tags.includes("breakfast")) {
          matchedTagCount++;
        }
      }
      if (constraints.snack) {
        requestedTagCount++;
        if (product.tags.includes("snack")) {
          matchedTagCount++;
        }
      }

      // If constraints were requested, the product must match all of them
      if (requestedTagCount > 0 && matchedTagCount < requestedTagCount) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort cheap items first if cheap requested, otherwise sort by price ascending
      if (constraints.cheap) {
        return a.pricing.sellingPrice - b.pricing.sellingPrice;
      }
      return b.tags.length - a.tags.length; // rank by amount of tags
    });
  }

  // Get simple explainable reasons for constraints matches
  static getConstraintExplanation(product: SupermarketProduct, constraints: SuggestionConstraint): string {
    const reasons: string[] = [];
    if (constraints.cheap && (product.pricing.sellingPrice < 80 || product.tags.includes("cheap"))) {
      reasons.push("inexpensive");
    }
    if (constraints.filling && product.tags.includes("filling")) {
      reasons.push("filling");
    }
    if (constraints.healthy && product.tags.includes("healthy")) {
      reasons.push("healthy");
    }
    if (constraints.salty && product.tags.includes("salty")) {
      reasons.push("salty snack option");
    }
    if (constraints.sweet && product.tags.includes("sweet")) {
      reasons.push("sweet treat");
    }
    if (constraints.breakfast && product.tags.includes("breakfast")) {
      reasons.push("great for breakfast");
    }
    if (constraints.snack && product.tags.includes("snack")) {
      reasons.push("good snack option");
    }
    if (typeof constraints.maxPriceInr === "number") {
      reasons.push(`under ₹${constraints.maxPriceInr} (selling price ₹${product.pricing.sellingPrice})`);
    }

    if (reasons.length === 0) {
      return `${product.name} is a good option.`;
    }
    
    const desc = reasons.join(" and ");
    return `${product.name} (selling price ₹${product.pricing.sellingPrice}) is ${desc}.`;
  }
}

// -------------------------------------------------------------
// V3 Substitute Ranker (Kept internally for out-of-stock flows)
// -------------------------------------------------------------

export type RankedSubstitute = {
  product: Product;
  score: number;
  reason: string;
};

export class SubstituteRanker {
  static rankSubstitutes(
    unavailableProduct: Product,
    overrides: Record<string, boolean>,
    candidates: string[]
  ): RankedSubstitute[] {
    const activeCatalog = getActiveCatalog(overrides);
    const ranked: RankedSubstitute[] = [];

    for (const candidateName of candidates) {
      const normCandidate = normalizeName(candidateName);
      
      const product = activeCatalog.find(
        (p) => normalizeName(p.name).includes(normCandidate) || normCandidate.includes(normalizeName(p.name))
      );

      if (!product || !product.available) {
        continue;
      }

      let score = 50;
      const reasons: string[] = ["Same category"];

      const priceDiff = Math.abs(product.priceUsd - unavailableProduct.priceUsd);
      if (priceDiff <= 0.5) {
        score += 30;
        reasons.push("Very similar price");
      } else if (priceDiff <= 1.5) {
        score += 15;
        reasons.push("Reasonably priced alternative");
      } else {
        score -= 10;
        reasons.push(product.priceUsd < unavailableProduct.priceUsd ? "Cheaper option" : "More expensive option");
      }

      if (product.brand === unavailableProduct.brand) {
        score += 20;
        reasons.push("Same brand");
      }

      ranked.push({
        product,
        score,
        reason: reasons.join(", ")
      });
    }

    return ranked.sort((a, b) => b.score - a.score);
  }
}
