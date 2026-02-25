import { useParams, Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import SimpleSummary from '../components/analysis/SimpleSummary'
import AIRecommendation from '../components/analysis/AIRecommendation'
import RiskBreakdown from '../components/analysis/RiskBreakdown'
import ClauseComparison from '../components/analysis/ClauseComparison'
import DecisionHelper from '../components/analysis/DecisionHelper'
import ClauseList from '../components/analysis/ClauseList'
import Spinner from '../components/common/Spinner'
import { useAnalysis } from '../hooks/useAnalysis'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function AnalysisPageSimple() {
  const { id } = useParams()
  const { loading, error, data } = useAnalysis(id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const { result } = data
  const { risk_score, clauses, recommendation } = result

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        {/* Simple Summary with Score */}
        <SimpleSummary result={result} />

        {/* AI Recommendation */}
        {recommendation && (
          <AIRecommendation 
            recommendation={recommendation}
            riskScore={risk_score.overall}
          />
        )}

        {/* Risk Breakdown */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Breakdown</h2>
          <RiskBreakdown
            financial={risk_score.financial}
            legal={risk_score.legal}
            operational={risk_score.operational}
          />
        </div>

        {/* What to Change vs Accept */}
        <ClauseComparison clauses={clauses} />

        {/* Decision Helper */}
        <DecisionHelper 
          riskScore={risk_score.overall}
          clauseCount={clauses.length}
        />

        {/* All Clauses (collapsible) */}
        <details className="bg-white border border-gray-200 rounded-lg p-6">
          <summary className="cursor-pointer font-bold text-gray-900 text-xl mb-4">
            📋 All Detected Clauses ({clauses.length})
          </summary>
          <ClauseList clauses={clauses} />
        </details>
      </main>

      <Footer />
    </div>
  )
}