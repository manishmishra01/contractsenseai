// Format file size in bytes to human readable
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format risk score to 1 decimal place
export const formatRiskScore = (score) => {
  return typeof score === 'number' ? score.toFixed(1) : '0.0'
}

// Get risk label from score
export const getRiskLabel = (score) => {
  if (score < 3) return 'low'
  if (score < 6) return 'medium'
  if (score < 8) return 'high'
  return 'critical'
}

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}