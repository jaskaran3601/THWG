"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  DollarSign,
  TrendingUp,
  Mail,
  Sparkles,
  KanbanSquare,
  Check,
  Circle,
  Calendar,
  ArrowRight,
  Bell,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

const recentLeads = [
  { id: 1, name: "Sarah Johnson", interest: "3BR Single Family, $450K–550K", stage: "Showing", lastContact: "Jun 12, 2026", stageColor: "bg-purple-100 text-purple-700" },
  { id: 2, name: "Michael Chen", interest: "Condo Downtown, $280K–320K", stage: "Contacted", lastContact: "Jun 13, 2026", stageColor: "bg-blue-100 text-blue-700" },
  { id: 3, name: "Emily Rodriguez", interest: "4BR Suburban, $600K–750K", stage: "Offer Made", lastContact: "Jun 11, 2026", stageColor: "bg-orange-100 text-orange-700" },
  { id: 4, name: "David Park", interest: "Investment Duplex, $380K", stage: "New Lead", lastContact: "Jun 14, 2026", stageColor: "bg-slate-100 text-slate-700" },
  { id: 5, name: "Amanda Williams", interest: "Luxury Home, $1.2M+", stage: "Under Contract", lastContact: "Jun 10, 2026", stageColor: "bg-emerald-100 text-emerald-700" },
];

const initialTasks = [
  { id: 1, text: "Follow up with Sarah Johnson re: showing feedback", done: false },
  { id: 2, text: "Submit offer for Emily Rodriguez on 42 Oak Street", done: false },
  { id: 3, text: "Schedule professional photos for new listing on Maple Ave", done: true },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Good morning, Agent 👋
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Calendar size={14} />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
          </button>
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Total Leads"
          value="47"
          trend={{ direction: "up", percent: 12, label: "vs last month" }}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
        />
        <MetricCard
          icon={Home}
          label="Active Listings"
          value="12"
          trend={{ direction: "up", percent: 8, label: "vs last month" }}
          iconColor="text-violet-500"
          iconBg="bg-violet-50"
        />
        <MetricCard
          icon={TrendingUp}
          label="Closed This Month"
          value="3"
          trend={{ direction: "down", percent: 25, label: "vs last month" }}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          icon={DollarSign}
          label="Revenue This Month"
          value="$52,400"
          trend={{ direction: "up", percent: 18, label: "vs last month" }}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Content + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Leads Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Recent Leads</h2>
              <Link
                href="/pipeline"
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Name</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-medium hidden md:table-cell">Interest</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-medium">Stage</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-medium hidden sm:table-cell">Last Contact</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {lead.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-medium text-slate-800">{lead.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 hidden md:table-cell max-w-[180px] truncate">
                        {lead.interest}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`stage-badge ${lead.stageColor}`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 hidden sm:table-cell">
                        {lead.lastContact}
                      </td>
                      <td className="py-3.5 px-2">
                        <Link href="/leads">
                          <button className="text-blue-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
                            <Mail size={15} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/leads">
                <button className="w-full flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Draft Follow-up</span>
                </button>
              </Link>
              <Link href="/content">
                <button className="w-full flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Sparkles size={20} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">Get Content Ideas</span>
                </button>
              </Link>
              <Link href="/pipeline">
                <button className="w-full flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 group">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <KanbanSquare size={20} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">View Pipeline</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Today's Tasks */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Tasks</h2>
              <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
                {tasks.filter((t) => !t.done).length} left
              </span>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                    task.done ? "opacity-50" : "hover:bg-slate-50"
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {task.done ? (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <Circle size={20} className="text-slate-300" />
                    )}
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      task.done ? "line-through text-slate-400" : "text-slate-700"
                    }`}
                  >
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/tasks">
                <button className="w-full text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1.5">
                  View all tasks <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>

          {/* Pipeline Snapshot */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Snapshot</h2>
            <div className="space-y-2.5">
              {[
                { label: "New Lead", count: 8, color: "bg-slate-400", pct: 17 },
                { label: "Contacted", count: 12, color: "bg-blue-400", pct: 26 },
                { label: "Showing", count: 9, color: "bg-purple-400", pct: 19 },
                { label: "Offer Made", count: 6, color: "bg-orange-400", pct: 13 },
                { label: "Under Contract", count: 8, color: "bg-amber-400", pct: 17 },
                { label: "Closed", count: 4, color: "bg-emerald-500", pct: 8 },
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{stage.label}</span>
                    <span className="font-medium">{stage.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`${stage.color} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/pipeline">
                <button className="w-full text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1.5">
                  View full pipeline <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
