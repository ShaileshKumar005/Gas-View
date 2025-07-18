'use client'

import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import { useGasStore } from '@/lib/store'

export default function GasChart({ chainId }) {
  const chartContainerRef = useRef()
  const chartRef = useRef()
  const seriesRef = useRef()
  const chains = useGasStore(state => state.chains)
  const chain = chains[chainId]
  
  useEffect(() => {
    if (!chartContainerRef.current) return
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#2D3748' },
        horzLines: { color: '#2D3748' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485563',
      },
      timeScale: {
        borderColor: '#485563',
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
    if (!seriesRef.current || !chain.history.length) return
    
    // Convert history to candlestick data (15-minute intervals)
    const candlestickData = chain.history.map(point => ({
      time: Math.floor(point.timestamp / 60) * 60, // Round to minute
      open: point.gasPrice / 1e9, // Convert to gwei
      high: point.gasPrice / 1e9,
      low: point.gasPrice / 1e9,
      close: point.gasPrice / 1e9,
    }))
    
    seriesRef.current.setData(candlestickData)
  }, [chain.history])
  
  return (
    <div className="w-full h-[300px] bg-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{chain.name} Gas Price</h3>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: chain.color }}
          />
          <span className="text-sm text-muted-foreground">
            {(chain.gasPrice / 1e9).toFixed(2)} gwei
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  )
}