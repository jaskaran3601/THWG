"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, Instagram, Linkedin, Facebook } from "lucide-react";

interface ContentIdea {
  title: string;
  caption: string;
  hashtags: string[];
}

const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram size={14} />,
  Facebook: <Facebook size={14} />,
  LinkedIn: <Linkedin size={14} />,
};

const platformColors: Record<string, string> = {
  Instagram: "bg-pink-100 text-pink-700 border-pink-200",
  Facebook: "bg-blue-100 text-blue-700 border-blue-200",
  LinkedIn: "bg-sky-100 text-sky-700 border-sky-200",
};

const themeExamples = [
  "First-time homebuyer tips",
  "Current market update",
  "Home staging secrets",
  "Investment property benefits",
  "Neighborhood spotlight",
  "Client success story",
  "Spring selling season",
  "How to win a bidding war",
];

export default function ContentPage() {
  const [form, setForm] = useState({ platform: "Instagram", theme: "", agentName: "" });
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIdeas([]);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate ideas");
      setIdeas(data.ideas || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (index: number, idea: ContentIdea) => {
    const text = `${idea.caption}\n\n${idea.hashtags.map((h) => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Content Ideas Generator</h1>
        <p className="page-subtitle">Generate 5 ready-to-post social media ideas in one click</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" /> Configure
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Instagram", "Facebook", "LinkedIn"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, platform: p })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all duration-150 ${
                        form.platform === p
                          ? platformColors[p] + " border-current"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {platformIcons[p]}
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Theme / Topic *</label>
                <input
                  className="form-input"
                  placeholder="e.g. First-time homebuyer tips"
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                  required
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {themeExamples.slice(0, 4).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setForm({ ...form, theme: ex })}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Your Name (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Alex Martinez"
                  value={form.agentName}
                  onChange={(e) => setForm({ ...form, agentName: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? (
                  <><Loader2 size={16} className="spinner" /> Generating...</>
                ) : (
                  <><Sparkles size={16} /> Generate 5 Ideas</>
                )}
              </button>
            </form>
          </div>

          {/* Theme examples */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">More Topic Ideas</h3>
            <div className="space-y-1.5">
              {themeExamples.slice(4).map((ex) => (
                <button
                  key={ex}
                  onClick={() => setForm({ ...form, theme: ex })}
                  className="w-full text-left text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors"
                >
                  → {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card space-y-3">
                  <div className="skeleton h-5 w-1/2" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-4/5" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              ))}
            </div>
          )}

          {!loading && ideas.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-purple-400" />
              </div>
              <p className="text-slate-700 font-medium">No ideas generated yet</p>
              <p className="text-slate-400 text-sm mt-1">Fill in the form and click &ldquo;Generate 5 Ideas&rdquo;</p>
            </div>
          )}

          {!loading && ideas.map((idea, index) => (
            <div key={index} className="card fade-in hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-slate-800 text-sm">{idea.title}</h3>
                </div>
                <button
                  onClick={() => copyCaption(index, idea)}
                  className="btn-secondary text-xs py-1 px-2.5 flex-shrink-0"
                >
                  {copiedIndex === index ? (
                    <><Check size={12} className="text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy size={12} /> Copy</>
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">{idea.caption}</p>
              <div className="flex flex-wrap gap-1.5">
                {idea.hashtags?.map((tag, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
