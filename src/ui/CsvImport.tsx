
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

  const downloadTemplate = () => {
    const headers = ['name', 'source', 'phone', 'email', 'address_text']
    const csvContent = headers.join(',') + '\nSample Business,door,703-555-0199,gm@sample.com,123 Main St'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'leads_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-bodydark2">
          Supports: name, source, phone, email, address_text
        </p>
        <button 
            onClick={downloadTemplate}
            className="text-xs text-primary dark:text-bodydark2 hover:underline font-medium"
        >
            Download CSV Template
        </button>
      </div>
      
      <input
        type="file"
        accept=".csv,text/csv"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
        className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
      />
      {msg && <div className="mt-2 text-sm text-meta-3">{msg}</div>}
    </div>
  )
}
