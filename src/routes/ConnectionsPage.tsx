import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listConnections } from '../lib/db'
import type { Connection } from '../lib/types'
import { MdOutlinePeople, MdSearch, MdAdd, MdClose, MdOutlineVisibility, MdOutlineEdit, MdOutlineDelete, MdMoreVert } from 'react-icons/md'
import ConnectionImport from '../ui/ConnectionImport'
import AddConnectionModal from '../ui/AddConnectionModal'
import EditConnectionModal from '../ui/EditConnectionModal'
import ConnectionDetailPage from './ConnectionDetailPage'
import { deleteConnection } from '../lib/db'
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
    if (!s) return connections
    return connections.filter((c) => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
      (c.company || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s)
    )
  }, [connections, q])

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
        <div className="flex items-center gap-4">
            <div className="relative">
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
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-2.5 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
                <MdAdd size={20} />
                Add New
            </button>
        </div>
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
                <th className="py-4 px-4 font-bold text-black dark:text-white xl:pl-8 uppercase text-xs">
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
                  className={`cursor-pointer hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors ${key === filtered.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}
                >
                  <td className="py-5 px-4 xl:pl-8">
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
    </div>
  )
}
