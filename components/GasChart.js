'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { useGasStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, LineChart, Layers } from 'lucide-react'

export default function GasChart({ chainId }) {
  const chartContainerRef = useRef()
  const chartRef = useRef()
  const seriesRef = useRef({})
  const [chartType, setChartType] = useState('candlestick') // 'candlestick', 'line', 'comparison'
  
  const { chains, getOHLCData, mode } = useGasStore()
  const chain = chains[chainId]
  
  useEffect(() => {
    if (!chartContainerRef.current) return
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 350,
      layout: {
        background: { color: 'transparent' },
        textColor: '#71717a',
      },
      grid: {
        vertLines: { color: '#27272a20' },
        horzLines: { color: '#27272a20' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#27272a',
        textColor: '#71717a',
        titleColor: '#71717a',
      },
      timeScale: {
        borderColor: '#27272a',
        textColor: '#71717a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })
    
    chartRef.current = chart
    seriesRef.current = {}
    
    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)
    
    return () => {
      resizeObserver.disconnect()
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [])
  
  // Update chart data when history changes or chart type changes
  useEffect(() => {
    if (!chartRef.current) return
    
    // Clear existing series
    Object.values(seriesRef.current).forEach(series => {
      try {
        chartRef.current.removeSeries(series)
      } catch (e) {
        // Series might already be removed
      }
    })
    seriesRef.current = {}
    
    if (chartType === 'comparison' || mode === 'simulation') {
      // Show all networks for comparison
      Object.entries(chains).forEach(([networkId, networkChain]) => {
        const networkOhlcData = getOHLCData(networkId, 15)
        
        if (networkOhlcData.length > 0) {
          const lineSeries = chartRef.current.addLineSeries({
            color: networkChain.color,
            lineWidth: 2,
            title: networkChain.name,
          })
          
          // Convert OHLC to line data (use close prices)
          const lineData = networkOhlcData.map(ohlc => ({
            time: ohlc.time,
            value: ohlc.close
          }))
          
          lineSeries.setData(lineData)
          seriesRef.current[networkId] = lineSeries
        } else if (networkChain.history.length > 0) {
          // Fallback to history data
          const lineSeries = chartRef.current.addLineSeries({
            color: networkChain.color,
            lineWidth: 2,
            title: networkChain.name,
          })
          
          const lineData = networkChain.history.map(point => ({
            time: Math.floor((point.timestamp || Date.now()) / 1000),
            value: point.gasPrice / 1e9 // Convert to gwei
          }))
          
          lineSeries.setData(lineData)
          seriesRef.current[networkId] = lineSeries
        }
      })
    } else {
      // Show single network
      if (!chain) return
      
      if (chartType === 'candlestick') {
        // OHLC Candlestick chart
        const ohlcData = getOHLCData(chainId, 15)
        
        if (ohlcData.length > 0) {
          const candlestickSeries = chartRef.current.addCandlestickSeries({
            upColor: '#10B981',
            downColor: '#EF4444',
            borderDownColor: '#EF4444',
            borderUpColor: '#10B981',
            wickDownColor: '#EF4444',
            wickUpColor: '#10B981',
            title: `${chain.name} OHLC`,
          })
          
          candlestickSeries.setData(ohlcData)
          seriesRef.current[chainId] = candlestickSeries
        } else {
          // Fallback to line chart if no OHLC data
          setChartType('line')
        }
      } else if (chartType === 'line') {
        // Line chart
        const lineSeries = chartRef.current.addLineSeries({
          color: chain.color,
          lineWidth: 2,
          title: `${chain.name} Gas Price`,
        })
        
        if (chain.history.length > 0) {
          const lineData = chain.history.map(point => ({
            time: Math.floor((point.timestamp || Date.now()) / 1000),
            value: point.gasPrice / 1e9 // Convert to gwei
          }))
          
          lineSeries.setData(lineData)
          seriesRef.current[chainId] = lineSeries
        }
      }
    }
    
    // Auto-fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
    
  }, [chain?.history, chainId, getOHLCData, chain?.color, chartType, chains, mode])
  
  const isComparisonMode = chartType === 'comparison' || mode === 'simulation'
  
  return (
    <div className="w-full space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {isComparisonMode ? 'Network Comparison' : `${chain?.name} Gas Price`}
          </h3>
          {mode === 'simulation' && (
            <Badge variant="secondary" className="gap-1">
              <Layers className="w-3 h-3" />
              Simulation Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isComparisonMode && (
            <>
              <Button
                variant={chartType === 'candlestick' ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType('candlestick')}
                className="gap-1"
              >
                <BarChart3 className="w-3 h-3" />
                OHLC
              </Button>
              <Button
                variant={chartType === 'line' ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType('line')}
                className="gap-1"
              >
                <LineChart className="w-3 h-3" />
                Line
              </Button>
            </>
          )}
          <Button
            variant={chartType === 'comparison' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType(chartType === 'comparison' ? 'candlestick' : 'comparison')}
            className="gap-1"
          >
            <Layers className="w-3 h-3" />
            Compare
          </Button>
        </div>
      </div>
      
      {/* Chart Legend for Comparison Mode */}
      {isComparisonMode && (
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(chains).map(([networkId, networkChain]) => (
            <div key={networkId} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: networkChain.color }}
              />
              <span className="text-sm font-medium">{networkChain.name}</span>
              <span className="text-sm text-muted-foreground">
                {(networkChain.gasPrice / 1e9).toFixed(2)} gwei
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Single Network Info */}
      {!isComparisonMode && chain && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chain.color }}
            />
            <span className="text-sm font-medium">{chain.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Current: <span className="font-medium">{(chain.gasPrice / 1e9).toFixed(2)} gwei</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Block: <span className="font-medium">#{chain.lastBlock}</span>
          </div>
        </div>
      )}
      
      {/* Chart Container */}
      <div className="w-full h-[350px] rounded-lg border bg-card/50">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
      
      {/* Chart Type Info */}
      <div className="text-xs text-muted-foreground">
        {chartType === 'candlestick' && 'OHLC: Open, High, Low, Close prices in 15-minute intervals'}
        {chartType === 'line' && 'Real-time gas price trend'}
        {chartType === 'comparison' && 'Live comparison of gas prices across networks'}
        {mode === 'simulation' && ' • Perfect for finding the cheapest network for your transaction'}
      </div>
    </div>
  )
}