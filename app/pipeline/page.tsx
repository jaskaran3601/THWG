"use client";

import { useState } from "react";
import { KanbanSquare, Loader2, X, Sparkles } from "lucide-react";

const stageConfig = [
  { id: "new", label: "New Lead", color: "bg-slate-400", light: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-slate-600" },
  { id: "contacted", label: "Contacted", color: "bg-blue-400", light: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700" },
  { id: "showing", label: "Showing", color: "bg-purple-400", light: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  { id: "offer", label: "Offer Made", color: "bg-orange-400", light: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  { id: "contract", label: "Under Contract", color: "bg-amber-400", light: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700" },
  { id: "closed", label: "Closed", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
];

const initialLeads = [
  { id: 1, name: "David Park", interest: "Investment Duplex, $380K", stage: "new", lastContact: "Jun 14, 2026" },
  { id: 2, name: "Jennifer Lee", interest: "2BR Condo, $250K", stage: "new", lastContact: "Jun 13, 2026" },
  { id: 3, name: "Robert Torres", interest: "Starter Home, $320K", stage: "new", lastContact: "Jun 12, 2026" },
  { id: 4, name: "Michael Chen", interest: "Condo Downtown, $280–320K", stage: "contacted", lastContact: "Jun 13, 2026" },
  { id: 5, name: "Lisa Wang", interest: "Townhouse, $400K", stage: "contacted", lastContact: "Jun 11, 2026" },
  { id: 6, name: "Kevin Brown", interest: "4BR Family, $550K", stage: "contacted", lastContact: "Jun 10, 2026" },
  { id: 7, name: "Sarah Johnson", interest: "3BR Single Family, $450–550K", stage: "showing", lastContact: "Jun 12, 2026" },
  { id: 8, name: "Nancy Kim", interest: "Luxury Condo, $800K", stage: "showing", lastContact: "Jun 9, 2026" },
  { id: 9, name: "Emily Rodriguez", interest: "4BR Suburban, $600–750K", stage: "offer", lastContact: "Jun 11, 2026" },
  { id: 10, name: "James Wilson", interest: "Modern Ranch, $480K", stage: "offer", lastContact: "Jun 8, 2026" },
  { id: 11, name: "Amanda Williams", interest: "Luxury Home, $1.2M+", stage: "contract", lastContact: "Jun 10, 2026" },
  { id: 12, name: "Thomas Miller", interest: "Fixer Upper, $290K", stage: "contract", lastContact: "Jun 7, 2026" },
  { id: 13, name: "Patricia Davis", interest: "3BR Colonial, $520K", stage: "closed", lastContact: "Jun 5, 2026" },
  { id: 14, name: "Charles Garcia", interest: "New Construction, $680K", stage: "closed", lastContact: "Jun 2, 2026" },
];

interface Lead {
  id: number;
  name: string;
  interest: string;
  stage: string;
  lastContact: string;
}

export default function PipelinePage() {
  const [leads] = useState<Lead[]>(initialLeads);
  const [loadingAI, setLoadingAI] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const getLeadsForStage = (stageId: string) =>
    leads.filter((l) => l.stage === stageId);

  const handleSummarize = async () => {
    setLoadingAI(true);
    setSummary("");
    try {
      const res = await fetch("/api/pipeline-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipeline: leads }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data.summary);
      setShowSummary(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">CRM Pipeline</h1>
          <p className="page-subtitle">{leads.length} leads across {stageConfig.length} stages</p>
        </div>
        <button
          onClick={handleSummarize}
          disabled={loadingAI}
          className="btn-primary"
        >
          {loadingAI ? (
            <><Loader2 size={16} className="spinner" /> Analyzing...</>
          ) : (
            <><Sparkles size={16} /> AI Summary</>
          )}
        </button>
      </div>

      {/* AI Summary Modal */}
      {showSummary && summary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" /> Pipeline Summary
              </h3>
              <button
                onClick={() => setShowSummary(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-purple-400" /> Generated by Claude AI
              </p>
              <button onClick={() => setShowSummary(false)} className="btn-secondary text-sm py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage summary row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stageConfig.map((stage) => {
          const count = getLeadsForStage(stage.id).length;
          return (
            <div key={stage.id} className="card p-4 text-center">
              <div className={`w-8 h-1.5 rounded-full ${stage.color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{stage.label}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stageConfig.map((stage) => {
            const stageLeads = getLeadsForStage(stage.id);
            return (
              <div key={stage.id} className={`kanban-col border ${stage.light}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <span className="text-xs font-semibold text-slate-700">{stage.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {lead.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-1">
                          {lead.name}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 leading-tight line-clamp-2">{lead.interest}</p>
                      <p className="text-xs text-slate-400 mt-2">{lead.lastContact}</p>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-6">
                      <KanbanSquare size={20} className="text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
