import { Check, X } from 'lucide-react'
import Badge from '../common/Badge'

export default function ClauseComparison({ clauses }) {
  const mustChange = clauses.filter(c => ['critical', 'high'].includes(c.risk_level))
  const canAccept = clauses.filter(c => ['low', 'medium'].includes(c.risk_level))

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        What to Change vs Accept
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Must Change */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-red-900 flex items-center text-lg">
              <X className="w-5 h-5 mr-2" />
              Must Fix ({mustChange.length})
            </h3>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {mustChange.length === 0 ? (
              <p className="text-sm text-gray-600 italic">No critical issues ✓</p>
            ) : (
              mustChange.map((clause, idx) => (
                <div key={idx} className="bg-white rounded p-3 border border-red-200">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {clause.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <Badge level={clause.risk_level} className="text-xs" />
                  </div>
                  <p className="text-xs text-gray-700">
                    {clause.finding}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Can Accept */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-green-900 flex items-center text-lg">
              <Check className="w-5 h-5 mr-2" />
              Can Accept ({canAccept.length})
            </h3>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {canAccept.length === 0 ? (
              <p className="text-sm text-gray-600 italic">All need review</p>
            ) : (
              canAccept.slice(0, 5).map((clause, idx) => (
                <div key={idx} className="bg-white rounded p-3 border border-green-200">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {clause.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <Badge level={clause.risk_level} className="text-xs" />
                  </div>
                  <p className="text-xs text-gray-700">
                    {clause.finding}
                  </p>
                </div>
              ))
            )}
            {canAccept.length > 5 && (
              <p className="text-xs text-gray-600 text-center pt-2">
                + {canAccept.length - 5} more
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}