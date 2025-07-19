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
    
    // Group history points by interval
    const historyByInterval = {}
    
    chain.history.forEach(point => {
      const timestamp = typeof point.timestamp === 'number' ? point.timestamp : Date.parse(point.timestamp)
      const intervalStart = Math.floor(timestamp / intervalMs) * intervalMs
      
      if (!historyByInterval[intervalStart]) {
        historyByInterval[intervalStart] = []
      }
      historyByInterval[intervalStart].push({
        ...point,
        gasPriceGwei: point.gasPrice / 1e9
      })
    })
    
    // Convert to OHLC format
    const ohlcData = []
    Object.entries(historyByInterval).forEach(([intervalStart, dataPoints]) => {
      if (dataPoints.length > 0) {
        const prices = dataPoints.map(p => p.gasPriceGwei)
        const sortedPrices = [...prices].sort((a, b) => a - b)
        
        ohlcData.push({
          time: parseInt(intervalStart) / 1000, // Convert to seconds for lightweight-charts
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
          volume: dataPoints.length
        })
      }
    })
    
    // If we don't have enough OHLC data, generate some based on current prices
    if (ohlcData.length < 10) {
      const currentPrice = chain.gasPrice / 1e9
      const baseTime = Math.floor(now / 1000) - (24 * 60 * 60) // 24 hours ago
      
      for (let i = 0; i < 24; i++) {
        const time = baseTime + (i * 60 * 60) // Every hour
        const variation = (Math.random() - 0.5) * currentPrice * 0.3 // ±30% variation
        const price = Math.max(0.1, currentPrice + variation)
        const volatility = currentPrice * 0.1 // 10% volatility
        
        ohlcData.push({
          time,
          open: Math.max(0.1, price + (Math.random() - 0.5) * volatility),
          high: Math.max(0.1, price + Math.random() * volatility),
          low: Math.max(0.1, price - Math.random() * volatility),
          close: Math.max(0.1, price + (Math.random() - 0.5) * volatility),
          volume: Math.floor(Math.random() * 100) + 10
        })
      }
    }
    
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