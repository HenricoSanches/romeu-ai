# 🐾 Romeu AI — Assistente Financeiro Inteligente

A mobile-first personal finance assistant powered by natural language. Built with React Native + Expo.

---

## ✨ Features

- 💬 **Chat-based interface** — log transactions in plain Portuguese
- 🧠 **NLP parser** — detects income/expense + extracts amount + infers category
- 💳 **Live balance card** — balance, monthly income, expenses, and remaining budget
- 📊 **Monthly summary** — type "resumo" to get a breakdown
- 🌙 **Dark fintech UI** — deep navy + vibrant violet palette
- 💾 **Fully offline** — all data stored locally with AsyncStorage
- 🔄 **Extendable** — drop in a real AI API later without changing the UI

---

## 🗂 Project Structure

```
RomeuAI/
├── App.tsx                    # Root: routes between Onboarding ↔ Chat
├── app.json                   # Expo config
├── src/
│   ├── components/
│   │   ├── ChatBubble.tsx     # User + Romeu message bubbles
│   │   ├── MessageInput.tsx   # Chat input bar
│   │   ├── BalanceCard.tsx    # Financial summary card
│   │   ├── QuickActions.tsx   # Horizontal chip shortcuts
│   │   ├── RomeuAvatar.tsx    # Dog avatar (swap with real asset)
│   │   └── TypingIndicator.tsx# Animated "..." while Romeu responds
│   ├── screens/
│   │   ├── OnboardingScreen.tsx  # 3-step setup wizard
│   │   └── ChatScreen.tsx        # Main chat experience
│   ├── services/
│   │   ├── parser.ts          # NLP: detects intent + extracts amount + category
│   │   └── financialService.ts# Balance calc + response generation
│   ├── storage/
│   │   └── storage.ts         # AsyncStorage wrappers
│   ├── styles/
│   │   └── theme.ts           # Colors, typography, spacing, radii
│   └── types/
│       └── index.ts           # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator (Android Studio), or the **Expo Go** app

### Install & Run

```bash
# Clone / unzip the project
cd RomeuAI

# Install dependencies
npm install

# Start add server
npx expo start

# Press:
#   i  → open in iOS Simulator
#   a  → open in Android Emulator
#   w  → open in web browser
#   Scan QR → open in Expo Go on your phone
```

---

## 💬 Example Messages

| Input | Detected | Category |
|---|---|---|
| "Gastei 50 no mercado" | Expense | Alimentação |
| "Paguei 300 de aluguel" | Expense | Moradia |
| "Ganhei 1200 de freela" | Income | Freelance |
| "Recebi 3000 de salário" | Income | Salário |
| "Pedi 45 no iFood" | Expense | Alimentação |
| "Paguei 80 de uber" | Expense | Transporte |

### Special Commands

| Command | Action |
|---|---|
| `resumo` | Monthly spending summary |
| `saldo` | Current balance |
| `ajuda` | Help guide |

---

## 🔌 Connecting Real AI (Next Step)

The `handleSend` function in `ChatScreen.tsx` is designed to be easily upgraded.
Replace the `parseMessage()` + `generateXxxResponse()` block with an API call:

```typescript
// In ChatScreen.tsx → handleSend()
const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
  body: JSON.stringify({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    system: `You are Romeu, a friendly Brazilian financial assistant. 
             Parse the user message and return JSON: {type, amount, category, response}`,
    messages: [{ role: 'user', content: userMessage }],
  }),
});
```

---

## 🎨 Customization

- **Colors** → `src/styles/theme.ts` — change `Colors.primary` to rebrand
- **Avatar** → Replace emoji in `RomeuAvatar.tsx` with `<Image source={require('../assets/romeu.png')} />`
- **Categories** → Extend `CATEGORY_MAP` in `parser.ts`
- **Responses** → Edit response arrays in `financialService.ts`

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native + Expo SDK 51 |
| Language | TypeScript (strict) |
| Storage | AsyncStorage |
| Navigation | Conditional rendering (no router needed for MVP) |
| Styling | StyleSheet API + design tokens |

---

## 🐾 Romeu

> "Controlar dinheiro não precisa ser chato. Me manda uma mensagem!"

---

*Built with ❤️ — ready to grow into a full AI-powered fintech app.*
