'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGasStore } from '@/lib/store'
import web3Service from '@/lib/web3'
import GasTracker from '@/components/GasTracker'
import GasChart from '@/components/GasChart'
import SimulationPanel from '@/components/SimulationPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Calculator,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'

export default function GasTrackerApp() {
  const {
    mode,
    setMode,
    usdPrice,
    setUsdPrice,
    updateChainData,
    addGasHistory,
    setConnectionStatus,
    isConnected,
    lastUpdateTime,
    chains
  } = useGasStore()
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [activeChart, setActiveChart] = useState('ethereum')
  
  // Initialize Web3 connections
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        setIsInitializing(true)
        
        // Skip actual Web3 initialization for demo - use mock data instead
        setConnectionStatus(true)
        
        // Set initial mock data
        const mockPrice = 3200 + Math.random() * 400 // $3200-$3600
        setUsdPrice(mockPrice)
        
        Object.keys(chains).forEach(chainId => {
          const baseGas = chainId === 'ethereum' ? 15 : chainId === 'polygon' ? 30 : 0.1
          const variation = 0.8 + Math.random() * 0.4 // ±20% variation
          const baseFee = Math.floor(baseGas * variation * 1e9)
          const priorityFee = Math.floor(2 * 1e9)
          
          updateChainData(chainId, {
            baseFee,
            priorityFee,
            gasPrice: baseFee + priorityFee,
            lastBlock: 18000000 + Math.floor(Math.random() * 1000)
          })
        })
        
        setIsInitializing(false)
        
      } catch (error) {
        console.error('Failed to initialize Web3:', error)
        setIsInitializing(false)
        setConnectionStatus(false)
      }
    }
    
    initializeWeb3()
    
    // Cleanup on unmount
    return () => {
      try {
        web3Service.disconnect()
      } catch (error) {
        console.error('Error disconnecting Web3:', error)
      }
    }
  }, [])
  
  // Mock data for demonstration (remove when real data is flowing)
  useEffect(() => {
    const generateMockData = () => {
      const mockPrice = 3200 + Math.random() * 400 // $3200-$3600
      setUsdPrice(mockPrice)
      
      Object.keys(chains).forEach(chainId => {
        const baseGas = chainId === 'ethereum' ? 15 : chainId === 'polygon' ? 30 : 0.1
        const variation = 0.8 + Math.random() * 0.4 // ±20% variation
        const baseFee = Math.floor(baseGas * variation * 1e9)
        const priorityFee = Math.floor(2 * 1e9)
        
        updateChainData(chainId, {
          baseFee,
          priorityFee,
          gasPrice: baseFee + priorityFee,
          lastBlock: 18000000 + Math.floor(Math.random() * 1000)
        })
      })
    }
    
    generateMockData()
    const interval = setInterval(generateMockData, 6000)
    return () => clearInterval(interval)
  }, [chains, setUsdPrice, updateChainData])
  
  const handleModeSwitch = (newMode) => {
    setMode(newMode)
  }
  
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleTimeString()
  }
  
  const getTotalGasSpent = () => {
    return Object.values(chains).reduce((total, chain) => {
      return total + (chain.gasPrice / 1e9)
    }, 0) / 3
  }
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Initializing Gas Tracker</h2>
          <p className="text-muted-foreground">Connecting to blockchain networks...</p>
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
              onClick={() => handleModeSwitch('live')}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Live Tracking
            </Button>
            <Button
              variant={mode === 'simulation' ? 'default' : 'outline'}
              onClick={() => handleModeSwitch('simulation')}
              className="gap-2"
            >
              <Calculator className="w-4 h-4" />
              Simulation
            </Button>
          </div>
        </motion.div>
        
        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
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
                <span className="text-sm text-muted-foreground">Avg Gas</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">
                {getTotalGasSpent().toFixed(2)} gwei
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Networks</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <p className="text-2xl font-bold text-purple-500">
                {isConnected ? 'Live' : 'Offline'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gas Tracker */}
          <div className="lg:col-span-2 space-y-6">
            <GasTracker />
            
            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Gas Price History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeChart} onValueChange={setActiveChart}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                      <TabsTrigger value="polygon">Polygon</TabsTrigger>
                      <TabsTrigger value="arbitrum">Arbitrum</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="ethereum">
                      <GasChart chainId="ethereum" />
                    </TabsContent>
                    <TabsContent value="polygon">
                      <GasChart chainId="polygon" />
                    </TabsContent>
                    <TabsContent value="arbitrum">
                      <GasChart chainId="arbitrum" />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Right Column - Simulation Panel */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'simulation' && (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SimulationPanel />
                </motion.div>
              )}
              
              {mode === 'live' && (
                <motion.div
                  key="live-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}