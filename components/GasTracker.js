'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGasStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, TrendingUp, TrendingDown } from 'lucide-react'

export default function GasTracker() {
  const { chains, lastUpdateTime, isConnected } = useGasStore()
  
  const formatGasPrice = (gasPrice) => {
    return (gasPrice / 1e9).toFixed(2)
  }
  
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp * 1000).toLocaleTimeString()
  }
  
  const getGasTrend = (history) => {
    if (history.length < 2) return 'neutral'
    const current = history[history.length - 1]?.gasPrice || 0
    const previous = history[history.length - 2]?.gasPrice || 0
    
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'neutral'
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AnimatePresence>
        {Object.entries(chains).map(([chainId, chain]) => {
          const trend = getGasTrend(chain.history)
          
          return (
            <motion.div
              key={chainId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? 'Live' : 'Offline'}
                    </Badge>
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
                      {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
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
                        {formatTime(lastUpdateTime)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${chain.color}20 0%, transparent 100%)`
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%']
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                />
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}