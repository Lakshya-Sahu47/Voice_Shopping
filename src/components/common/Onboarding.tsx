import React from "react";

type OnboardingProps = {
  onComplete: () => void;
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="card" style={{ maxWidth: 500, margin: "40px auto", padding: 24, textAlign: "center" }}>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 8px 0", color: "var(--primary)" }}>
        Welcome to Voice Shopping
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5, margin: "0 0 20px 0" }}>
        Build your grocery shopping list completely hands-free. Just speak your actions, and let the assistant categorize and organize everything for you.
      </p>

      <div style={{ textAlign: "left", margin: "24px 0", padding: "16px 20px", borderRadius: 14, background: "#0003", border: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--primary)" }}>
          Try saying commands like:
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
          <li>
            🎙️ <strong className="mono">"Add 2 whole milks"</strong>
          </li>
          <li>
            🎙️ <strong className="mono">"Buy whole wheat bread and 3 organic apples"</strong>
          </li>
          <li>
            🎙️ <strong className="mono">"Mark whole milk as purchased"</strong>
          </li>
          <li>
            🎙️ <strong className="mono">"Find organic toothpaste under $5"</strong>
          </li>
          <li>
            🎙️ <strong className="mono">"Change gala apples to 5"</strong>
          </li>
          <li>
            🎙️ <strong className="mono">"Remove gala apples"</strong>
          </li>
        </ul>
      </div>

      <button className="btn btn--primary" onClick={onComplete} style={{ width: "100%", padding: 12, fontSize: 15, fontWeight: 700 }}>
        Get Started
      </button>
    </div>
  );
};
