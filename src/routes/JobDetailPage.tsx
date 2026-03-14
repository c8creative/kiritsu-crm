import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { completeVisit, createVisit, listJobs, listVisits } from '../lib/db'

export default function JobDetailPage() {
  const { id } = useParams()
  const [job, setJob] = useState<any>(null)
  const [visits, setVisits] = useState<any[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    if (!id) return
    const jobs = await listJobs()
    setJob((jobs as any[]).find((j) => j.id === id) ?? null)
    const v = await listVisits(id)
    setVisits(v as any)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [id])

  if (!id) return null
  if (!job) return <div className="p-6">Loading…</div>

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Job Details
          </h2>
        </div>
        <div>
          <span className="inline-flex rounded-full bg-primary/10 py-1 px-3 text-sm font-medium text-primary">
            {job.frequency} • ${job.price_per_visit ?? '—'}/visit
          </span>
        </div>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="grid grid-cols-1 gap-9 mt-4 lg:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 lg:pb-6">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Schedule visit</h4>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const fd = new FormData(form)
                setBusy(true)
                setErr(null)
                try {
                  await createVisit(id, String(fd.get('scheduled_for') || '') || null)
                  form.reset()
                  await refresh()
                } catch (e: any) {
                  setErr(e.message)
                } finally {
                  setBusy(false)
                }
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">Scheduled for</label>
                <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" type="date" name="scheduled_for" />
              </div>
              <button className="flex w-full justify-center rounded bg-primary py-3 font-medium text-gray hover:bg-opacity-90" disabled={busy}>Add visit</button>
            </form>

            <div className="mt-8 border-t border-stroke pt-6 dark:border-strokedark">
              <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">Visits</h4>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto mb-4">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="py-2 px-4 font-medium text-black dark:text-white">Date</th>
                      <th className="py-2 px-4 font-medium text-black dark:text-white">Status</th>
                      <th className="py-2 px-4 font-medium text-black dark:text-white">Notes</th>
                      <th className="py-2 px-4 font-medium text-black dark:text-white"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v, key) => (
                      <tr key={v.id} className={key === visits.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                        <td className="py-3 px-4 text-black dark:text-white">{v.scheduled_for ?? '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${v.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-body-color dark:text-bodydark">{v.notes ?? '—'}</td>
                        <td className="py-3 px-4">
                          {v.status !== 'completed' && (
                            <button
                              className="inline-flex rounded border border-stroke py-1 px-3 text-sm font-medium hover:bg-gray transition dark:border-strokedark dark:hover:bg-meta-4"
                              disabled={busy}
                              onClick={async () => {
                                const notes = prompt('Completion notes (optional):')
                                setBusy(true)
                                try {
                                  await completeVisit(v.id, notes || null)
                                  await refresh()
                                } catch (e: any) {
                                  setErr(e.message)
                                } finally {
                                  setBusy(false)
                                }
                              }}
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {visits.length === 0 && <tr><td colSpan={4} className="py-3 px-4 text-body-color dark:text-bodydark">No visits yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">Job notes</h4>
            <div className="text-body-color dark:text-bodydark mb-6">{job.notes ?? '—'}</div>
          </div>
        </div>
      </div>
    </>
  )
}
