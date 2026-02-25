import { AlertTriangle } from 'lucide-react'
import Badge from '../common/Badge'
import { capitalize } from '../../utils/formatters'

export default function ClauseCard({ clause }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className={`w-5 h-5 ${
            clause.risk_level === 'critical' ? 'text-red-600' :
            clause.risk_level === 'high' ? 'text-red-500' :
            clause.risk_level === 'medium' ? 'text-amber-500' :
            'text-green-500'
          }`} />
          <h4 className="font-semibold text-gray-900">
            {clause.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
        </div>
        <Badge level={clause.risk_level}>
          {capitalize(clause.risk_level)}
        </Badge>
      </div>

      {/* Source Text */}
      <div className="bg-gray-50 rounded p-3 mb-3">
        <p className="text-sm text-gray-700 italic leading-relaxed">
          "{clause.source_text}"
        </p>
      </div>

      {/* Finding */}
      <p className="text-sm text-gray-900 mb-3">
        <span className="font-semibold">Finding:</span> {clause.finding}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {clause.section_ref && clause.section_ref !== 'None' && (
            <>Section: {clause.section_ref}</>
          )}
        </span>
        <span>Confidence: {(clause.confidence * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}