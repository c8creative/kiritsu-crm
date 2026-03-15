import Papa from 'papaparse'
import { useState } from 'react'
import { createConnection } from '../lib/db'

/**
 * CSV importer (Connections)
 * Maps to the new contacts_schema.csv
 */
export default function ConnectionImport({ onImported }: { onImported: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '')

  const downloadTemplate = () => {
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 'Mobile', 
      'Title', 'Company', 'Website', 'Street', 'City', 
      'State', 'Postal Code', 'Country', 'Time Zone', 'Notes'
    ]
    const csvContent = headers.join(',') + '\nJohn,Doe,john@example.com,555-0199,,Manager,Acme Corp,acme.com,123 Main St,Miami,FL,33101,USA,EST,Sample note'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'connections_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      
      const firstName = String(keys['firstname'] || '').trim()
      const lastName = String(keys['lastname'] || '').trim()
      
      if (!firstName && !lastName) continue

      await createConnection({
        firstName,
        lastName,
        email: String(keys['email'] || '') || null,
        phone: String(keys['phone'] || '') || null,
        mobile: String(keys['mobile'] || '') || null,
        title: String(keys['title'] || '') || null,
        company: String(keys['company'] || '') || null,
        website: String(keys['website'] || '') || null,
        street: String(keys['street'] || '') || null,
        city: String(keys['city'] || '') || null,
        state: String(keys['state'] || '') || null,
        postalCode: String(keys['postalcode'] || '') || null,
        country: String(keys['country'] || '') || null,
        timeZone: String(keys['timezone'] || '') || null,
        notes: String(keys['notes'] || '') || null,
        status: 'prospect'
      })
      created += 1
    }

    setMsg(`Imported ${created} connection(s).`)
    await onImported()
    setBusy(false)
  }

  return (
    <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-black dark:text-white">Import Connections</h4>
        <button 
            onClick={downloadTemplate}
            className="text-xs text-primary dark:text-bodydark2 hover:underline font-medium"
        >
            Download CSV Template
        </button>
      </div>
      <p className="text-xs text-bodydark2 mb-4">
        Supports: First Name, Last Name, Email, Phone, Company, etc.
      </p>
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
      {msg && <div className="mt-4 text-sm text-meta-3">{msg}</div>}
    </div>
  )
}
