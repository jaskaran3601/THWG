"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Sparkles,
  KanbanSquare,
  CheckSquare,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Lead Follow-up", icon: Mail },
  { href: "/content", label: "Content Ideas", icon: Sparkles },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/tasks", label: "Admin Tasks", icon: CheckSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">RA</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Realtor AI</p>
            <p className="text-slate-400 text-xs">Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 px-3 py-2">
          <Zap size={14} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-slate-400 text-xs">Powered by</p>
            <p className="text-blue-400 text-xs font-semibold">Claude AI</p>
          </div>
        </div>
        <div className="mt-3 px-3">
          <div className="bg-slate-800/60 rounded-lg p-3">
            <p className="text-slate-500 text-xs leading-relaxed">
              AI features powered by Anthropic&apos;s Claude — the AI assistant for real estate professionals.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
