import { useState, useEffect } from 'react'
import { api } from '../api/client'

export const useAnalysis = (documentId) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!documentId) return

    const fetchAnalysis = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.getAnalysis(documentId)
        setData(result)
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to load analysis'
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [documentId])

  return { loading, error, data }
}