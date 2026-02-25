import { FileText, AlertCircle } from 'lucide-react'

export default function SimpleSummary({ result }) {
  const { risk_score, summary, recommendation } = result
  
  const getRiskColor = (score) => {
    if (score >= 8) return 'text-red-600'
    if (score >= 6) return 'text-orange-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskLabel = (score) => {
    if (score >= 8) return 'High Risk'
    if (score >= 6) return 'Medium-High Risk'
    if (score >= 3) return 'Medium Risk'
    return 'Low Risk'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {summary.filename}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{summary.page_count} pages</span>
            <span>•</span>
            <span>{summary.clauses_found} clauses detected</span>
            <span>•</span>
            <span>{summary.flagged_clauses} need attention</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-5xl font-bold ${getRiskColor(risk_score.overall)}`}>
            {risk_score.overall.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">out of 10</div>
          <div className={`text-sm font-semibold mt-1 ${getRiskColor(risk_score.overall)}`}>
            {getRiskLabel(risk_score.overall)}
          </div>
        </div>
      </div>

      {recommendation && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-gray-800 leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>
      )}
    </div>
  )
}