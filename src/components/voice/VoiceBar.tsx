import React, { useMemo, useRef, useState, useEffect } from "react";
import { VoiceState } from "../../hooks/useVoiceAssistant";

type VoiceBarProps = {
  lang: string;
  onUtterance: (text: string) => void;
  onCompatibilityIssue: (message: string) => void;
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  transcriptFeedback: string;
  setTranscriptFeedback: (text: string) => void;
  clarificationPrompt: string | null;
  assistantResponse: string | null; // V3 addition
};

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export const VoiceBar: React.FC<VoiceBarProps> = ({
  lang,
  onUtterance,
  onCompatibilityIssue,
  voiceState,
  setVoiceState,
  transcriptFeedback,
  setTranscriptFeedback,
  clarificationPrompt,
  assistantResponse
}) => {
  const SpeechRecognitionConstructor = useMemo(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }, []);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const interimBufferRef = useRef<string>("");

  const [interimText, setInterimText] = useState("");
  const [textFallbackInput, setTextFallbackInput] = useState("");

  useEffect(() => {
    if (!SpeechRecognitionConstructor) {
      setVoiceState("UNSUPPORTED");
      onCompatibilityIssue(
        "SpeechRecognition API not found. Use Chrome/Edge desktop or Android Chrome. You can still type commands."
      );
      return;
    }

    const rec = new SpeechRecognitionConstructor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const finalTrimmed = final.trim();
      if (finalTrimmed) {
        interimBufferRef.current = "";
        setInterimText("");
        onUtterance(finalTrimmed);
      }

      const interimTrimmed = interim.trim();
      interimBufferRef.current = interimTrimmed;
      setInterimText(interimTrimmed);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg = String(event?.error ?? "unknown");
      if (errorMsg !== "no-speech" && errorMsg !== "aborted") {
        onCompatibilityIssue(`Speech error: ${errorMsg}`);
        setVoiceState("ERROR");
      } else {
        setVoiceState("IDLE");
      }
      
      if (
        errorMsg === "not-allowed" ||
        errorMsg === "service-not-allowed" ||
        errorMsg === "audio-capture"
      ) {
        isListeningRef.current = false;
        setVoiceState("ERROR");
      }
    };

    rec.onend = () => {
      if (isListeningRef.current) {
        window.setTimeout(() => {
          try {
            rec.start();
            setVoiceState("LISTENING");
          } catch {
            setVoiceState("IDLE");
          }
        }, 180);
        return;
      }
      setVoiceState("IDLE");
    };

    recognitionRef.current = rec;

    return () => {
      isListeningRef.current = false;
      try {
        rec.stop();
      } catch {
        // Ignored
      }
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionConstructor, lang, onCompatibilityIssue, onUtterance, setVoiceState]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (voiceState === "LISTENING") {
      isListeningRef.current = false;
      const finalLeft = interimBufferRef.current.trim();
      if (finalLeft) {
        onUtterance(finalLeft);
      }
      setInterimText("");
      interimBufferRef.current = "";
      rec.stop();
      setVoiceState("IDLE");
    } else {
      setInterimText("");
      setTranscriptFeedback("");
      interimBufferRef.current = "";
      isListeningRef.current = true;
      try {
        rec.start();
        setVoiceState("LISTENING");
      } catch {
        onCompatibilityIssue("Could not start microphone. Check permissions and HTTPS origin.");
        setVoiceState("ERROR");
      }
    }
  };

  const handleManualSubmit = () => {
    const query = textFallbackInput.trim();
    if (query) {
      setTextFallbackInput("");
      onUtterance(query);
    }
  };

  return (
    <div className="card voice-section" style={{ padding: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        
        {/* Clarification prompt banner */}
        {clarificationPrompt ? (
          <div className="clarification-banner" style={{ background: "rgba(44, 230, 164, 0.1)", border: "1px solid var(--primary)", borderRadius: 14, padding: "10px 16px", color: "var(--primary)", width: "100%", textAlign: "center", marginBottom: 20, fontWeight: 700, fontSize: 14 }}>
            💬 {clarificationPrompt}
          </div>
        ) : null}

        {/* Pulsing Mic visualizer */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          {voiceState === "LISTENING" && (
            <div className="pulse-circle" style={{
              position: "absolute",
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: "50%",
              border: "3px solid var(--primary)",
              opacity: 0.8,
              pointerEvents: "none"
            }} />
          )}
          <button
            onClick={toggleListening}
            className={`mic-btn ${voiceState === "LISTENING" ? "mic-btn--active" : ""}`}
            aria-pressed={voiceState === "LISTENING"}
            aria-label={voiceState === "LISTENING" ? "Stop voice listening" : "Start voice listening"}
            disabled={voiceState === "UNSUPPORTED"}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "none",
              background: voiceState === "LISTENING" ? "var(--danger)" : "linear-gradient(135deg, var(--primary), #1bba80)",
              color: "#0b0f14",
              fontSize: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(44, 230, 164, 0.3)",
              transition: "transform 0.2s ease, background 0.2s ease"
            }}
          >
            {voiceState === "LISTENING" ? "⏹️" : "🎙️"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="mono" style={{ fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700, color: voiceState === "LISTENING" ? "var(--danger)" : "var(--muted)" }}>
            {voiceState === "LISTENING" ? "● Listening..." : voiceState === "PROCESSING" ? "✨ Understanding..." : "Tap microphone to speak"}
          </span>
        </div>

        {/* Realtime voice feedback panels */}
        <div className="voice__panel" style={{ width: "100%", background: "#0002", minHeight: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 14, padding: 12, gap: 10 }}>
          {interimText ? (
            <span className="muted" style={{ fontStyle: "italic", fontSize: 15 }}>"{interimText}"</span>
          ) : transcriptFeedback ? (
            <div style={{ width: "100%" }}>
              <div className="label" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", marginBottom: 2 }}>You Heard:</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>"{transcriptFeedback}"</div>
            </div>
          ) : (
            <span className="muted" style={{ fontSize: 13 }}>Speech recognition transcript displays here.</span>
          )}

          {assistantResponse && (
            <div style={{
              width: "100%",
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(44, 230, 164, 0.08)",
              border: "1px solid var(--primary)",
              textAlign: "left"
            }}>
              <div className="label" style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Assistant:</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e7eef8", lineHeight: 1.4 }}>{assistantResponse}</div>
            </div>
          )}
        </div>
      </div>

      <div className="row" style={{ marginTop: 20 }}>
        <input
          className="input"
          placeholder="Type a command (fallback)"
          value={textFallbackInput}
          onChange={(e) => setTextFallbackInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleManualSubmit();
          }}
        />
        <button className="btn" onClick={handleManualSubmit}>
          Run
        </button>
      </div>
    </div>
  );
};
