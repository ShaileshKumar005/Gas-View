# 🚀 Gas View: Real-Time Cross-Chain Gas Tracker with Wallet Simulation

<img width="1918" height="922" alt="image" src="https://github.com/user-attachments/assets/6155cc88-1d77-413f-bef2-b421b61c86d3" />


## 🌐 Live Demo
🔗 [gas-view.vercel.app](https://gas-view.vercel.app)

---

## 📌 Project Overview

**Gas View** is a real-time Web3 dashboard that tracks gas fees across **Ethereum**, **Polygon**, and **Arbitrum** using native WebSocket RPCs (no third-party APIs).  
It also includes a **wallet simulation tool** to estimate and visualize USD gas and transaction costs across these chains.

> All pricing and data computations are done using **on-chain sources only** — no CoinGecko, no Alchemy, no Infura.

---

## 🎯 Core Features

### 🔥 Live Gas Price Engine
- Connects to Ethereum, Polygon, and Arbitrum using `ethers.providers.WebSocketProvider`.
- Extracts:
  - `baseFeePerGas`
  - `maxPriorityFeePerGas`
- Updates gas values every 6 seconds.
- Stores and manages state using **Zustand**.

### 💸 ETH/USD Price from Uniswap V3 (No APIs)
- Pulls **Swap logs** directly from the Uniswap V3 pool (0x88e6...5640).
- Decodes on-chain logs to compute real-time ETH/USD using:
  ```ts
  price = (sqrtPriceX96 ** 2 * 10 ** 12) / (2 ** 192)
Fully on-chain, no external price feed.

🧪 Simulation Mode
Users can simulate a transfer (e.g. 0.5 ETH / MATIC / ARB).

Calculates USD transaction cost for each chain:

costUSD = (baseFee + priorityFee) * 21000 * usdPrice
Animates and displays results in a comparison table.

📊 Visualization & UI
Candlestick Chart using lightweight-charts:

15-minute interval gas price trends.

Transition Animations:

Seamless mode switch (live ↔ simulation).

Cross-chain cost comparison with smooth slide/fade effects.

Shimmer loaders during state change.

🧠 Tech Stack
Area	Stack Used
Frontend	Next.js (App Router), React 18, TypeScript
Styling	TailwindCSS
State Management	Zustand with custom state machine for mode switching
Web3 Integration	Ethers.js, WebSocketProvider, Uniswap V3 Pool log decoding
Charts	Lightweight-Charts
Deployment	Vercel

📂 Project Structure (Simplified)

gas-view/
├── app/                 # Next.js App Router pages and components
│   ├── live/            # Live mode components
│   ├── simulate/        # Simulation mode components
│   └── layout.tsx       # App layout
├── lib/                 # Utility functions (gas fetch, log decoding, etc.)
├── store/               # Zustand state management
├── public/              # Static assets
├── styles/              # Tailwind and global styles
├── components/          # Reusable UI components
├── types/               # TypeScript types and interfaces
└── README.md
📽️ Demo Video


🚀 Running Locally

# 1. Clone the repository
git clone https://github.com/ShaileshKumar005/Gas-View.git
cd Gas-View

# 2. Install dependencies
npm install

# 3. Run the app
npm run dev
Ensure you have access to public WebSocket RPCs for Ethereum, Polygon, and Arbitrum.


🙌 Credits
Built by Shailesh Kumar T S
Inspired by the need for transparent, real-time, and decentralized gas tracking tools.

📜 License
MIT License — feel free to fork, clone, and build on top of this.
