import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Spinner from '../components/common/Spinner'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import { api } from '../api/client'
import { formatDate, formatFileSize } from '../utils/formatters'
import { FileText, AlertCircle, ExternalLink } from 'lucide-react'

export default function HistoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await api.getDocuments()
        setDocuments(docs)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Document History
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Failed to load documents</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first contract to get started
            </p>
            <Link to="/">
              <Button>Upload Contract</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {doc.filename}
                          </div>
                          {doc.file_size && (
                            <div className="text-sm text-gray-500">
                              {formatFileSize(doc.file_size)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge level={
                        doc.status === 'complete' ? 'low' :
                        doc.status === 'failed' ? 'high' : 'medium'
                      }>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {doc.risk_score ? (
                        <span className="text-lg font-semibold text-gray-900">
                          {doc.risk_score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(doc.uploaded_at)}
                    </td>
                    <td className="px-6 py-4">
                      {doc.status === 'complete' && (
                        <Link
                          to={`/analysis/${doc.id}`}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Analysis
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}