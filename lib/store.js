import { create } from 'zustand'

export const useGasStore = create((set, get) => ({
  // State
  mode: 'live', // 'live' | 'simulation'
  usdPrice: 0,
  simulationAmount: 0.1,
  isConnected: false,
  lastUpdateTime: null,
  
  // Chain data
  chains: {
    ethereum: {
      name: 'Ethereum',
      symbol: 'ETH',
      baseFee: 0,
      priorityFee: 0,
      gasPrice: 0,
      lastBlock: 0,
      history: [],
      rpcUrl: 'wss://ethereum-rpc.publicnode.com',
      color: '#627EEA',
      decimals: 18
    },
    polygon: {
      name: 'Polygon',
      symbol: 'MATIC',
      baseFee: 0,
      priorityFee: 0,
      gasPrice: 0,
      lastBlock: 0,
      history: [],
      rpcUrl: 'wss://polygon-bor-rpc.publicnode.com',
      color: '#8247E5',
      decimals: 18
    },
    arbitrum: {
      name: 'Arbitrum',
      symbol: 'ARB',
      baseFee: 0,
      priorityFee: 0,
      gasPrice: 0,
      lastBlock: 0,
      history: [],
      rpcUrl: 'wss://arbitrum-one-rpc.publicnode.com',
      color: '#28A0F0',
      decimals: 18
    }
  },
  
  // Actions
  setMode: (mode) => set({ mode }),
  
  setUsdPrice: (price) => set({ usdPrice: price }),
  
  setSimulationAmount: (amount) => set({ simulationAmount: amount }),
  
  updateChainData: (chainId, data) => set((state) => ({
    chains: {
      ...state.chains,
      [chainId]: {
        ...state.chains[chainId],
        ...data
      }
    },
    lastUpdateTime: new Date().toISOString()
  })),
  
  addGasHistory: (chainId, gasPoint) => set((state) => {
    const chain = state.chains[chainId]
    const newHistory = [...chain.history, gasPoint]
    
    // Keep only last 60 points (15 minutes of 15-second intervals)
    const trimmedHistory = newHistory.slice(-60)
    
    return {
      chains: {
        ...state.chains,
        [chainId]: {
          ...chain,
          history: trimmedHistory
        }
      }
    }
  }),

  // Add gas data and history point simultaneously
  updateChainDataWithHistory: (chainId, data) => set((state) => {
    const chain = state.chains[chainId]
    const gasPoint = {
      timestamp: data.timestamp || Date.now(),
      baseFee: data.baseFee,
      priorityFee: data.priorityFee,
      gasPrice: data.gasPrice
    }
    
    const newHistory = [...chain.history, gasPoint]
    const trimmedHistory = newHistory.slice(-60) // Keep last 60 points
    
    return {
      chains: {
        ...state.chains,
        [chainId]: {
          ...chain,
          ...data,
          history: trimmedHistory
        }
      },
      lastUpdateTime: new Date().toISOString()
    }
  }),

  // Convert history to OHLC candlestick data
  getOHLCData: (chainId, intervalMinutes = 15) => {
    const state = get()
    const chain = state.chains[chainId]
    if (!chain.history.length) return []
    
    const intervalMs = intervalMinutes * 60 * 1000
    const now = Date.now()
    const startTime = Math.floor((now - (24 * 60 * 60 * 1000)) / intervalMs) * intervalMs // 24 hours ago
    
    const ohlcData = []
    const historyByInterval = {}
    
    // Group history points by interval
    chain.history.forEach(point => {
      const timestamp = typeof point.timestamp === 'number' ? point.timestamp : Date.parse(point.timestamp)
      const intervalStart = Math.floor(timestamp / intervalMs) * intervalMs
      
      if (!historyByInterval[intervalStart]) {
        historyByInterval[intervalStart] = []
      }
      historyByInterval[intervalStart].push(point.gasPrice / 1e9) // Convert to gwei
    })
    
    // Convert to OHLC format
    Object.entries(historyByInterval).forEach(([intervalStart, prices]) => {
      if (prices.length > 0) {
        const sortedPrices = prices.sort((a, b) => a - b)
        ohlcData.push({
          time: parseInt(intervalStart) / 1000, // Convert to seconds for lightweight-charts
          open: prices[0],
          high: sortedPrices[sortedPrices.length - 1],
          low: sortedPrices[0],
          close: prices[prices.length - 1]
        })
      }
    })
    
    return ohlcData.sort((a, b) => a.time - b.time)
  },
  
  setConnectionStatus: (isConnected) => set({ isConnected }),
  
  // Computed getters
  getGasCostUSD: (chainId) => {
    const state = get()
    const chain = state.chains[chainId]
    const gasLimit = 21000 // Standard ETH transfer
    const gasCostWei = (chain.baseFee + chain.priorityFee) * gasLimit
    const gasCostEth = gasCostWei / Math.pow(10, 18)
    return gasCostEth * state.usdPrice
  },
  
  getTransactionCostUSD: (chainId) => {
    const state = get()
    const gasCost = state.getGasCostUSD(chainId)
    const transactionValue = state.simulationAmount * state.usdPrice
    return gasCost + transactionValue
  }
}))