
import Papa from 'papaparse'
import { useState } from 'react'
import { createLead } from '../lib/db'

/**
 * CSV importer (Leads)
 * Expected headers (case-insensitive):
 * name, source, phone, email, address_text
 */
export default function CsvImport({ onImported }: { onImported: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const normalize = (s: string) => s.trim().toLowerCase()

  const onFile = async (file: File) => {
    setBusy(true)
    setMsg(null)

    const parsed = await new Promise<Papa.ParseResult<any>>((resolve) => {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => resolve(res) })
    })

    const rows = parsed.data as Record<string, any>[]
    let created = 0

    for (const row of rows) {
      const keys = Object.fromEntries(Object.keys(row).map((k) => [normalize(k), row[k]]))
      const name = String(keys['name'] || '').trim()
      if (!name) continue

      await createLead({
        source: String(keys['source'] || 'other'),
        name,
        phone: String(keys['phone'] || '') || null,
        email: String(keys['email'] || '') || null,
        address_text: String(keys['address_text'] || keys['address'] || '') || null,
        status: 'new',
      } as any)
      created += 1
    }

    setMsg(`Imported ${created} lead(s).`)
    await onImported()
    setBusy(false)
  }

  return (
    <div>
      <strong>Import CSV (Leads)</strong>
      <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
        Headers: name, source, phone, email, address_text
      </div>
      <input
        style={{ marginTop: 10 }}
        type="file"
        accept=".csv,text/csv"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
      {msg && <div style={{ marginTop: 8, color: 'var(--accent)' }}>{msg}</div>}
    </div>
  )
}
