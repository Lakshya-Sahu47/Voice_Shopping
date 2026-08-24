import React from "react";
import { LogEvent } from "../../types";

type ActionLogProps = {
  events: LogEvent[];
};

function getEventIconAndStyle(message: string): { icon: string; color: string } {
  const lowercase = message.toLowerCase();
  
  if (lowercase.startsWith("added")) {
    return { icon: "📥", color: "var(--primary)" };
  }
  if (lowercase.startsWith("removed") || lowercase.startsWith("deleted")) {
    return { icon: "🗑️", color: "var(--danger)" };
  }
  if (lowercase.startsWith("updated") || lowercase.startsWith("qty")) {
    return { icon: "🔢", color: "#e2b13c" };
  }
  if (lowercase.startsWith("purchased") || lowercase.startsWith("marked purchased")) {
    return { icon: "✅", color: "var(--primary)" };
  }
  if (lowercase.startsWith("unmarked")) {
    return { icon: "↩️", color: "var(--muted)" };
  }
  if (lowercase.startsWith("search")) {
    return { icon: "🔍", color: "#3fa9f5" };
  }
  if (lowercase.startsWith("list cleared") || lowercase.startsWith("cleared")) {
    return { icon: "🧹", color: "var(--danger)" };
  }
  if (lowercase.startsWith("help")) {
    return { icon: "ℹ️", color: "#ab7cf6" };
  }
  if (lowercase.startsWith("unavailable") || lowercase.startsWith("out of stock")) {
    return { icon: "⚠️", color: "var(--danger)" };
  }

  // Speak command or others
  return { icon: "🎙️", color: "var(--primary)" };
}

export const ActionLog: React.FC<ActionLogProps> = ({ events }) => {
  return (
    <div className="card">
      <h2 className="label" style={{ fontSize: 16, margin: "0 0 4px 0" }}>Recent Activity</h2>
      <div className="hint" style={{ marginBottom: 16 }}>Timeline of your voice commands and adjustments.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative", paddingLeft: 12 }}>
        
        {/* Vertical timeline line */}
        {events.length > 1 && (
          <div style={{
            position: "absolute",
            left: 19,
            top: 10,
            bottom: 10,
            width: 2,
            background: "var(--border)",
            zIndex: 0
          }} />
        )}

        {events.length === 0 ? (
          <div className="muted" style={{ fontSize: 13, paddingLeft: 8 }}>
            Timeline is empty. Try speaking a command to see it here.
          </div>
        ) : (
          events.map((event) => {
            const { icon, color } = getEventIconAndStyle(event.message);
            const timeStr = new Date(event.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            return (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  position: "relative",
                  zIndex: 1
                }}
              >
                {/* Timeline circle icon */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#161d2d",
                    border: `1.5px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                >
                  {icon}
                </div>

                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e7eef8" }}>
                    {event.message}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {timeStr}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
