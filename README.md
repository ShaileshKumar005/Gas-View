# 🚀 Gas View – Real-Time Cross-Chain Gas Tracker & Simulation Dashboard

🌐 **Live App:** [gas-view.vercel.app](https://gas-view.vercel.app)  
🔗 **Repository:** [GitHub - Gas-View](https://github.com/ShaileshKumar005/Gas-View)

---

## 📌 Overview

**Gas View** is a real-time Web3 dashboard that tracks gas fees across **Ethereum**, **Polygon**, and **Arbitrum** using **native WebSocket RPCs** (no third-party APIs).  
It also includes a **wallet simulation tool** to estimate and visualize the USD cost of transactions across chains using **fully on-chain data**.

---

## 🎯 Core Features

### 🔥 Real-Time Gas Engine
- Connects via `ethers.providers.WebSocketProvider`.
- Extracts `baseFeePerGas` and `maxPriorityFeePerGas` from new blocks.
- Updates every **6 seconds** for all 3 chains.
- State managed via **Zustand**.

### 💸 On-Chain ETH/USD Price Feed
- Fetches Uniswap V3 **Swap logs** from the ETH/USDC pool at `0x88e6...5640`.
- Computes ETH/USD using decoded `sqrtPriceX96`:

price = (sqrtPriceX96 ** 2 * 10 ** 12) / (2 ** 192)

- No reliance on CoinGecko, Chainlink, or SDKs.

### 🧪 Simulation Mode
- Input a transaction (e.g., `0.5 ETH / MATIC / ARB`).
- Calculates USD transaction cost per chain:
  
costUSD = (baseFee + priorityFee) * 21000 * usdPrice
 - Visually compares results across chains using **animated tables**.

### 📊 Interactive Visualization
- Candlestick chart (15-min interval) using `lightweight-charts`.
- Animated mode switch (Live ↔ Simulation).
- **Shimmer loaders**, **slide/fade effects**, and **smooth UI transitions**.

---

## 🧠 Tech Stack

| Layer        | Tools                                 |
|--------------|----------------------------------------|
| Frontend     | Next.js (App Router), React 18, TypeScript |
| Styling      | TailwindCSS                            |
| State        | Zustand (custom state machine)         |
| Web3         | Ethers.js, WebSocketProvider, log parsing |
| Charts       | Lightweight-Charts                     |
| Deployment   | Vercel                                  |

---

## 🚀 Getting Started

Clone the repo:

git clone https://github.com/ShaileshKumar005/Gas-View.git

cd Gas-View

Install dependencies:

npm install

Run the development server:

npm run dev

---
Live Mode :

<img width="1873" height="883" alt="image" src="https://github.com/user-attachments/assets/3948ce42-3b4d-4b82-a650-bb4d63292e31" />

Simulation Mode :

<img width="1756" height="892" alt="image" src="https://github.com/user-attachments/assets/ff5b763f-6ad5-46f9-9f90-a4b371d56ef9" />

Charts :

<img width="1145" height="766" alt="image" src="https://github.com/user-attachments/assets/bfa05c7e-5eac-4837-abbd-30283d74cb31" />






---
🙌 Credits
Built by Shailesh Kumar T S

Inspired by the need for transparent, real-time, and decentralized gas tracking tools.


