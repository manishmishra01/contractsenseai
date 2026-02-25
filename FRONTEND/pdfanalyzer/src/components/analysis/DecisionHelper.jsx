import { HelpCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function DecisionHelper({ riskScore, clauseCount }) {
  const [answers, setAnswers] = useState({
    critical: null,
    budget: null,
    negotiate: null,
    timeline: null
  })

  const questions = [
    {
      id: 'critical',
      q: 'Is this vendor critical to your business?',
      opts: ['Mission-critical', 'Important', 'Nice to have']
    },
    {
      id: 'budget',
      q: 'Can you afford legal review?',
      opts: ['Yes', 'Limited', 'No']
    },
    {
      id: 'negotiate',
      q: 'Will vendor negotiate?',
      opts: ['Yes', 'Maybe', 'No']
    },
    {
      id: 'timeline',
      q: 'How urgent is this?',
      opts: ['Not urgent', 'Somewhat', 'Very urgent']
    }
  ]

  const getDecision = () => {
    if (!Object.values(answers).every(a => a !== null)) return null

    const { critical, budget, negotiate, timeline } = answers

    if (riskScore >= 7) {
      if (critical === 'Nice to have' || negotiate === 'No') {
        return { decision: 'reject', icon: XCircle, color: 'red', text: 'Walk away. Risk too high.' }
      }
      if (budget === 'No') {
        return { decision: 'reject', icon: XCircle, color: 'red', text: 'Cannot sign without legal review.' }
      }
      return { decision: 'lawyer', icon: AlertTriangle, color: 'orange', text: 'Hire lawyer. Only sign if major changes made.' }
    }

    if (riskScore >= 4) {
      if (timeline === 'Very urgent' && negotiate === 'No') {
        if (critical === 'Mission-critical') {
          return { decision: 'proceed', icon: AlertTriangle, color: 'yellow', text: 'Can proceed but get management sign-off on risks.' }
        }
        return { decision: 'reject', icon: XCircle, color: 'orange', text: 'Don\'t rush. Not worth the risk.' }
      }
      return { decision: 'negotiate', icon: AlertTriangle, color: 'yellow', text: 'Negotiate fixes. Acceptable if vendor cooperates.' }
    }

    return { decision: 'approve', icon: CheckCircle, color: 'green', text: 'Low risk. Standard approval process.' }
  }

  const dec = getDecision()
  const Icon = dec?.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <HelpCircle className="w-7 h-7 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Should You Sign?
        </h2>
      </div>

      <p className="text-gray-600 mb-5 text-sm">
        Answer 4 quick questions for a personalized decision:
      </p>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block font-semibold text-gray-900 mb-2 text-sm">
              {q.q}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {q.opts.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers({...answers, [q.id]: opt})}
                  className={`p-3 rounded-lg border-2 text-sm transition-all ${
                    answers[q.id] === opt
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {dec && Icon && (
        <div className={`mt-6 p-5 rounded-lg border-2 ${
          dec.color === 'red' ? 'bg-red-50 border-red-300' :
          dec.color === 'orange' ? 'bg-orange-50 border-orange-300' :
          dec.color === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
          'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-start space-x-3">
            <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
              dec.color === 'red' ? 'text-red-600' :
              dec.color === 'orange' ? 'text-orange-600' :
              dec.color === 'yellow' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
            <div>
              <h3 className={`font-bold mb-1 ${
                dec.color === 'red' ? 'text-red-900' :
                dec.color === 'orange' ? 'text-orange-900' :
                dec.color === 'yellow' ? 'text-yellow-900' :
                'text-green-900'
              }`}>
                Based on your situation:
              </h3>
              <p className="text-gray-800 font-medium">
                {dec.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}