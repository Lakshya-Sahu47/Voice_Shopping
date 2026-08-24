import React, { useState, useEffect, useCallback } from "react";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { Onboarding } from "./components/common/Onboarding";
import { SettingsPanel } from "./components/common/SettingsPanel";
import { Toasts } from "./components/common/Toasts";
import { VoiceBar } from "./components/voice/VoiceBar";
import { ShoppingList } from "./components/shopping/ShoppingList";
import { ActionLog } from "./components/activity/ActionLog";

import { useShoppingList } from "./hooks/useShoppingList";
import { useVoiceAssistant } from "./hooks/useVoiceAssistant";

export const App: React.FC = () => {
  const list = useShoppingList();
  
  const [showSettings, setShowSettings] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<boolean>(() => {
    return localStorage.getItem("svca:voicefeedback:v2") === "true";
  });

  // Save voice feedback settings to local storage
  useEffect(() => {
    localStorage.setItem("svca:voicefeedback:v2", String(voiceFeedback));
  }, [voiceFeedback]);

  // Voice confirmation TTS helper
  const speakText = useCallback((text: string) => {
    if (voiceFeedback && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = list.lang;
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceFeedback, list.lang]);

  // Wrap actions with Voice Feedback speaker
  const handleAddItemWithTTS = useCallback((name: string, qty: number, unit?: string) => {
    list.handleAddItem(name, qty, unit);
    const displayUnit = unit ? ` ${unit}` : "";
    speakText(`Added ${qty}${displayUnit} of ${name}`);
  }, [list, speakText]);

  const handleRemoveItemByNameWithTTS = useCallback((name: string) => {
    list.handleRemoveItemByName(name);
    speakText(`Removed ${name}`);
  }, [list, speakText]);

  const handleUpdateQtyByNameWithTTS = useCallback((name: string, qty: number, unit?: string) => {
    list.handleUpdateQtyByName(name, qty, unit);
    const displayUnit = unit ? ` ${unit}` : "";
    speakText(`Updated ${name} quantity to ${qty}${displayUnit}`);
  }, [list, speakText]);

  const handleCompleteItemByNameWithTTS = useCallback((name: string) => {
    list.handleCompleteItemByName(name);
    const matched = list.items.find(
      (i) => i.normalized.includes(name) || name.includes(i.normalized)
    );
    if (matched) {
      const stateMsg = matched.purchasedAt ? `Unmarked ${matched.name}` : `Purchased ${matched.name}`;
      speakText(stateMsg);
    }
  }, [list, speakText]);

  const handleClearListWithTTS = useCallback(() => {
    list.handleClearList();
    speakText("Cleared shopping list");
  }, [list, speakText]);

  // Initialize Voice Assistant Hook
  const voice = useVoiceAssistant({
    lang: list.lang,
    handleAddItem: handleAddItemWithTTS,
    handleRemoveItemByName: handleRemoveItemByNameWithTTS,
    handleUpdateQtyByName: handleUpdateQtyByNameWithTTS,
    handleCompleteItemByName: handleCompleteItemByNameWithTTS,
    handleClearList: handleClearListWithTTS,
    publishToast: list.publishToast,
    publishEvent: list.publishEvent,
    setSubstituteSuggestion: list.setSubstituteSuggestion
  });

  // Speak multi-turn clarification questions aloud
  useEffect(() => {
    if (voice.clarificationPrompt) {
      speakText(voice.clarificationPrompt);
    }
  }, [voice.clarificationPrompt, speakText]);

  if (!list.onboardingCompleted) {
    return (
      <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Onboarding onComplete={() => list.setOnboardingCompleted(true)} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="header">
          <div>
            <h1 className="header__title">🛒 Shopping Assistant</h1>
            <div className="header__subtitle">
              Intelligent, voice-first supermarket shopping list
            </div>
          </div>
          <div className="row">
            <button
              className="btn"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Toggle Settings Panel"
            >
              ⚙️ Settings
            </button>
            <button
              className="btn btn--danger"
              onClick={() => list.setOnboardingCompleted(false)}
              aria-label="Reset Onboarding Guide"
            >
              Reset Guide
            </button>
          </div>
        </header>

        {showSettings && (
          <div style={{ marginBottom: 20 }}>
            <SettingsPanel
              lang={list.lang}
              onLangChange={list.setLang}
              voiceFeedback={voiceFeedback}
              onVoiceFeedbackToggle={setVoiceFeedback}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}

        <main className="layout">
          {/* Main Voice Control & Shopping List Area */}
          <div className="col" style={{ flex: 1.5 }}>
            <VoiceBar
              lang={list.lang}
              onUtterance={voice.handleUtterance}
              onCompatibilityIssue={(msg) => list.publishToast({ kind: "info", title: "Speech Engine", detail: msg })}
              voiceState={voice.voiceState}
              setVoiceState={voice.setVoiceState}
              transcriptFeedback={voice.transcriptFeedback}
              setTranscriptFeedback={voice.setTranscriptFeedback}
              clarificationPrompt={voice.clarificationPrompt}
              assistantResponse={voice.assistantResponse}
            />

            <ShoppingList
              items={list.items}
              onRemove={list.handleRemoveItem}
              onQty={list.handleUpdateQty}
              onTogglePurchased={list.handleTogglePurchased}
            />

            {list.items.length > 0 && (
              <div className="card" style={{ padding: 18, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>Estimated Total</span>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>
                    ₹{list.estimatedTotal.toFixed(0)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                  * Based on prices in the product database. Only active/unpurchased items contribute.
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline Sidebar */}
          <div className="col" style={{ flex: 1 }}>
            <ActionLog events={list.actionLog} />
          </div>
        </main>

        <footer className="footer">
          <div className="muted">
            Hands-free voice assistant. All list data resides securely in your local browser profile.
          </div>
        </footer>

        <Toasts items={list.toasts} onDismiss={(id) => list.setToasts((prev) => prev.filter((t) => t.id !== id))} />
      </div>
    </ErrorBoundary>
  );
};
