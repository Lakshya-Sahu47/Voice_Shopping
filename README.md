# Voice Shopping Assistant

A highly accessible, voice-first shopping list manager built for real-world usage.

This application allows users to build and manage their grocery shopping lists using natural speech commands. It interprets user intents (adding items, removing items, updating quantities, clearing lists, checking off products, and catalog searches) and provides real-time visual and auditory feedback. It is designed to be fully local-first and accessibility-compliant.

---

## Architecture

The project has been refactored into a modular, decoupled feature-oriented architecture:

```text
src/
├── types/                      # Shared domain interfaces and models
├── data/                       # Static catalogs, categories, seasonal and substitute maps
├── services/                   # Business logic layers
│   ├── intent.ts               # Core rule-based Intent Engine (Hinglish, plurals, Hindi numbers)
│   ├── recommendations.ts      # Score-based history/seasonal suggestion algorithm
│   └── storage.ts              # Hardened, validated localStorage wrappers
├── hooks/                      # Custom React hooks (separates state from UI)
│   ├── useShoppingList.ts      # List state transactions and storage syncing
│   └── useVoiceAssistant.ts    # Continuous Speech listener and conversation context state
├── components/                 # Component folders
│   ├── common/                 # Onboarding, Settings, Toasts, and ErrorBoundary
│   ├── voice/                  # Redesigned Microphone controls and transcript display
│   ├── shopping/               # Categorized shopping list items
│   ├── search/                 # Catalog search panel with interpreted voice search rules
│   └── activity/               # Conversational timeline log
├── App.tsx                     # Top-level layout and entry orchestration
└── main.tsx                    # Bootstrap entry point
```

---

## Features

### 1. Voice & Text Input Pipeline
*   Primary voice interaction is driven via a large prominent Microphone button.
*   Pulsing animations guide the user's speech state.
*   **Text Fallback:** A text input allows users to run commands manually when microphones are disabled or unavailable.

### 2. Conversational Context & Intent Engine
*   **Multi-turn Clarification:** The assistant tracks context state. If a user says *"Add milk"* without a quantity, the assistant asks *"How much milk do you need?"*. Speaking a quantity like *"2"* completes the transaction.
*   **Hinglish Support:** Naturally parses mixed Hindi-English phrases such as:
    *   *"2 packet atta add karo"*
    *   *"bread hata do"*
    *   *"toothpaste 300 ke andar dhundo"*
*   **Hindi Numerals:** Supports Devanagari numerals (एक, दो, तीन, चार, पाँच...) alongside English digit characters and words.
*   **Plural Stemming:** Advanced singularization rules accurately map plurals (such as `"tomatoes"`, `"potatoes"`, `"boxes"`) to catalog roots (`"tomato"`, `"potato"`, `"box"`).

### 3. Out-Of-Stock Substitute Choice
*   When a user attempts to add an unavailable item, the app blocks the transaction, ranks available alternatives (matching brand, price, and category similarity), and displays interactive choose-buttons (e.g. `+ Add Almond Milk`) rather than silently appending the unavailable item.

### 4. Smart Predictive Suggestions
*   **Interval Scoring:** Calculates the average purchase cycle based on past timestamps (hardened with up to a 90-day cycle limit to support long-term household items) and suggests items that are overdue.
*   **Seasonal Recommendations:** Recommends items relative to the current calendar month.
*   **Auditable Explanations:** Every suggestion lists exactly **why** it has been recommended (e.g. *"✓ You usually buy this every 7 days, ✓ It's been 9 days since your last purchase"*).

### 5. Parameterized Voice Search
*   Voice searches parse brands (*"by organic valley"*), maximum price (*"under $5"*), dietary tags (*"organic"*), and product categories.
*   Interpreted query constraints are displayed visually.
*   **Fixed Locking:** Unlike V1, voice searches populate filters but do not lock manual controls; users can clear, edit, or search again freely.

### 6. Accessibility-First Design
*   Checklists use proper `role="checkbox"` and `aria-checked` states.
*   Quantity adjusters and delete buttons contain clear descriptive `aria-label` tags.
*   Supports user setting for **Text-to-Speech (TTS) voice confirmations** using the browser's speech synthesis engine to read actions aloud (e.g., *"Added 2 apples"*).
*   Respects `prefers-reduced-motion` to suppress high-contrast animations.

---

## Tech Stack

*   **React 18** (with TypeScript)
*   **Vite 5** (Asset compiling)
*   **Web Speech API** (`SpeechRecognition` / `SpeechSynthesis`)
*   **localStorage** (Encapsulated and validated client-side persistence)

---

## Setup & Execution

### Scripts (Windows Command Line)

#### Run Development Server
Double-click `run.bat` or run:
```cmd
run.bat
```
*Checks if Node.js is installed, checks/installs dependencies if missing, and boots up the Vite local server.*

#### Compile Production Build
Double-click `build.bat` or run:
```cmd
build.bat
```
*Validates syntax, runs type checking, compiles production assets, and outputs them to the `dist/` directory.*

### Alternative Commands (Cross-Platform)

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start development hot-reloading server:**
    ```bash
    npm run dev
    ```
3.  **Validate lint rules:**
    ```bash
    npm run lint
    ```
4.  **Build production artifacts:**
    ```bash
    npm run build
    ```

---

## Browser Support

*   **Speech Recognition:** Requires Google Chrome, Microsoft Edge, or Android Chrome. Safari and Firefox do not currently support continuous SpeechRecognition.
*   **Text-to-Speech:** Widely supported across all modern browsers.

---

## Limitations

*   **Rule-Based Parser:** Intent parsing is driven by a deterministic regular expression engine. It is lightweight and operates completely offline, but does not support loose conversational banter.
*   **Local Storage:** Since data is persisted inside browser storage, lists do not sync across different browsers or hardware devices.
