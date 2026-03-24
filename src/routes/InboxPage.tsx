import { useEffect, useMemo, useState } from 'react'
import { convertLeadToConnection, listLeads, archiveLead } from '../lib/db'
import type { Lead } from '../lib/types'
import { MdAdd, MdOutlineFileUpload } from 'react-icons/md'
import AddLeadModal from '../ui/AddLeadModal'
import ImportLeadsModal from '../ui/ImportLeadsModal'
import { useDialog } from '../contexts/DialogContext'

export default function InboxPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const dialog = useDialog()

  const refresh = async () => {
    setErr(null)
    const data = await listLeads()
    setLeads(data)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  const newLeads = useMemo(
    () => leads.filter((l) => l.status === 'new' && !l.archived),
    [leads],
  )

  const onConvert = async (leadId: string) => {
    setErr(null)
    setBusy(true)
    try {
      await convertLeadToConnection(leadId)
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to convert lead')
    } finally {
      setBusy(false)
    }
  }

  const onArchive = async (leadId: string) => {
    const confirmed = await dialog.confirm('Archive Lead', 'Are you sure you want to archive this lead?', { isDestructive: false })
    if (!confirmed) return
    setErr(null)
    setBusy(true)
    try {
      await archiveLead(leadId)
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to archive lead')
    } finally {
      setBusy(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === newLeads.length && newLeads.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(newLeads.map(l => l.id))
    }
  }

  const onBulkArchive = async () => {
    const confirmed = await dialog.confirm('Archive Selected', `Are you sure you want to archive ${selectedIds.length} leads?`, { isDestructive: false })
    if (!confirmed) return
    setErr(null)
    setBusy(true)
    try {
      await Promise.all(selectedIds.map(id => archiveLead(id)))
      setSelectedIds([])
      await refresh()
    } catch (e: any) {
      setErr('Failed to archive some items')
    } finally {
      setBusy(false)
    }
  }

  const onBulkConvert = async () => {
    const confirmed = await dialog.confirm('Convert Selected', `Are you sure you want to convert ${selectedIds.length} leads to Connections/Opportunities?`, { isDestructive: false })
    if (!confirmed) return
    setErr(null)
    setBusy(true)
    try {
      await Promise.all(selectedIds.map(id => convertLeadToConnection(id)))
      setSelectedIds([])
      await refresh()
    } catch (e: any) {
      setErr('Failed to convert some items')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-black dark:text-white flex items-center gap-2">
            Leads
          </h2>
          <p className="text-sm font-medium text-body-color dark:text-bodydark mt-1">
            New incoming leads to be converted or archived
          </p>
        </div>
        
        {selectedIds.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-lg shadow-sm">
            <span className="text-sm font-semibold text-primary mr-auto">{selectedIds.length} selected</span>
            <button
              onClick={onBulkArchive}
              disabled={busy}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-meta-1/50 bg-transparent py-1.5 px-4 text-center font-medium text-meta-1 hover:bg-meta-1 hover:text-white transition-colors text-sm"
            >
              Archive Selected
            </button>
            <button
              onClick={onBulkConvert}
              disabled={busy}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-primary py-1.5 px-4 text-center font-medium text-white hover:bg-opacity-90 transition-colors text-sm"
            >
              Convert Selected
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button 
                onClick={() => setImportOpen(true)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-lg border border-stroke bg-transparent py-2.5 px-6 text-center font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4 transition-colors lg:px-6"
            >
                <MdOutlineFileUpload size={20} />
                Import
            </button>
            <button 
                onClick={() => setAddOpen(true)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-lg bg-primary py-2.5 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8"
            >
                <MdAdd size={20} />
                Add New
            </button>
          </div>
        )}
      </div>

      <AddLeadModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} />
      <ImportLeadsModal isOpen={importOpen} onClose={() => setImportOpen(false)} onSuccess={refresh} />

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer text-primary bg-white border-stroke dark:bg-boxdark dark:border-strokedark rounded custom-checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === newLeads.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-4 px-2 font-bold text-black dark:text-white uppercase text-xs">Name</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">Source</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">Contact</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {newLeads.map((l, key) => (
                <tr 
                  key={l.id} 
                  className={`hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors ${selectedIds.includes(l.id) ? 'bg-primary/5 dark:bg-primary/5' : ''} ${key === newLeads.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}
                >
                  <td className="py-5 px-4 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer text-primary bg-white border-stroke dark:bg-boxdark dark:border-strokedark rounded custom-checkbox"
                      checked={selectedIds.includes(l.id)}
                      onChange={() => toggleSelect(l.id)}
                    />
                  </td>
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(l.firstName?.[0] || '') + (l.lastName?.[0] || '') || l.name?.[0] || '?'}
                        </div>
                        <div>
                            <p className="text-black dark:text-white font-semibold flex items-center gap-2">
                                {l.firstName || l.lastName ? `${l.firstName || ''} ${l.lastName || ''}`.trim() : (l.name || 'Unnamed')}
                            </p>
                            {l.firstName || l.lastName ? <p className="text-xs text-bodydark2">{l.name}</p> : null}
                        </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-black dark:text-white capitalize">{l.source}</p>
                  </td>
                  <td className="py-5 px-4 font-medium">
                    <div className="flex flex-col gap-1">
                      {l.phone ? (
                        <a href={`tel:${l.phone}`} className="text-primary hover:underline">{l.phone}</a>
                      ) : (
                        <span className="text-bodydark2">—</span>
                      )}
                      {l.email && <span className="text-xs text-bodydark2 truncate max-w-[150px]">{l.email}</span>}
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        className="rounded border border-meta-1/50 bg-meta-1/10 text-meta-1 hover:bg-meta-1 hover:text-white py-1.5 px-4 text-sm font-medium transition-colors"
                        onClick={() => onArchive(l.id)}
                        disabled={busy}
                      >
                        Archive
                      </button>
                      <button
                        className="rounded bg-primary py-1.5 px-6 text-sm font-medium text-white hover:bg-opacity-90 transition-colors"
                        onClick={() => onConvert(l.id)}
                        disabled={busy}
                      >
                        Convert
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {newLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-body-color dark:text-bodydark italic">
                    No new leads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}