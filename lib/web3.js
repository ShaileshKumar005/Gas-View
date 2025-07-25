import { ethers } from 'ethers'

// Uniswap V3 USDC/ETH Pool - 0.05% fee tier
const UNISWAP_V3_POOL = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'

const UNISWAP_V3_POOL_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'
]

// Arbitrum specific constants
const ARBITRUM_NODE_INTERFACE = '0x00000000000000000000000000000000000000C8'
const ARBITRUM_NODE_INTERFACE_ABI = [
  'function gasEstimateComponents(address to, bool contractCreation, bytes calldata data) external payable returns (uint64 gasEstimate, uint64 gasEstimateForL1, uint256 baseFee, uint256 l1BaseFeeEstimate)',
  'function gasEstimateL1Component(address to, bool contractCreation, bytes calldata data) external payable returns (uint256 gasEstimateForL1, uint256 baseFee, uint256 l1BaseFeeEstimate)'
]

class Web3Service {
  constructor() {
    this.providers = {}
    this.isConnected = false
    this.ethPrice = 0
    this.callbacks = {
      onGasUpdate: null,
      onPriceUpdate: null,
      onConnectionChange: null
    }
  }
  
  // Initialize providers for all chains
  async initializeProviders() {
    const chains = {
      ethereum: 'wss://ethereum-rpc.publicnode.com',
      polygon: 'wss://polygon-bor-rpc.publicnode.com', 
      arbitrum: 'wss://arbitrum-one-rpc.publicnode.com'
    }
    
    const connectionPromises = []
    
    for (const [chainId, rpcUrl] of Object.entries(chains)) {
      // Create a promise that resolves when the connection is established or times out
      const connectionPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout connecting to ${chainId}`))
        }, 3000) // 3 second timeout per chain
        
        try {
          const provider = new ethers.WebSocketProvider(rpcUrl)
          
          // Set up error handling
          provider.on('error', (error) => {
            clearTimeout(timeout)
            console.error(`${chainId} provider error:`, error)
            reject(error)
          })
          
          // Test connection by getting network info
          provider.getNetwork().then(() => {
            clearTimeout(timeout)
            this.providers[chainId] = provider
            
            // Listen for new blocks
            provider.on('block', (blockNumber) => {
              this.handleNewBlock(chainId, blockNumber)
            })
            
            provider.on('error', (error) => {
              console.error(`${chainId} provider error:`, error)
              this.reconnectProvider(chainId)
            })
            
            resolve(chainId)
          }).catch((error) => {
            clearTimeout(timeout)
            reject(error)
          })
          
        } catch (error) {
          clearTimeout(timeout)
          reject(error)
        }
      })
      
      connectionPromises.push(connectionPromise)
    }
    
    try {
      // Wait for all connections with a shorter timeout
      await Promise.race([
        Promise.allSettled(connectionPromises),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Overall timeout')), 4000))
      ])
      
      // Check if at least one connection succeeded
      const connectedChains = Object.keys(this.providers).length
      if (connectedChains > 0) {
        this.isConnected = true
        this.callbacks.onConnectionChange?.(true)
        console.log(`Connected to ${connectedChains} chains`)
        
        // Start ETH price tracking
        this.startEthPriceTracking()
      } else {
        throw new Error('No blockchain connections established')
      }
      
    } catch (error) {
      console.error('Failed to initialize providers:', error)
      this.isConnected = false
      this.callbacks.onConnectionChange?.(false)
      throw error
    }
  }
  
  // Handle new block for gas price extraction
  async handleNewBlock(chainId, blockNumber) {
    try {
      const provider = this.providers[chainId]
      const block = await provider.getBlock(blockNumber, false)
      
      if (block) {
        const gasData = await this.getEnhancedGasData(chainId, block)
        this.callbacks.onGasUpdate?.(chainId, gasData)
      }
    } catch (error) {
      console.error(`Error handling block for ${chainId}:`, error)
    }
  }
  
  // Calculate ETH/USD price from Uniswap V3
  async getEthPriceFromUniswap() {
    try {
      const provider = this.providers.ethereum
      if (!provider) throw new Error('Ethereum provider not available')
      
      const contract = new ethers.Contract(UNISWAP_V3_POOL, UNISWAP_V3_POOL_ABI, provider)
      
      // Get recent swap events
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = currentBlock - 10 // Last 10 blocks
      
      const swapEvents = await contract.queryFilter('Swap', fromBlock, currentBlock)
      
      if (swapEvents.length > 0) {
        const latestSwap = swapEvents[swapEvents.length - 1]
        const sqrtPriceX96 = latestSwap.args.sqrtPriceX96
        
        // Calculate price from sqrtPriceX96
        // price = (sqrtPriceX96 ** 2 * 10 ** 12) / (2 ** 192)
        const price = (Number(sqrtPriceX96) ** 2 * Math.pow(10, 12)) / Math.pow(2, 192)
        
        // Since this is USDC/ETH pool, we need to invert for ETH/USD
        const ethPrice = 1 / price
        
        this.ethPrice = ethPrice
        this.callbacks.onPriceUpdate?.(ethPrice)
        
        return ethPrice
      }
      
      return this.ethPrice || 3000 // Fallback price
    } catch (error) {
      console.error('Error fetching ETH price:', error)
      return this.ethPrice || 3000 // Fallback price
    }
  }

  // Calculate Arbitrum-specific gas costs (L1 + L2)
  async getArbitrumGasCost(to = '0x0000000000000000000000000000000000000000', data = '0x') {
    try {
      const provider = this.providers.arbitrum
      if (!provider) throw new Error('Arbitrum provider not available')
      
      // Create contract instance for node interface
      const nodeInterface = new ethers.Contract(
        ARBITRUM_NODE_INTERFACE,
        ARBITRUM_NODE_INTERFACE_ABI,
        provider
      )
      
      // Estimate gas components for a standard transfer
      const gasEstimate = await nodeInterface.gasEstimateComponents(
        to,
        false, // not contract creation
        data
      )
      
      return {
        l2GasEstimate: gasEstimate.gasEstimate,
        l1GasEstimate: gasEstimate.gasEstimateForL1,
        baseFee: gasEstimate.baseFee,
        l1BaseFeeEstimate: gasEstimate.l1BaseFeeEstimate
      }
    } catch (error) {
      console.error('Error calculating Arbitrum gas cost:', error)
      // Fallback to standard estimation
      return {
        l2GasEstimate: 21000n,
        l1GasEstimate: 1000n,
        baseFee: 100000000n, // 0.1 gwei
        l1BaseFeeEstimate: 15000000000n // 15 gwei
      }
    }
  }

  // Enhanced gas calculation for Arbitrum
  async getEnhancedGasData(chainId, block) {
    if (chainId === 'arbitrum') {
      try {
        // Get Arbitrum-specific gas breakdown
        const arbitrumGas = await this.getArbitrumGasCost()
        
        // Calculate total gas cost (L1 + L2)
        const l2Cost = Number(arbitrumGas.l2GasEstimate) * Number(arbitrumGas.baseFee)
        const l1Cost = Number(arbitrumGas.l1GasEstimate) * Number(arbitrumGas.l1BaseFeeEstimate)
        const totalGasCost = l2Cost + l1Cost
        
        // Convert to per-gas price for compatibility
        const effectiveGasPrice = totalGasCost / 21000 // Standard transfer gas limit
        
        return {
          baseFee: Number(arbitrumGas.baseFee),
          priorityFee: 2000000000, // 2 gwei default
          gasPrice: effectiveGasPrice,
          lastBlock: block.number,
          timestamp: block.timestamp,
          // Arbitrum-specific data
          l1GasCost: l1Cost,
          l2GasCost: l2Cost,
          l1BaseFee: Number(arbitrumGas.l1BaseFeeEstimate),
          l2BaseFee: Number(arbitrumGas.baseFee)
        }
      } catch (error) {
        console.error('Error getting Arbitrum gas data:', error)
        // Fall back to standard calculation
        return {
          baseFee: Number(block.baseFeePerGas || 100000000), // 0.1 gwei fallback
          priorityFee: 2000000000, // 2 gwei default
          gasPrice: Number(block.baseFeePerGas || 100000000) + 2000000000,
          lastBlock: block.number,
          timestamp: block.timestamp
        }
      }
    } else {
      // Standard gas calculation for Ethereum and Polygon
      return {
        baseFee: Number(block.baseFeePerGas || 0),
        priorityFee: 2000000000, // 2 gwei default
        gasPrice: Number(block.baseFeePerGas || 0) + 2000000000,
        lastBlock: block.number,
        timestamp: block.timestamp
      }
    }
  }
  
  // Start ETH price tracking
  startEthPriceTracking() {
    // Update price immediately
    this.getEthPriceFromUniswap()
    
    // Update every 30 seconds
    setInterval(() => {
      this.getEthPriceFromUniswap()
    }, 30000)
  }
  
  // Reconnect provider on error
  async reconnectProvider(chainId) {
    try {
      const rpcUrls = {
        ethereum: 'wss://ethereum-rpc.publicnode.com',
        polygon: 'wss://polygon-bor-rpc.publicnode.com',
        arbitrum: 'wss://arbitrum-one-rpc.publicnode.com'
      }
      
      if (this.providers[chainId]) {
        this.providers[chainId].removeAllListeners()
        this.providers[chainId] = null
      }
      
      const provider = new ethers.WebSocketProvider(rpcUrls[chainId])
      this.providers[chainId] = provider
      
      provider.on('block', (blockNumber) => {
        this.handleNewBlock(chainId, blockNumber)
      })
      
      provider.on('error', (error) => {
        console.error(`${chainId} provider error:`, error)
        setTimeout(() => this.reconnectProvider(chainId), 5000)
      })
      
    } catch (error) {
      console.error(`Failed to reconnect ${chainId}:`, error)
      setTimeout(() => this.reconnectProvider(chainId), 5000)
    }
  }
  
  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }
  
  // Cleanup
  disconnect() {
    Object.values(this.providers).forEach(provider => {
      if (provider) {
        provider.removeAllListeners()
      }
    })
    this.providers = {}
    this.isConnected = false
  }
}

export default new Web3Service()