import { DollarSign, Scale, Clock } from 'lucide-react'
import { formatRiskScore } from '../../utils/formatters'
import clsx from 'clsx'

export default function RiskBreakdown({ financial, legal, operational }) {
  const categories = [
    {
      label: 'Financial Risk',
      score: financial,
      icon: DollarSign,
      description: 'Payment terms, fees, penalties',
    },
    {
      label: 'Legal Risk',
      score: legal,
      icon: Scale,
      description: 'Liability, indemnification, confidentiality',
    },
    {
      label: 'Operational Risk',
      score: operational,
      icon: Clock,
      description: 'Termination, renewal, obligations',
    },
  ]

  const getColor = (score) => {
    if (score < 3) return 'bg-green-500'
    if (score < 6) return 'bg-amber-500'
    if (score < 8) return 'bg-red-500'
    return 'bg-red-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">
        Risk Breakdown
      </h3>

      <div className="space-y-6">
        {categories.map((category) => {
          const Icon = category.icon
          const percentage = (category.score / 10) * 100

          return (
            <div key={category.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {category.label}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {formatRiskScore(category.score)}
                </span>
              </div>

              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full transition-all duration-500', getColor(category.score))}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {category.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}