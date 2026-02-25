import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  // Upload a document
  uploadDocument: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const { data } = await axios.post(`${API_URL}/api/v1/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },
  
  // Get analysis result
  getAnalysis: async (documentId) => {
    const { data } = await axios.get(`${API_URL}/api/v1/analysis/${documentId}`)
    return data
  },
  
  // List all documents
  getDocuments: async () => {
    const { data } = await axios.get(`${API_URL}/api/v1/documents`)
    return data.documents
  }
}