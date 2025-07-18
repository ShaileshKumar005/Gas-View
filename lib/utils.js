import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount)
}

export function formatNumber(number, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

export function formatGwei(wei) {
  return (wei / 1e9).toFixed(2)
}

export function formatEth(wei) {
  return (wei / 1e18).toFixed(6)
}

export function calculateGasCost(baseFee, priorityFee, gasLimit = 21000) {
  return (baseFee + priorityFee) * gasLimit
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateMockGasData(chainId) {
  const baseGasMap = {
    ethereum: 15, // 15 gwei average
    polygon: 30,  // 30 gwei average  
    arbitrum: 0.1 // 0.1 gwei average
  }
  
  const baseGas = baseGasMap[chainId] || 15
  const variation = 0.7 + Math.random() * 0.6 // ±30% variation
  const baseFee = Math.floor(baseGas * variation * 1e9)
  const priorityFee = Math.floor(2 * 1e9) // 2 gwei
  
  return {
    baseFee,
    priorityFee,
    gasPrice: baseFee + priorityFee,
    lastBlock: 18000000 + Math.floor(Math.random() * 1000),
    timestamp: Math.floor(Date.now() / 1000)
  }
}