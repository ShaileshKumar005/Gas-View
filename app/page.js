'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGasStore } from '@/lib/store'
import Web3Service from '@/lib/web3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import GasChart from '@/components/GasChart'
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Calculator,
  RefreshCw,
  Wifi,
  WifiOff,
  DollarSign,
  Sparkles,
  BarChart3,
  Clock,
  LineChart
} from 'lucide-react'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
}

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}

export default function GasTrackerApp() {
  const {
    mode,
    setMode,
    usdPrice,
    setUsdPrice,
    updateChainDataWithHistory,
    setConnectionStatus,
    isConnected,
    lastUpdateTime,
    chains,
    simulationAmount,
    setSimulationAmount,
    getOHLCData
  } = useGasStore()
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedChartChain, setSelectedChartChain] = useState('ethereum')
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Initialize with real Web3 service
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsInitializing(true)
        
        // Set up Web3 service callbacks
        Web3Service.setCallbacks({
          onGasUpdate: (chainId, gasData) => {
            updateChainDataWithHistory(chainId, gasData)
          },
          onPriceUpdate: (price) => {
            setUsdPrice(price)
          },
          onConnectionChange: (connected) => {
            setConnectionStatus(connected)
          }
        })
        
        // Initialize Web3 providers
        await Web3Service.initializeProviders()
        
        setIsInitializing(false)
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsInitializing(false)
        setConnectionStatus(false)
        
        // Fallback to mock data if Web3 fails
        const mockPrice = 3200 + Math.random() * 400
        setUsdPrice(mockPrice)
        
        const mockGasData = {
          ethereum: { baseFee: 15000000000, priorityFee: 2000000000, gasPrice: 17000000000, lastBlock: 18500000, timestamp: Date.now() },
          polygon: { baseFee: 30000000000, priorityFee: 2000000000, gasPrice: 32000000000, lastBlock: 48900000, timestamp: Date.now() },
          arbitrum: { baseFee: 100000000, priorityFee: 2000000000, gasPrice: 2100000000, lastBlock: 15600000, timestamp: Date.now() }
        }
        
        Object.entries(mockGasData).forEach(([chainId, data]) => {
          updateChainDataWithHistory(chainId, data)
        })
      }
    }
    
    initializeApp()
    
    // Cleanup on unmount
    return () => {
      Web3Service.disconnect()
    }
  }, [updateChainDataWithHistory, setUsdPrice, setConnectionStatus])
  
  // Fallback periodic updates if Web3 is not working
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        const mockPrice = 3200 + Math.random() * 400
        setUsdPrice(mockPrice)
        
        const mockGasData = {
          ethereum: { 
            baseFee: 15000000000 + Math.random() * 5000000000, 
            priorityFee: 2000000000, 
            gasPrice: 17000000000 + Math.random() * 5000000000,
            lastBlock: 18500000 + Math.floor(Math.random() * 100),
            timestamp: Date.now()
          },
          polygon: { 
            baseFee: 30000000000 + Math.random() * 10000000000, 
            priorityFee: 2000000000, 
            gasPrice: 32000000000 + Math.random() * 10000000000,
            lastBlock: 48900000 + Math.floor(Math.random() * 100),
            timestamp: Date.now()
          },
          arbitrum: { 
            baseFee: 100000000 + Math.random() * 50000000, 
            priorityFee: 2000000000, 
            gasPrice: 2100000000 + Math.random() * 50000000,
            lastBlock: 15600000 + Math.floor(Math.random() * 100),
            timestamp: Date.now()
          }
        }
        
        Object.entries(mockGasData).forEach(([chainId, data]) => {
          updateChainDataWithHistory(chainId, data)
        })
      }, 6000)
      
      return () => clearInterval(interval)
    }
  }, [isConnected, setUsdPrice, updateChainDataWithHistory])
  
  const formatGasPrice = (gasPrice) => {
    return (gasPrice / 1e9).toFixed(2)
  }
  
  const formatTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString()
    return new Date(timestamp).toLocaleTimeString()
  }
  
  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }
  
  const getGasCostUSD = (chainId) => {
    const chain = chains[chainId]
    if (!chain) return 0
    const gasLimit = 21000
    const gasCostWei = (chain.baseFee + chain.priorityFee) * gasLimit
    const gasCostEth = gasCostWei / Math.pow(10, 18)
    return gasCostEth * usdPrice
  }
  
  const getTransactionCostUSD = (chainId) => {
    const gasCost = getGasCostUSD(chainId)
    const transactionValue = simulationAmount * usdPrice
    return gasCost + transactionValue
  }
  
  const getCheapestChain = () => {
    let cheapest = null
    let lowestCost = Infinity
    
    Object.entries(chains).forEach(([chainId, chain]) => {
      const cost = getGasCostUSD(chainId)
      if (cost < lowestCost) {
        lowestCost = cost
        cheapest = chainId
      }
    })
    
    return cheapest
  }

  if (!mounted) {
    return null
  }
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mx-auto"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Initializing Gas Tracker
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Connecting to blockchain networks...
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gas Tracker
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
                Real-time cross-chain gas prices with wallet simulation
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 sm:gap-4 flex-wrap"
            >
              <Badge variant={isConnected ? "default" : "destructive"} className="gap-2 px-3 py-1">
                <motion.div
                  variants={pulseVariants}
                  animate={isConnected ? "animate" : ""}
                >
                  {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </motion.div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden md:inline">Last: {formatTime(lastUpdateTime)}</span>
                <span className="md:hidden">
                  <Clock className="w-4 h-4" />
                </span>
              </Button>
              
              <ThemeToggle />
            </motion.div>
          </div>
          
          {/* Mode Switch */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <Button
              variant={mode === 'live' ? 'default' : 'outline'}
              onClick={() => setMode('live')}
              className="gap-2 flex-1 sm:flex-none"
              size="sm"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Live Tracking</span>
              <span className="sm:hidden">Live</span>
            </Button>
            <Button
              variant={mode === 'simulation' ? 'default' : 'outline'}
              onClick={() => setMode('simulation')}
              className="gap-2 flex-1 sm:flex-none"
              size="sm"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Simulation</span>
              <span className="sm:hidden">Sim</span>
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Stats Bar */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </motion.div>
                  <span className="text-xs sm:text-sm text-muted-foreground">ETH/USD</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">
                  ${usdPrice.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </motion.div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Networks</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-500">3</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    variants={pulseVariants}
                    animate={isConnected ? "animate" : ""}
                  >
                    <Activity className="w-4 h-4 text-blue-500" />
                  </motion.div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Status</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-500">
                  {isConnected ? 'Live' : 'Offline'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <DollarSign className="w-4 h-4 text-purple-500" />
                  </motion.div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Mode</span>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-500 capitalize">
                  {mode}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Gas Tracker */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-2"
          >
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
            >
              <AnimatePresence>
                {Object.entries(chains).map(([chainId, chain], index) => (
                  <motion.div
                    key={chainId}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.div 
                              className="w-4 h-4 rounded-full relative"
                              style={{ backgroundColor: chain.color }}
                              animate={{ boxShadow: [`0 0 0 0 ${chain.color}40`, `0 0 0 8px ${chain.color}00`] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <CardTitle className="text-lg">{chain.name}</CardTitle>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <Badge variant="default" className="gap-1">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <Sparkles className="w-3 h-3" />
                              </motion.div>
                              Live
                            </Badge>
                          </motion.div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-muted-foreground">Gas Price</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.span 
                              className="text-xl sm:text-2xl font-bold"
                              key={chain.gasPrice}
                              initial={{ scale: 1.2, color: "#10b981" }}
                              animate={{ scale: 1, color: "inherit" }}
                              transition={{ duration: 0.3 }}
                            >
                              {formatGasPrice(chain.gasPrice)}
                            </motion.span>
                            <span className="text-sm text-muted-foreground">gwei</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Base Fee</p>
                            <p className="font-medium">{formatGasPrice(chain.baseFee)} gwei</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Priority Fee</p>
                            <p className="font-medium">{formatGasPrice(chain.priorityFee)} gwei</p>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              Block #{chain.lastBlock}
                            </span>
                            <span className="text-muted-foreground">
                              {formatTime(Date.now())}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Simulation Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {mode === 'simulation' && (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="w-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                          <Calculator className="w-5 h-5 text-blue-500" />
                        </motion.div>
                        <CardTitle className="text-lg sm:text-xl">Transaction Cost Simulator</CardTitle>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-medium">
                          Transfer Amount (ETH)
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.1"
                          value={simulationAmount}
                          onChange={(e) => setSimulationAmount(parseFloat(e.target.value) || 0)}
                          step="0.01"
                          min="0"
                          className="text-lg font-mono"
                        />
                        <p className="text-sm text-muted-foreground">
                          ≈ {formatUSD(simulationAmount * usdPrice)} USD
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Cost Comparison
                        </h4>
                        
                        <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid gap-3"
                        >
                          {Object.entries(chains).map(([chainId, chain], index) => {
                            const gasCost = getGasCostUSD(chainId)
                            const totalCost = getTransactionCostUSD(chainId)
                            const isCheapest = chainId === getCheapestChain()
                            
                            return (
                              <motion.div
                                key={chainId}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                                  isCheapest 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg' 
                                    : 'border-border bg-card hover:border-primary/20'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <motion.div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: chain.color }}
                                      animate={isCheapest ? { 
                                        boxShadow: [`0 0 0 0 ${chain.color}40`, `0 0 0 6px ${chain.color}00`] 
                                      } : {}}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                    <span className="font-medium">{chain.name}</span>
                                    <AnimatePresence>
                                      {isCheapest && (
                                        <motion.span
                                          initial={{ scale: 0, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          exit={{ scale: 0, opacity: 0 }}
                                          className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium"
                                        >
                                          Cheapest
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                  <motion.span 
                                    className="text-lg font-bold"
                                    key={totalCost}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {formatUSD(totalCost)}
                                  </motion.span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <Zap className="w-3 h-3 text-yellow-500" />
                                      <span className="text-muted-foreground">Gas Cost</span>
                                    </div>
                                    <p className="font-medium">{formatUSD(gasCost)}</p>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <DollarSign className="w-3 h-3 text-green-500" />
                                      <span className="text-muted-foreground">Transfer Value</span>
                                    </div>
                                    <p className="font-medium">{formatUSD(simulationAmount * usdPrice)}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {mode === 'live' && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          variants={pulseVariants}
                          animate="animate"
                        >
                          <Activity className="w-5 h-5 text-green-500" />
                        </motion.div>
                        Live Data Feed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Real-time gas prices from multiple blockchain networks
                        </p>
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 bg-green-500 rounded-full"
                          />
                          <span className="text-sm">Updates every 6 seconds</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Data Sources:</h4>
                        <motion.ul 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="text-sm space-y-1 text-muted-foreground"
                        >
                          {[
                            "• Ethereum: WebSocket RPC",
                            "• Polygon: WebSocket RPC", 
                            "• Arbitrum: WebSocket RPC",
                            "• ETH/USD: Uniswap V3 Pool"
                          ].map((item, i) => (
                            <motion.li
                              key={i}
                              variants={itemVariants}
                              className="flex items-center gap-2"
                            >
                              {item}
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setMode('simulation')}
                        className="w-full group"
                      >
                        <motion.div
                          className="flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Calculator className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                          Switch to Simulation Mode
                        </motion.div>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}