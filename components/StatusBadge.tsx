import { SELLER_STATUSES, BUYER_STATUSES } from '@/lib/types'

interface Props {
  status: string
  type?: 'seller' | 'buyer'
}

export default function StatusBadge({ status, type = 'seller' }: Props) {
  const list = type === 'seller' ? SELLER_STATUSES : BUYER_STATUSES
  const found = list.find(s => s.value === status)
  const label = found?.label ?? status
  const color = found?.color ?? 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    hot:  'bg-red-100 text-red-700',
    warm: 'bg-orange-100 text-orange-700',
    cold: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[priority] ?? 'bg-gray-100 text-gray-700'}`}>
      {priority === 'hot' ? '🔥' : priority === 'warm' ? '☀️' : '❄️'} {priority}
    </span>
  )
}
