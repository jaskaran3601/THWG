'use client'
import { useState, useRef } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
  onImported: () => void
}

export default function ImportModal({ onClose, onImported }: Props) {
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function parseCsv(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    return lines.slice(1).map(line => {
      // Handle quoted fields with commas
      const values: string[] = []
      let cur = ''
      let inQuotes = false
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; continue }
        if (ch === ',' && !inQuotes) { values.push(cur.trim()); cur = ''; continue }
        cur += ch
      }
      values.push(cur.trim())
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    })
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCsvText(ev.target?.result as string)
    reader.readAsText(file)
  }

  async function runImport() {
    const rows = parseCsv(csvText)
    if (rows.length === 0) { toast.error('No valid rows found in CSV'); return }
    setImporting(true)
    setResult(null)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, source: 'dss_database' }),
      })
      const data = await res.json()
      setResult(data)
      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} leads!`)
        onImported()
      } else {
        toast.error('No leads were imported')
      }
    } catch {
      toast.error('Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Import Seller Leads (CSV)</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">California DSS RCFE Database Import</p>
            <p>Download the RCFE facility list from the CA DSS website and import here. The system auto-maps common column names. Required column: <code className="bg-blue-100 px-1 rounded">facility_name</code> (or <code className="bg-blue-100 px-1 rounded">name</code>).</p>
            <p className="mt-2 text-xs text-blue-600">Supported columns: facility_name, owner_name, license_number, facility_type, address, city, county, zip, bed_capacity, phone, email, notes</p>
          </div>

          {/* File Upload */}
          <div>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 text-center transition-colors"
            >
              <Upload size={28} className="mx-auto mb-2 text-gray-400" />
              <p className="font-medium text-gray-600">Click to upload CSV file</p>
              <p className="text-sm text-gray-400">or paste CSV text below</p>
            </button>
          </div>

          {/* Paste area */}
          <div>
            <label className="label">Or paste CSV content</label>
            <textarea
              className="input h-40 resize-none font-mono text-xs"
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="facility_name,owner_name,license_number,city,county,bed_capacity&#10;Sunrise Manor,John Smith,198001234,Los Angeles,Los Angeles,6&#10;..."
            />
          </div>

          {/* Preview */}
          {csvText && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText size={16} />
              <span>{parseCsv(csvText).length} rows detected</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-4 border ${result.imported > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.imported > 0 ? <CheckCircle size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-red-600" />}
                <span className="font-semibold text-sm">
                  {result.imported} imported, {result.skipped} skipped
                </span>
              </div>
              {result.errors.length > 0 && (
                <ul className="text-xs text-red-600 space-y-0.5">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button onClick={runImport} disabled={!csvText.trim() || importing} className="btn-primary flex items-center gap-2">
            <Upload size={14} />
            {importing ? 'Importing…' : 'Import Leads'}
          </button>
        </div>
      </div>
    </div>
  )
}
