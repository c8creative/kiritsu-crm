import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createJob, listConnections, listJobs } from '../lib/db'
import type { Connection, Job } from '../lib/types'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    const [j, c] = await Promise.all([listJobs(), listConnections()])
    setJobs(j)
    setConnections(c)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Jobs
          </h2>
          <div className="text-sm font-medium text-body-color dark:text-bodydark mt-1">
            Recurring agreements → visits
          </div>
        </div>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="grid grid-cols-1 gap-9 mt-4 lg:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-bold text-lg text-black dark:text-white">
                Create job
              </h3>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const fd = new FormData(form)
                setBusy(true)
                setErr(null)
                try {
                  const connection_id = String(fd.get('connection_id') || '')
                  const frequency = String(fd.get('frequency') || 'weekly')
                  const price_per_visit = fd.get('price_per_visit') ? Number(fd.get('price_per_visit')) : null
                  const start_date = String(fd.get('start_date') || '') || null
                  await createJob({
                    connection_id,
                    location_id: null,
                    frequency,
                    day_of_week: fd.get('day_of_week') ? Number(fd.get('day_of_week')) : null,
                    start_date,
                    active: true,
                    price_per_visit,
                    notes: String(fd.get('notes') || '') || null,
                  } as any)
                  form.reset()
                  await refresh()
                } catch (e: any) {
                  setErr(e.message)
                } finally {
                  setBusy(false)
                }
              }}
              className="p-6.5 flex flex-col gap-5"
            >
              <div>
                <label className="mb-2.5 block text-black dark:text-white">Connection</label>
                <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="connection_id" required>
                  <option value="">Select…</option>
                  {connections.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Frequency</label>
                  <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="frequency" defaultValue="weekly">
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Day of week (0=Sun)</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="day_of_week" placeholder="1" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Start date</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" type="date" name="start_date" />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Price per visit</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="price_per_visit" placeholder="150" />
                </div>
              </div>
              <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90" disabled={busy}>
                {busy ? 'Creating...' : 'Create Job'}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-bold text-black dark:text-white">All jobs</h4>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Connection</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Frequency</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Price</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Go</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, key) => {
                    const conn = connections.find((c) => c.id === j.connection_id)
                    return (
                      <tr key={j.id} className={key === jobs.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                        <td className="py-5 px-4 text-primary">
                          {conn ? `${conn.firstName} ${conn.lastName}` : j.connection_id}
                        </td>
                        <td className="py-5 px-4 text-black dark:text-white">{j.frequency}</td>
                        <td className="py-5 px-4 text-black dark:text-white">{j.price_per_visit ?? '—'}</td>
                        <td className="py-5 px-4">
                          <Link className="inline-flex rounded-md border border-stroke py-1 px-3 text-sm hover:bg-gray transition dark:border-strokedark dark:hover:bg-meta-4" to={`/jobs/${j.id}`}>
                            Open
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                  {jobs.length === 0 && (
                    <tr><td colSpan={4} className="py-5 px-4 text-body-color dark:text-bodydark">No jobs yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
