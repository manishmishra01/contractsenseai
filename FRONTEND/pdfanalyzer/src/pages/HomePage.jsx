import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import UploadZone from '../components/upload/UploadZone'
import { useUpload } from '../hooks/useUpload'
import { CheckCircle, Zap, Shield, FileSearch } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { upload, uploading, error } = useUpload()

  const handleUpload = async (file) => {
    try {
      const result = await upload(file)
      
      // Navigate to analysis page after successful upload
      if (result.document_id) {
        navigate(`/analysis/${result.document_id}`)
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Analyze Legal Contracts <br />
            <span className="text-blue-600">with AI in Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload any contract and get instant risk analysis, clause detection, 
            and detailed insights powered by advanced AI.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="max-w-2xl mx-auto mb-16">
          <UploadZone 
            onUpload={handleUpload}
            uploading={uploading}
            error={error}
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Analysis</h3>
            <p className="text-gray-600 text-sm">
              Get comprehensive contract analysis in under 3 minutes using 
              state-of-the-art AI models.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Risk Detection</h3>
            <p className="text-gray-600 text-sm">
              Automatically identify risky clauses including payment terms, 
              liability issues, and unfair conditions.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileSearch className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Detailed Reports</h3>
            <p className="text-gray-600 text-sm">
              Receive structured analysis with risk scores, flagged clauses, 
              and actionable recommendations.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            How It Works
          </h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Upload', desc: 'Drop your PDF, DOCX, or TXT contract' },
              { step: 2, title: 'Analyze', desc: 'AI extracts text and detects clauses' },
              { step: 3, title: 'Review', desc: 'Get risk scores and detailed findings' },
              { step: 4, title: 'Decide', desc: 'Use insights to negotiate or sign confidently' },
            ].map(item => (
              <div key={item.step} className="flex items-start space-x-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}