import { FileText, List, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SummaryStats({ summary }) {
  const stats = [
    {
      label: 'Pages',
      value: summary.page_count,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Words',
      value: summary.word_count.toLocaleString(),
      icon: List,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Clauses Found',
      value: summary.clauses_found,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Flagged Issues',
      value: summary.flagged_clauses,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}