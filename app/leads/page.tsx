"use client";

import { useState } from "react";
import { Mail, Loader2, Copy, Check, User, Home, Calendar, FileText } from "lucide-react";

const recentLeads = [
  { name: "Sarah Johnson", interest: "3BR Single Family, $450K–550K", stage: "Showing", lastContact: "Jun 12" },
  { name: "Michael Chen", interest: "Condo Downtown, $280K–320K", stage: "Contacted", lastContact: "Jun 13" },
  { name: "Emily Rodriguez", interest: "4BR Suburban, $600K–750K", stage: "Offer Made", lastContact: "Jun 11" },
  { name: "David Park", interest: "Investment Duplex, $380K", stage: "New Lead", lastContact: "Jun 14" },
  { name: "Amanda Williams", interest: "Luxury Home, $1.2M+", stage: "Under Contract", lastContact: "Jun 10" },
];

interface EmailResult {
  subject: string;
  body: string;
}

export default function LeadsPage() {
  const [form, setForm] = useState({ name: "", propertyInterest: "", lastContact: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate email");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fillFromLead = (lead: typeof recentLeads[0]) => {
    setForm((prev) => ({
      ...prev,
      name: lead.name,
      propertyInterest: lead.interest,
      lastContact: lead.lastContact,
    }));
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Lead Follow-up Drafts</h1>
        <p className="page-subtitle">Generate personalized follow-up emails in seconds with Claude AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Mail size={18} className="text-blue-500" /> Draft a Follow-up Email
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">
                  <User size={13} className="inline mr-1.5 text-slate-400" />Lead Name *
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Sarah Johnson"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">
                  <Home size={13} className="inline mr-1.5 text-slate-400" />Property Interest *
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. 3BR single family, $400–500K, good schools"
                  value={form.propertyInterest}
                  onChange={(e) => setForm({ ...form, propertyInterest: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">
                  <Calendar size={13} className="inline mr-1.5 text-slate-400" />Last Contact Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={form.lastContact}
                  onChange={(e) => setForm({ ...form, lastContact: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">
                  <FileText size={13} className="inline mr-1.5 text-slate-400" />Notes
                </label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  placeholder="Any specific details, concerns, or previous conversations..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" /> Generating with Claude AI...
                  </>
                ) : (
                  <>
                    <Mail size={16} /> Generate Follow-up Email
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="card space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton h-4 w-full" />
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="card fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Generated Email
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  {copied ? (
                    <><Check size={14} className="text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy size={14} /> Copy Email</>
                  )}
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">SUBJECT</p>
                <p className="text-slate-800 font-medium mb-4">{result.subject}</p>
                <p className="text-xs text-slate-500 font-medium mb-1">BODY</p>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{result.body}</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Leads sidebar */}
        <div>
          <div className="card">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Leads</h2>
            <p className="text-xs text-slate-400 mb-4">Click to auto-fill the form</p>
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <button
                  key={lead.name}
                  onClick={() => fillFromLead(lead)}
                  className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-150 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {lead.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-blue-700 truncate">
                        {lead.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{lead.interest}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
