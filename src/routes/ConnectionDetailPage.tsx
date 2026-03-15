import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { addActivity, getConnection, deleteConnection } from '../lib/db'
import { MdOutlinePeople, MdOutlineEmail, MdOutlinePhone, MdOutlineLanguage, MdOutlineLocationOn, MdOutlineHistory, MdOutlineEdit, MdOutlineDelete } from 'react-icons/md'
import EditConnectionModal from '../ui/EditConnectionModal'

export default function ConnectionDetailPage({ id: propId, isModal, onClose }: { id?: string, isModal?: boolean, onClose?: () => void }) {
  const params = useParams()
  const navigate = useNavigate()
  const id = propId || params.id
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const refresh = async () => {
    if (!id) return
    const d = await getConnection(id)
    setData(d)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [id])

  if (err) return <div className="p-6 text-meta-1 font-medium">{err}</div>
  if (!id) return null
  if (!data) return <div className="p-6 font-medium text-bodydark2 animate-pulse">Loading connection details...</div>

  const { connection, opportunities, activities, jobs } = data
  const primaryOpp = opportunities?.[0]?.id ?? null

  const onAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusy(true)
    try {
      await addActivity(id, primaryOpp, {
        activity_type: 'note',
        summary: String(fd.get('summary') || 'Note'),
        details: String(fd.get('details') || ''),
      })
      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={isModal ? "" : "mx-auto max-w-7xl"}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stroke pb-6 dark:border-strokedark">
        <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                {(connection.firstName?.[0] || '') + (connection.lastName?.[0] || '')}
            </div>
            <div>
                <h2 className="text-3xl font-bold text-black dark:text-white">
                    {connection.firstName} {connection.lastName}
                </h2>
                <p className="text-body-color dark:text-bodydark font-medium flex items-center gap-2">
                    {connection.title || 'No Title'} {connection.company && <span>· {connection.company}</span>}
                </p>
                <div className="mt-2 text-xs">
                    <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 font-medium uppercase tracking-wider ${
                        connection.status === 'prospect' ? 'bg-warning text-warning' : 'bg-success text-success'
                    }`}>
                        {connection.status}
                    </span>
                </div>
            </div>
        </div>
        <div className="flex gap-3">
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-black py-2 px-5 font-medium text-white hover:bg-opacity-80 transition dark:bg-white dark:text-black dark:hover:bg-opacity-80"
            >
              <MdOutlineEdit size={18} />
              Edit Details
            </button>
            <button
              onClick={async () => {
                if (!confirm(`Delete ${connection.firstName} ${connection.lastName}? This cannot be undone.`)) return
                try {
                  await deleteConnection(id!)
                  if (onClose) onClose()
                  else navigate('/connections')
                } catch (e: any) { setErr(e.message) }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-danger py-2 px-5 font-medium text-danger hover:bg-danger hover:text-white transition"
            >
              <MdOutlineDelete size={18} />
              Delete
            </button>
        </div>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        {/* Left Column: Contact Details */}
        <div className="lg:col-span-1 flex flex-col gap-7">
            <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
                    <h3 className="font-bold text-black dark:text-white">Contact Info</h3>
                </div>
                <div className="p-6 flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                        <MdOutlineEmail className="text-primary mt-1" size={20} />
                        <div>
                            <p className="text-xs font-semibold text-bodydark2 uppercase">Email</p>
                            <a href={`mailto:${connection.email}`} className="text-black dark:text-white hover:text-primary transition-colors text-sm font-medium">
                                {connection.email || '—'}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MdOutlinePhone className="text-primary mt-1" size={20} />
                        <div>
                            <p className="text-xs font-semibold text-bodydark2 uppercase">Phone</p>
                            <p className="text-black dark:text-white text-sm font-medium">{connection.phone || '—'}</p>
                            {connection.mobile && <p className="text-xs text-bodydark2 mt-1">Mobile: {connection.mobile}</p>}
                        </div>
                    </div>
                    {connection.website && (
                        <div className="flex items-start gap-3">
                            <MdOutlineLanguage className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-xs font-semibold text-bodydark2 uppercase">Website</p>
                                <a href={`https://${connection.website}`} target="_blank" rel="noreferrer" className="text-black dark:text-white hover:text-primary transition-colors text-sm font-medium">
                                    {connection.website}
                                </a>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-3">
                        <MdOutlineLocationOn className="text-primary mt-1" size={20} />
                        <div>
                            <p className="text-xs font-semibold text-bodydark2 uppercase">Location</p>
                            <p className="text-black dark:text-white text-sm font-medium leading-relaxed">
                                {[connection.street, connection.city, connection.state, connection.postalCode].filter(Boolean).join(', ') || '—'}
                            </p>
                            {connection.timeZone && <p className="text-xs text-bodydark2 mt-1">TZ: {connection.timeZone}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
                    <h3 className="font-bold text-black dark:text-white">Connection Details</h3>
                </div>
                <div className="p-6">
                    <p className="text-xs font-semibold text-bodydark2 uppercase mb-2">Internal Notes</p>
                    <div className="rounded bg-gray-2 p-4 text-sm text-black dark:bg-meta-4 dark:text-white leading-relaxed">
                        {connection.notes || 'No internal notes for this connection.'}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Timeline & Business Content */}
        <div className="lg:col-span-2 flex flex-col gap-7">
            {/* Timeline / Add Note */}
            <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6 dark:border-strokedark flex items-center gap-2">
                    <MdOutlineHistory className="text-primary" size={20} />
                    <h3 className="font-bold text-black dark:text-white">Activity Timeline</h3>
                </div>
                <div className="p-6">
                    <form onSubmit={onAddNote} className="flex flex-col gap-4 mb-8 bg-gray-2 p-4 rounded-lg dark:bg-meta-4">
                        <div className="flex gap-4">
                            <input className="flex-1 rounded border-[1.5px] border-stroke bg-white py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-sm" name="summary" placeholder="Summary (e.g., Follow up call)" required />
                        </div>
                        <textarea className="w-full rounded border-[1.5px] border-stroke bg-white py-2 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-sm" name="details" rows={2} placeholder="Add more context about this activity..." />
                        <div className="flex justify-end">
                            <button className="flex justify-center rounded-lg border border-stroke bg-white py-2 px-6 font-medium text-black hover:shadow-1 transition dark:border-strokedark dark:bg-meta-4 dark:text-white" disabled={busy}>Save Activity</button>
                        </div>
                    </form>

                    <div className="flex flex-col gap-6">
                    {(activities ?? []).map((a: any) => (
                        <div key={a.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:h-full before:w-[2px] before:bg-stroke dark:before:bg-strokedark last:before:hidden">
                        <div className="absolute left-0 top-1.5 h-[24px] w-[24px] rounded-full border-4 border-white bg-primary dark:border-boxdark"></div>
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-black dark:text-white">{a.summary || a.activity_type}</span>
                                <span className="text-xs text-bodydark2">{new Date(a.occurred_at).toLocaleDateString()}</span>
                            </div>
                            {a.details && <p className="mt-2 text-sm text-body-color dark:text-bodydark leading-relaxed">{a.details}</p>}
                        </div>
                        </div>
                    ))}
                    {(activities ?? []).length === 0 && <div className="text-center py-8 text-body-color dark:text-bodydark italic">No activity recorded for this connection yet.</div>}
                    </div>
                </div>
            </div>

            {/* Opportunities */}
            <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6 dark:border-strokedark flex items-center justify-between">
                    <h3 className="font-bold text-black dark:text-white">Active Pipeline Items</h3>
                    <Link to="/pipeline" className="text-xs text-primary dark:text-bodydark2 font-medium hover:underline">View Pipeline</Link>
                </div>
                <div className="p-6">
                    <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-black dark:text-white">Stage</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-black dark:text-white">Next Follow Up</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-black dark:text-white">Created</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(opportunities ?? []).map((o: any) => (
                            <tr key={o.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                            <td className="py-4 px-4 text-sm text-black dark:text-white">
                                <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary font-medium uppercase">{o.stage}</span>
                            </td>
                            <td className="py-4 px-4 text-sm text-body-color dark:text-bodydark">{o.next_follow_up_date || 'None scheduled'}</td>
                            <td className="py-4 px-4 text-sm text-body-color dark:text-bodydark">{new Date(o.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {(opportunities ?? []).length === 0 && <tr><td colSpan={3} className="py-6 text-center text-body-color italic dark:text-bodydark">No active pipeline items.</td></tr>}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
      {editOpen && data && (
        <EditConnectionModal
          connection={data.connection}
          onClose={() => setEditOpen(false)}
          onSuccess={() => { setEditOpen(false); refresh() }}
        />
      )}
    </div>
  )
}
