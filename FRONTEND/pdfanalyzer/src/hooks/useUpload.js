import { useState } from 'react'
import { api } from '../api/client'

export const useUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const upload = async (file) => {
    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const data = await api.uploadDocument(file)
      setResult(data)
      return data
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Upload failed'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setUploading(false)
    setError(null)
    setResult(null)
  }

  return {
    upload,
    uploading,
    error,
    result,
    reset,
  }
}