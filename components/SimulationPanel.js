'use client'

import { motion } from 'framer-motion'
import { useGasStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calculator, DollarSign, Zap } from 'lucide-react'

export default function SimulationPanel() {
  const { 
    chains, 
    usdPrice, 
    simulationAmount, 
    setSimulationAmount,
    getGasCostUSD,
    getTransactionCostUSD
  } = useGasStore()
  
  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    setSimulationAmount(value)
  }
  
  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
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
  
  const cheapestChain = getCheapestChain()
  
  return (
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
            onChange={handleAmountChange}
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
              const isCheapest = chainId === cheapestChain
              
              return (
                <motion.div
                  key={chainId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
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
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Gas Price: {(chain.gasPrice / 1e9).toFixed(2)} gwei
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ETH/USD Price</span>
            <span className="font-medium">{formatUSD(usdPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}