'use client'

import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import { useGasStore } from '@/lib/store'

export default function GasChart({ chainId }) {
  const chartContainerRef = useRef()
  const chartRef = useRef()
  const seriesRef = useRef()
  const chains = useGasStore(state => state.chains)
  const getOHLCData = useGasStore(state => state.getOHLCData)
  const chain = chains[chainId]
  
  useEffect(() => {
    if (!chartContainerRef.current) return
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: 'transparent' },
        textColor: '#71717a',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#27272a',
        textColor: '#71717a',
      },
      timeScale: {
        borderColor: '#27272a',
        textColor: '#71717a',
        timeVisible: true,
        secondsVisible: false,
      },
    })
    
    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderDownColor: '#EF4444',
      borderUpColor: '#10B981',
      wickDownColor: '#EF4444',
      wickUpColor: '#10B981',
    })
    
    chartRef.current = chart
    seriesRef.current = candlestickSeries
    
    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [])
  
  // Update chart data when history changes
  useEffect(() => {
    if (!seriesRef.current || !chain) return
    
    // Get OHLC data from store
    const ohlcData = getOHLCData(chainId, 15) // 15-minute intervals
    
    if (ohlcData.length > 0) {
      seriesRef.current.setData(ohlcData)
    } else {
      // Fallback to simple line data if no OHLC data
      const lineData = chain.history.map(point => ({
        time: Math.floor((point.timestamp || Date.now()) / 1000),
        value: point.gasPrice / 1e9 // Convert to gwei
      }))
      
      if (lineData.length > 0) {
        // Remove candlestick series and add line series
        chartRef.current.removeSeries(seriesRef.current)
        const lineSeries = chartRef.current.addLineSeries({
          color: chain.color,
          lineWidth: 2,
        })
        lineSeries.setData(lineData)
        seriesRef.current = lineSeries
      }
    }
  }, [chain?.history, chainId, getOHLCData, chain?.color])
  
  return (
    <div className="w-full h-[300px] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{chain?.name} Gas Price</h3>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: chain?.color }}
          />
          <span className="text-sm text-muted-foreground">
            {(chain?.gasPrice / 1e9).toFixed(2)} gwei
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  )
}