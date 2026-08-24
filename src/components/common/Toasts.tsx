import React from "react";
import { ToastItem } from "../../types";

type ToastsProps = {
  items: ToastItem[];
  onDismiss: (id: string) => void;
};

export const Toasts: React.FC<ToastsProps> = ({ items, onDismiss }) => {
  return (
    <div className="toasts" aria-live="polite" aria-relevant="additions">
      {items.map(item => (
        <div className={`toast toast--${item.kind}`} key={item.id}>
          <div className="toast__body">
            <div className="toast__title">{item.title}</div>
            {item.detail ? (
              <div className="toast__detail">{item.detail}</div>
            ) : null}
          </div>
          <button
            className="btn btn--ghost"
            onClick={() => onDismiss(item.id)}
            aria-label={`Dismiss ${item.title}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
