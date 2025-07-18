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
    
    // Keep only last 100 points (25 hours of 15-minute intervals)
    const trimmedHistory = newHistory.slice(-100)
    
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