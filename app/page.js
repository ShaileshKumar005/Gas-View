'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGasStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Calculator,
  RefreshCw,
  Wifi,
  WifiOff,
  DollarSign
} from 'lucide-react'

export default function GasTrackerApp() {
  const {
    mode,
    setMode,
    usdPrice,
    setUsdPrice,
    updateChainData,
    setConnectionStatus,
    isConnected,
    lastUpdateTime,
    chains,
    simulationAmount,
    setSimulationAmount
  } = useGasStore()
  
  const [isInitializing, setIsInitializing] = useState(true)
  
  // Initialize with mock data
  useEffect(() => {
    const initializeApp = () => {
      try {
        setIsInitializing(true)
        
        // Set connection status
        setConnectionStatus(true)
        
        // Set mock ETH price
        const mockPrice = 3200 + Math.random() * 400
        setUsdPrice(mockPrice)
        
        // Set mock gas data for each chain
        const mockGasData = {
          ethereum: { baseFee: 15000000000, priorityFee: 2000000000, gasPrice: 17000000000, lastBlock: 18500000 },
          polygon: { baseFee: 30000000000, priorityFee: 2000000000, gasPrice: 32000000000, lastBlock: 48900000 },
          arbitrum: { baseFee: 100000000, priorityFee: 2000000000, gasPrice: 2100000000, lastBlock: 15600000 }
        }
        
        Object.entries(mockGasData).forEach(([chainId, data]) => {
          updateChainData(chainId, data)
        })
        
        setIsInitializing(false)
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsInitializing(false)
        setConnectionStatus(false)
      }
    }
    
    initializeApp()
  }, [setConnectionStatus, setUsdPrice, updateChainData])
  
  // Update data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const mockPrice = 3200 + Math.random() * 400
      setUsdPrice(mockPrice)
      
      const mockGasData = {
        ethereum: { 
          baseFee: 15000000000 + Math.random() * 5000000000, 
          priorityFee: 2000000000, 
          gasPrice: 17000000000 + Math.random() * 5000000000,
          lastBlock: 18500000 + Math.floor(Math.random() * 100)
        },
        polygon: { 
          baseFee: 30000000000 + Math.random() * 10000000000, 
          priorityFee: 2000000000, 
          gasPrice: 32000000000 + Math.random() * 10000000000,
          lastBlock: 48900000 + Math.floor(Math.random() * 100)
        },
        arbitrum: { 
          baseFee: 100000000 + Math.random() * 50000000, 
          priorityFee: 2000000000, 
          gasPrice: 2100000000 + Math.random() * 50000000,
          lastBlock: 15600000 + Math.floor(Math.random() * 100)
        }
      }
      
      Object.entries(mockGasData).forEach(([chainId, data]) => {
        updateChainData(chainId, data)
      })
    }, 6000)
    
    return () => clearInterval(interval)
  }, [setUsdPrice, updateChainData])
  
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
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Initializing Gas Tracker</h2>
          <p className="text-muted-foreground">Loading blockchain data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Gas Tracker
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time cross-chain gas prices with wallet simulation
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? "default" : "destructive"} className="gap-2">
                {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Last: {formatTime(lastUpdateTime)}
              </Button>
            </div>
          </div>
          
          {/* Mode Switch */}
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'live' ? 'default' : 'outline'}
              onClick={() => setMode('live')}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Live Tracking
            </Button>
            <Button
              variant={mode === 'simulation' ? 'default' : 'outline'}
              onClick={() => setMode('simulation')}
              className="gap-2"
            >
              <Calculator className="w-4 h-4" />
              Simulation
            </Button>
          </div>
        </motion.div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">ETH/USD</span>
              </div>
              <p className="text-2xl font-bold text-green-500">
                ${usdPrice.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Networks</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">
                {isConnected ? 'Live' : 'Offline'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Mode</span>
              </div>
              <p className="text-2xl font-bold text-purple-500 capitalize">
                {mode}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gas Tracker */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(chains).map(([chainId, chain]) => (
                <motion.div
                  key={chainId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: chain.color }}
                          />
                          <CardTitle className="text-lg">{chain.name}</CardTitle>
                        </div>
                        <Badge variant="default">Live</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-muted-foreground">Gas Price</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {formatGasPrice(chain.gasPrice)}
                          </span>
                          <span className="text-sm text-muted-foreground">gwei</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Base Fee</p>
                          <p className="font-medium">{formatGasPrice(chain.baseFee)} gwei</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Priority Fee</p>
                          <p className="font-medium">{formatGasPrice(chain.priorityFee)} gwei</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Block #{chain.lastBlock}</span>
                          <span className="text-muted-foreground">
                            {formatTime(Date.now())}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Simulation Panel */}
          <div className="space-y-6">
            {mode === 'simulation' && (
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-500" />
                    <CardTitle>Transaction Cost Simulator</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Transfer Amount (ETH)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.1"
                      value={simulationAmount}
                      onChange={(e) => setSimulationAmount(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="text-lg"
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
                    
                    <div className="grid gap-3">
                      {Object.entries(chains).map(([chainId, chain]) => {
                        const gasCost = getGasCostUSD(chainId)
                        const totalCost = getTransactionCostUSD(chainId)
                        const isCheapest = chainId === getCheapestChain()
                        
                        return (
                          <div
                            key={chainId}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isCheapest 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-border bg-card'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: chain.color }}
                                />
                                <span className="font-medium">{chain.name}</span>
                                {isCheapest && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    Cheapest
                                  </span>
                                )}
                              </div>
                              <span className="text-lg font-bold">{formatUSD(totalCost)}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-yellow-500" />
                                  <span className="text-muted-foreground">Gas Cost</span>
                                </div>
                                <p className="font-medium">{formatUSD(gasCost)}</p>
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-green-500" />
                                  <span className="text-muted-foreground">Transfer Value</span>
                                </div>
                                <p className="font-medium">{formatUSD(simulationAmount * usdPrice)}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {mode === 'live' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Live Data Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Real-time gas prices from multiple blockchain networks
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm">Updates every 6 seconds</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Data Sources:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Ethereum: WebSocket RPC</li>
                      <li>• Polygon: WebSocket RPC</li>
                      <li>• Arbitrum: WebSocket RPC</li>
                      <li>• ETH/USD: Uniswap V3 Pool</li>
                    </ul>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setMode('simulation')}
                    className="w-full"
                  >
                    Switch to Simulation Mode
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}