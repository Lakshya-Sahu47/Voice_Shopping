# Voice Shopping Assistant

A highly accessible, voice-first supermarket shopping list manager designed for hands-free utility.

Users primarily interact with the assistant using natural speech commands to manage their grocery lists, find products, and request intelligent recommendations. The interface remains minimalist and visual-first, focusing all intelligence behind the microphone.

---

## Features

*   **Voice Commands:** Hands-free speech recognition driven by a prominent Microphone toggle with active listening wave animations.
*   **Natural Language Processing (NLP):** Parses varied natural statements (e.g. *"Can you put some milk on my list?"*, *"Please add apples"*).
*   **Multilingual Support:** Supports English, Spanish, French, and Hinglish triggers (e.g. *"doodh add karo"*, *"bread hata do"*).
*   **Multi-Item Parsing:** Processes multi-item phrases (separated by commas or particles like *"and"*, *"aur"*) and segmentally appends them.
*   **Quantity & Unit Management:** Associates correct quantities and units (e.g. `kg`, `litres`, `packets`, `bottles`) per item in a single phrase.
*   **Automatic Categorization:** Groups items into categories (Produce, Dairy, Pantry, etc.) dynamically.
*   **Voice Search:** Performs search queries for brands, dietary tags, sizes, and price boundaries conversationally.
*   **Smart Suggestions:** Provides contextual recommendations based on tags (e.g., sasta/cheap, healthy, filling, sweet, salty) and purchase history.
*   **Seasonal Recommendations:** Conversationally recommends in-season fruits and produce (e.g., mangoes).
*   **Product Substitutes:** Identifies out-of-stock items, alerts the user, and suggests available alternative options.
*   **Supermarket Product Database:** Backed by an internal database of 35+ products containing sample pricing, packaging size, and synonyms.
*   **Discount-Aware Pricing:** Automatically calculates item prices using discounted selling prices rather than MRP.
*   **Estimated Shopping Total:** Displays the reactive sum of active/unpurchased items on the list.

---

## Example Voice Commands

*   *"Add one kilo of mango and one kilo of papaya"*
*   *"Add milk, bread and eggs"*
*   *"Add 2 kg potatoes and 1 kg onions"*
*   *"Remove milk"*
*   *"Add 2 bottles of water"*
*   *"Find toothpaste under ₹300"*
*   *"Find biscuits between ₹50 and ₹100"*
*   *"Suggest something cheap and filling"*
*   *"No, something salty"*
*   *"Yes, add it"* (confirms suggestion or substitute choice)
*   *"Ek kilo aam aur ek kilo papaya add karo"*

---

## Tech Stack

*   **Frontend Library:** React 18 (with TypeScript)
*   **Build Utility:** Vite 5
*   **Linter:** ESLint 9
*   **Browser Speech APIs:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis` for Text-to-Speech confirmations)
*   **Client Database:** LocalStorage (encapsulated persistence)

---

## Project Structure

```text
Voice_Shopping/
│
├── docs/
│   └── IMPLEMENTATION_SUMMARY.md   # Technical approach write-up (max 200 words)
│
├── public/                         # Static icons and assets
├── src/
│   ├── components/                 # Component subfolders (voice, shopping, activity, common)
│   ├── data/                       # Categorizations and supermarket product database
│   ├── hooks/                      # State coordinate hooks (useShoppingList, useVoiceAssistant)
│   ├── services/                   # Business logic (intent engine, recommendations, storage)
│   ├── types/                      # Domain interfaces
│   ├── utils/                      # Helper stems and numbers parsing
│   ├── App.tsx                     # Top-level coordinator
│   ├── index.css                   # Custom stylesheets
│   └── main.tsx                    # React bootstrap entry
│
├── README.md                       # Product documentation
├── LICENSE                         # MIT License
├── package.json                    # Dependencies & metadata
├── package-lock.json
├── index.html                      # Entry HTML
├── vite.config.ts                  # Vite configs
├── tsconfig.json                   # TypeScript config
├── tsconfig.node.json
├── eslint.config.js                # ESLint configs
├── run.bat                         # Dev server startup script
├── build.bat                       # Compiler verification script
└── .gitignore                      # Git ignore patterns
```

---

## Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Lakshya-Sahu47/Voice_Shopping.git
    cd Voice_Shopping
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Development
Start the local hot-reloading development server:
```bash
npm run dev
```

### Production Verification
Typecheck and build production assets:
```bash
npm run build
```

### Windows Shell Scripts
*   **run.bat:** Double-click or run from command line to verify Node, install dependencies automatically if `node_modules` is missing, and boot the Vite server.
*   **build.bat:** Double-click or run from command line to install dependencies if missing, compile production assets, and report success/failure status.

---

## How It Works

```text
Voice Input 
  → Web Speech API Transcript 
  → NLP Intent Engine (RuleBasedIntentEngine)
  → Supermarket Database Filter (Brand, Price, Sizing, Tags)
  → Hook Transaction Routing (useShoppingList & useVoiceAssistant)
  → State updates + Persistence (LocalStorage)
  → UI updates (Visual feedback + Toasts + Activity timeline)
```

---

## Pricing Disclaimer

*   Product prices, MRPs, and discount percentages are sample, static, internal application data and do **not** reflect real-time retailer pricing.
*   The **Estimated Total** is a reference estimate calculated using the application's internal database values, not a live supermarket checkout bill.

---

## Browser Support

*   **Speech Recognition:** Fully supported on Google Chrome, Microsoft Edge, and Android Chrome. Safari, Firefox, and iOS Chrome do not support continuous SpeechRecognition. A textual fallback input is provided for unsupported browsers.
*   **Speech Synthesis (TTS):** Widely supported across all modern browsers.

---

## Technical Assessment Limitations

*   **Rule-Based Parser:** Intent processing uses a deterministic regular expression engine. It is highly optimized for local/offline execution but does not support open-domain chit-chat.
*   **Local Storage:** Data is stored locally in the browser profile. Sharing or cross-device synchronizations are not supported.
