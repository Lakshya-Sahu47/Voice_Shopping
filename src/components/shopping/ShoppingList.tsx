import React from "react";
import { ListItem } from "../../types";
import { titleCase } from "../../utils/nlp";
import { SUPERMARKET_PRODUCTS } from "../../data/supermarketProducts";

type ShoppingListProps = {
  items: ListItem[];
  onRemove: (id: string) => void;
  onQty: (id: string, qty: number) => void;
  onTogglePurchased: (id: string) => void;
};

function groupItemsByCategory(items: ListItem[]): Record<string, ListItem[]> {
  const groups: Record<string, ListItem[]> = {
    Produce: [],
    Dairy: [],
    Bakery: [],
    "Meat & Seafood": [],
    Pantry: [],
    Snacks: [],
    Beverages: [],
    Household: [],
    Personal: [],
    Others: []
  };

  items.forEach((item) => {
    const cat = item.category;
    if (groups[cat]) {
      groups[cat].push(item);
    } else {
      groups.Others.push(item);
    }
  });

  return groups;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onRemove,
  onQty,
  onTogglePurchased
}) => {
  const categories = groupItemsByCategory(items);
  const activeCategories = Object.keys(categories).filter(
    (cat) => categories[cat].length > 0
  );

  return (
    <div className="shopping-list" style={{ marginTop: 24 }}>
      <h2 className="label" style={{ fontSize: 14, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Your Shopping List
      </h2>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <span className="muted" style={{ fontSize: 14 }}>Your list is empty. Say "Add apples" or type a command to start.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activeCategories.map((category) => (
            <div key={category} className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", borderBottom: "1px solid var(--border)", paddingBottom: 6, marginBottom: 12 }}>
                {category}
              </div>
              
              {categories[category].map((item) => {
                // Find matching product in database for V3 pricing displays
                const prod = SUPERMARKET_PRODUCTS.find(
                  (p) => p.name.toLowerCase() === item.normalized || p.aliases.some(alias => alias.toLowerCase() === item.normalized)
                );
                const priceText = prod
                  ? `₹${(prod.pricing.sellingPrice * item.qty).toFixed(0)}`
                  : "";

                return (
                  <div
                    key={item.id}
                    className="list-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 0",
                      opacity: item.purchasedAt ? 0.5 : 1,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)"
                    }}
                  >
                    <button
                      className="checkbox"
                      onClick={() => onTogglePurchased(item.id)}
                      role="checkbox"
                      aria-checked={!!item.purchasedAt}
                      aria-label={`Mark ${item.name} as purchased`}
                      style={{ fontSize: 14, fontWeight: 800, width: 28, height: 28, flexShrink: 0 }}
                    >
                      {item.purchasedAt ? "✓" : ""}
                    </button>
                    
                    <div className="list__main" style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="list__name" style={{ fontSize: 15, fontWeight: 700, textDecoration: item.purchasedAt ? "line-through" : "none" }}>
                          {titleCase(item.name)}
                        </div>
                        {priceText && (
                          <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", marginRight: 8 }}>
                            {priceText}
                          </div>
                        )}
                      </div>
                      <div className="list__meta" style={{ fontSize: 12, color: "var(--muted)" }}>
                        Quantity: {item.qty}{item.unit ? ` ${item.unit}` : ""}
                      </div>
                    </div>

                    <div className="row" style={{ gap: 6, flexShrink: 0 }}>
                      <button
                        className="btn btn--ghost"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => onQty(item.id, Math.max(1, item.qty - 1))}
                        style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                      >
                        −
                      </button>
                      <button
                        className="btn btn--ghost"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => onQty(item.id, item.qty + 1)}
                        style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                      >
                        +
                      </button>
                      <button
                        className="btn btn--ghost"
                        aria-label={`Remove ${item.name} from list`}
                        onClick={() => onRemove(item.id)}
                        style={{ color: "var(--danger)", borderColor: "transparent" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
