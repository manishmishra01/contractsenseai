import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { AlertTriangle } from 'lucide-react'
import { formatRiskScore } from '../../utils/formatters'
import { RISK_TEXT_COLORS } from '../../utils/constants'

export default function RiskGauge({ score, label }) {
  // Convert 0-10 score to percentage for the pie chart
  const percentage = (score / 10) * 100
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ]

  const getColor = () => {
    if (score < 3) return '#10B981' // green
    if (score < 6) return '#F59E0B' // amber
    if (score < 8) return '#EF4444' // red
    return '#DC2626' // dark red
  }

  const color = getColor()

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={70}
                outerRadius={90}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold" style={{ color }}>
              {formatRiskScore(score)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              out of 10
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${RISK_TEXT_COLORS[label]}`} />
            <h3 className={`text-xl font-bold capitalize ${RISK_TEXT_COLORS[label]}`}>
              {label} Risk
            </h3>
          </div>
          <p className="text-sm text-gray-600 max-w-md">
            {label === 'low' && 'This contract has minimal risk factors.'}
            {label === 'medium' && 'This contract has some concerning clauses that should be reviewed.'}
            {label === 'high' && 'This contract contains several risky clauses. Legal review recommended.'}
            {label === 'critical' && 'This contract has critical issues. Do not sign without legal counsel.'}
          </p>
        </div>
      </div>
    </div>
  )
}