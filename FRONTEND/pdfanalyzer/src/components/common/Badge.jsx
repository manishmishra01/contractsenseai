import clsx from 'clsx'
import { RISK_COLORS } from '../../utils/constants'

export default function Badge({ level, children, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        RISK_COLORS[level] || RISK_COLORS.low,
        className
      )}
    >
      {children || level}
    </span>
  )
}