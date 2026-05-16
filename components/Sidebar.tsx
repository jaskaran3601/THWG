'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, UserCheck, GitBranch,
  Mail, Building2, ChevronRight,
} from 'lucide-react'

const nav = [
  { href: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/sellers',   label: 'Sellers',    icon: Building2,  badge: 'hot' },
  { href: '/buyers',    label: 'Buyers',     icon: UserCheck },
  { href: '/pipeline',  label: 'Pipeline',   icon: GitBranch },
  { href: '/outreach',  label: 'Outreach',   icon: Mail },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0f1f3d] text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
            TH
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">THWG</p>
            <p className="text-xs text-blue-300 leading-tight">RCFE CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={16} />
                {label}
              </span>
              {badge === 'hot' && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                  HOT
                </span>
              )}
              {active && !badge && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-gray-500">RCFE Lead System</p>
        <p className="text-xs text-gray-600">California Market</p>
      </div>
    </aside>
  )
}
