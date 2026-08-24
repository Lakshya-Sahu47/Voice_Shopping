import React from "react";

type SettingsPanelProps = {
  lang: string;
  onLangChange: (lang: string) => void;
  voiceFeedback: boolean;
  onVoiceFeedbackToggle: (enabled: boolean) => void;
  onClose: () => void;
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  lang,
  onLangChange,
  voiceFeedback,
  onVoiceFeedbackToggle,
  onClose
}) => {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row row--space" style={{ marginBottom: 16 }}>
        <div className="label" style={{ fontSize: 16 }}>Settings</div>
        <button className="btn btn--ghost" onClick={onClose} aria-label="Close settings">
          ✕
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label" htmlFor="settings-lang" style={{ display: "block", marginBottom: 6 }}>
            Recognition Language
          </label>
          <select
            id="settings-lang"
            className="select"
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
          >
            <option value="en-US">English (US)</option>
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi (Devanagari)</option>
            <option value="es-ES">Español</option>
            <option value="fr-FR">Français</option>
          </select>
        </div>

        <div>
          <div className="label" style={{ marginBottom: 6 }}>Accessibility & Feedback</div>
          <label className="row" style={{ gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={voiceFeedback}
              onChange={(e) => onVoiceFeedbackToggle(e.target.checked)}
            />
            <span style={{ fontSize: 14 }}>Enable voice feedback (Text-to-Speech confirmations)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
