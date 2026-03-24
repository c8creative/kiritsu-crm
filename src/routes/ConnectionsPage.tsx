import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listConnections, archiveConnection, deleteConnection, updateConnection } from '../lib/db'
import type { Connection } from '../lib/types'
import { MdOutlinePeople, MdSearch, MdAdd, MdClose, MdOutlineVisibility, MdOutlineEdit, MdOutlineDelete, MdMoreVert, MdArchive } from 'react-icons/md'
import ConnectionImport from '../ui/ConnectionImport'
import AddConnectionModal from '../ui/AddConnectionModal'
import EditConnectionModal from '../ui/EditConnectionModal'
import ConnectionDetailPage from './ConnectionDetailPage'
import ClickOutside from '../components/ClickOutside'
import { createPortal } from 'react-dom'
import { useDialog } from '../contexts/DialogContext'

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editConn, setEditConn] = useState<Connection | null>(null)
  const [menuState, setMenuState] = useState<{ id: string, x: number, y: number, c: Connection } | null>(null)
  const [archivedOpen, setArchivedOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const dialog = useDialog()
  const navigate = useNavigate()

  const refresh = () => {
    listConnections().then(setConnections).catch((e) => setErr(e.message))
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return connections.filter((c) => {
      if (c.archived) return false
      if (!s) return true
      return `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
        (c.company || '').toLowerCase().includes(s) ||
        (c.email || '').toLowerCase().includes(s)
    })
  }, [connections, q])

  const archivedConns = useMemo(() => connections.filter(c => c.archived), [connections])

  const onUnarchive = async (id: string) => {
    await archiveConnection(id, false)
    await refresh()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(c => c.id))
    }
  }

  const onBulkArchive = async () => {
    const confirmed = await dialog.confirm('Archive Selected', `Are you sure you want to archive ${selectedIds.length} connections?`, { isDestructive: false })
    if (!confirmed) return
    setErr(null)
    setBusy(true)
    try {
      await Promise.all(selectedIds.map(id => archiveConnection(id, true)))
      setSelectedIds([])
      await refresh()
    } catch (e: any) {
      setErr('Failed to archive some items')
    } finally {
      setBusy(false)
    }
  }

  const onBulkStatus = async (status: string) => {
    const confirmed = await dialog.confirm('Update Status', `Change status to ${status.toUpperCase()} for ${selectedIds.length} connections?`, { isDestructive: false })
    if (!confirmed) return
    setErr(null)
    setBusy(true)
    try {
      await Promise.all(selectedIds.map(id => updateConnection(id, { status })))
      setSelectedIds([])
      await refresh()
    } catch (e: any) {
      setErr('Failed to update status on some items')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-black dark:text-white flex items-center gap-2">
            <MdOutlinePeople /> Connections
          </h2>
          <p className="text-sm font-medium text-body-color dark:text-bodydark mt-1">
            Consolidated contacts, prospects, and customers
          </p>
        </div>
        {selectedIds.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-lg shadow-sm w-full lg:w-auto">
            <span className="text-sm font-semibold text-primary mr-auto">{selectedIds.length} selected</span>
            <select
                onChange={(e) => {
                    if (e.target.value) onBulkStatus(e.target.value);
                    e.target.value = '';
                }}
                className="w-full sm:w-auto rounded-lg border border-stroke bg-white py-1.5 px-4 text-sm font-medium outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-boxdark"
                defaultValue=""
                disabled={busy}
            >
                <option value="" disabled>Set Status...</option>
                <option value="prospect">Prospect</option>
                <option value="one-time">One-Time</option>
                <option value="dnc">DNC</option>
            </select>
            <button
              onClick={onBulkArchive}
              disabled={busy}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-meta-1/50 bg-transparent py-1.5 px-4 text-center font-medium text-meta-1 hover:bg-meta-1 hover:text-white transition-colors text-sm"
            >
              Archive Selected
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative w-full sm:w-auto">
                  <button className="absolute left-4 top-1/2 -translate-y-1/2 text-bodydark2">
                      <MdSearch size={22} />
                  </button>
                  <input
                      type="text"
                      className="w-full xl:w-75 rounded-lg border-[1.5px] border-stroke bg-transparent py-2.5 pl-12 pr-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search connections..."
                  />
              </div>
              <button 
                  onClick={() => setArchivedOpen(true)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-lg border border-stroke bg-transparent py-2.5 px-6 text-center font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4 transition-colors lg:px-6"
              >
                  <MdArchive size={20} />
                  Archived ({archivedConns.length})
              </button>
              <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-lg bg-primary py-2.5 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8"
              >
                  <MdAdd size={20} />
                  Add New
              </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <ConnectionImport onImported={async () => refresh()} />
      </div>

      <AddConnectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refresh} 
      />

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
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-4 px-2 font-bold text-black dark:text-white uppercase text-xs">
                  Name
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Company
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Phone Number
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Status
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, key) => (
                <tr 
                  key={c.id} 
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      navigate(`/connections/${c.id}`)
                    } else {
                      setViewId(c.id)
                    }
                  }}
                  className={`cursor-pointer hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors ${selectedIds.includes(c.id) ? 'bg-primary/5 dark:bg-primary/5' : ''} ${key === filtered.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}
                >
                  <td className="py-5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer text-primary bg-white border-stroke dark:bg-boxdark dark:border-strokedark rounded custom-checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(c.firstName?.[0] || '') + (c.lastName?.[0] || '')}
                        </div>
                        <div>
                            <p className="text-black dark:text-white font-semibold">
                                {c.firstName} {c.lastName}
                            </p>
                            <p className="text-xs text-bodydark2">{c.email}</p>
                        </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-black dark:text-white font-medium">{c.company || '—'}</p>
                    {c.website && <p className="text-xs text-bodydark2">{c.website}</p>}
                  </td>
                  <td className="py-5 px-4 font-medium">
                    {c.phone || c.mobile ? (
                      <a 
                        href={`tel:${c.phone || c.mobile}`} 
                        onClick={(e) => e.stopPropagation()} 
                        className="text-primary hover:underline"
                      >
                         {c.phone || c.mobile}
                      </a>
                    ) : (
                      <span className="text-bodydark2">—</span>
                    )}
                  </td>
                  <td className="py-5 px-4">
                    <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium capitalize ${
                        c.status === 'dnc' ? 'bg-danger text-danger' :
                        c.status === 'one-time' ? 'bg-warning text-warning' :
                        'bg-success text-success'
                    }`}>
                      {c.status === 'dnc' ? 'DNC' : c.status || 'prospect'}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center justify-end">
                      {/* Options Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (menuState?.id === c.id) {
                              setMenuState(null)
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setMenuState({ id: c.id, x: rect.right, y: rect.bottom + 4, c })
                            }
                          }}
                          className="inline-flex items-center justify-center rounded p-1.5 text-bodydark2 hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                        >
                          <MdMoreVert size={20} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-body-color dark:text-bodydark italic">
                    No connections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editConn && (
        <EditConnectionModal
          connection={editConn}
          onClose={() => setEditConn(null)}
          onSuccess={() => { setEditConn(null); refresh() }}
        />
      )}

      {/* Connection Detail Modal for Desktop */}
      {viewId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm hidden lg:flex">
            <div className="w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-xl bg-gray-2 dark:bg-boxdark-2 shadow-2xl relative border border-stroke dark:border-strokedark">
                <div className="sticky top-0 right-0 z-50 flex justify-end p-4 pointer-events-none">
                    <button 
                        onClick={() => setViewId(null)} 
                        className="pointer-events-auto text-body-color hover:text-black dark:text-bodydark dark:hover:text-white rounded-full bg-white shadow-1 focus:outline-none dark:bg-meta-4 p-2 transition-colors cursor-pointer"
                    >
                        <MdClose size={24} />
                    </button>
                </div>
                <div className="px-8 pb-8 -mt-8">
                    <ConnectionDetailPage id={viewId} isModal={true} />
                </div>
            </div>
        </div>
      )}

      {/* Context Menu Portal */}
      {menuState && createPortal(
        <div 
          className="fixed inset-0 z-[9999]" 
          onClick={() => setMenuState(null)} 
          onContextMenu={(e) => { e.preventDefault(); setMenuState(null) }}
        >
          <div 
            className="absolute rounded-md border border-stroke bg-white px-2 py-2 shadow-default dark:border-strokedark dark:bg-boxdark"
            style={{ top: menuState.y, left: Math.max(16, menuState.x - 140), width: 140 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setEditConn(menuState.c)
                setMenuState(null)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-2 hover:text-primary dark:hover:bg-meta-4 text-black dark:text-white"
            >
              <MdOutlineEdit size={16} /> Edit
            </button>
            <button
              onClick={async () => {
                const c = menuState.c
                setMenuState(null)
                try {
                  await archiveConnection(c.id, true)
                  refresh()
                } catch (e: any) { setErr(e.message) }
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-meta-1 hover:bg-meta-1/10"
            >
              <MdArchive size={16} /> Archive
            </button>
            <button
              onClick={async () => {
                const c = menuState.c
                setMenuState(null)
                const confirmed = await dialog.confirm('Delete Connection', `Delete ${c.firstName} ${c.lastName}? This cannot be undone.`, { isDestructive: true })
                if (!confirmed) return
                
                try {
                  await deleteConnection(c.id)
                  refresh()
                } catch (e: any) { setErr(e.message) }
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-meta-1 hover:bg-meta-1/10"
            >
              <MdOutlineDelete size={16} /> Delete
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Archived Connections Modal */}
      {archivedOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-default dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between pb-2 border-b border-stroke dark:border-strokedark">
              <h3 className="text-lg font-bold text-black dark:text-white">Archived Connections</h3>
              <button onClick={() => setArchivedOpen(false)} className="text-body-color hover:text-black dark:text-bodydark dark:hover:text-white hover:bg-gray-2 dark:hover:bg-meta-4 rounded-full p-1 transition-colors">
                <MdClose size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {archivedConns.length === 0 ? (
                <p className="text-sm text-body-color text-center py-6">No archived items.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {archivedConns.map(c => (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                      <div>
                        <h4 className="font-semibold text-black dark:text-white">{c.firstName} {c.lastName}</h4>
                        <p className="text-sm text-body-color mt-1">{c.company || '—'} • {c.email || c.phone || 'No Contact'}</p>
                      </div>
                      <button 
                        onClick={() => onUnarchive(c.id)}
                        className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-colors"
                      >
                        Unarchive
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
