// Risk level colors for badges and UI
export const RISK_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  high: 'bg-red-100 text-red-800 border-red-300',
  critical: 'bg-red-200 text-red-900 border-red-400',
}

export const RISK_TEXT_COLORS = {
  low: 'text-green-600',
  medium: 'text-amber-600',
  high: 'text-red-600',
  critical: 'text-red-700',
}

export const RISK_BG_COLORS = {
  low: 'bg-green-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
  critical: 'bg-red-600',
}

// API URL from environment
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Max file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024