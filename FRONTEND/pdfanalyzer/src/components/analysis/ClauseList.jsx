import { useState } from 'react'
import ClauseCard from './ClauseCard'
import Button from '../common/Button'

export default function ClauseList({ clauses }) {
  const [filter, setFilter] = useState('all') // all, high, medium, low

  const filteredClauses = clauses.filter(clause => {
    if (filter === 'all') return true
    if (filter === 'flagged') return ['high', 'critical'].includes(clause.risk_level)
    return clause.risk_level === filter
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Detected Clauses
          <span className="ml-2 text-lg font-normal text-gray-500">
            ({filteredClauses.length})
          </span>
        </h2>

        {/* Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'flagged' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('flagged')}
          >
            Flagged
          </Button>
          <Button
            variant={filter === 'high' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('high')}
          >
            High
          </Button>
          <Button
            variant={filter === 'medium' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('medium')}
          >
            Medium
          </Button>
          <Button
            variant={filter === 'low' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('low')}
          >
            Low
          </Button>
        </div>
      </div>

      {/* Clause Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredClauses.map((clause, index) => (
          <ClauseCard key={index} clause={clause} />
        ))}
      </div>

      {filteredClauses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No clauses match the selected filter.
        </div>
      )}
    </div>
  )
}