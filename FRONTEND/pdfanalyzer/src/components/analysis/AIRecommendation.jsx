import { Brain, CheckCircle, XCircle, AlertTriangle, Edit2 } from 'lucide-react'

export default function AIRecommendation({ recommendation, riskScore }) {
  if (!recommendation) return null

  const config = {
    approve: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-900',
      iconColor: 'text-green-600',
      title: '✅ Recommendation: Safe to Sign'
    },
    review: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      iconColor: 'text-yellow-600',
      title: '📋 Recommendation: Review & Proceed with Caution'
    },
    negotiate: {
      icon: Edit2,
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      iconColor: 'text-orange-600',
      title: '⚠️ Recommendation: Negotiate Changes First'
    },
    reject: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-900',
      iconColor: 'text-red-600',
      title: '🛑 Recommendation: Do NOT Sign'
    }
  }

  const cfg = config[recommendation.decision] || config.review
  const Icon = cfg.icon

  return (
    <div className={`${cfg.bg} border-2 ${cfg.border} rounded-lg p-6 mb-6`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <Brain className={`w-8 h-8 ${cfg.iconColor}`} />
          </div>
        </div>

        <div className="flex-1">
          <h3 className={`text-xl font-bold ${cfg.text} mb-3`}>
            {cfg.title}
          </h3>

          <p className="text-gray-800 text-base leading-relaxed mb-4">
            {recommendation.reasoning}
          </p>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Icon className={`w-5 h-5 ${cfg.iconColor} mr-2`} />
              Your Next Steps:
            </h4>
            <ul className="space-y-2">
              {recommendation.actions && recommendation.actions.map((action, idx) => (
                <li key={idx} className="flex items-start">
                  <span className={`font-bold ${cfg.text} mr-2`}>{idx + 1}.</span>
                  <span className="text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}