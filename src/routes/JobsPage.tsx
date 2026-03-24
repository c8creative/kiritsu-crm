import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listConnections, listJobs } from '../lib/db'
import type { Connection, Job } from '../lib/types'
import { MdOutlineWork, MdSearch, MdAdd, MdOutlineVisibility } from 'react-icons/md'
import AddJobModal from '../ui/AddJobModal'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const refresh = async () => {
    const [j, c] = await Promise.all([listJobs(), listConnections()])
    setJobs(j)
    setConnections(c)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return jobs
    return jobs.filter((j) => {
      const conn = connections.find(c => c.id === j.connection_id)
      const matchesConn = conn && (`${conn.firstName} ${conn.lastName}`.toLowerCase().includes(s) || (conn.company || '').toLowerCase().includes(s))
      const matchesNotes = (j.notes || '').toLowerCase().includes(s)
      return matchesConn || matchesNotes
    })
  }, [jobs, connections, q])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-black dark:text-white flex items-center gap-2">
            <MdOutlineWork /> Jobs
          </h2>
          <p className="text-sm font-medium text-body-color dark:text-bodydark mt-1">
            Manage recurring service agreements and one-time jobs
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
                    placeholder="Search jobs..."
                />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-2.5 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
                <MdAdd size={20} />
                Create Job
            </button>
        </div>
      </div>

      <AddJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refresh}
        connections={connections}
      />

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-bold text-black dark:text-white xl:pl-8 uppercase text-xs">
                  Connection
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Frequency
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Started
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Price
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Notes
                </th>
                <th className="py-4 px-4 font-bold text-black dark:text-white uppercase text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j, key) => {
                const conn = connections.find(c => c.id === j.connection_id)
                return (
                 <tr key={j.id} className={key === filtered.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                  <td className="py-5 px-4 xl:pl-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            <MdOutlineWork size={20} />
                        </div>
                        <div>
                            <p className="text-black dark:text-white font-semibold">
                                {conn ? `${conn.firstName} ${conn.lastName}` : 'Unknown Connection'}
                            </p>
                            {conn?.company && <p className="text-xs text-bodydark2">{conn.company}</p>}
                        </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="capitalize text-black dark:text-white font-medium">{j.frequency || 'Weekly'}</span>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-body-color dark:text-bodydark">{j.start_date || '—'}</p>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-success font-medium">{j.price_per_visit ? `$${j.price_per_visit.toFixed(2)}` : '—'}</p>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-body-color dark:text-bodydark text-sm truncate max-w-xs" title={j.notes || ''}>
                      {j.notes || '—'}
                    </p>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${j.id}`}
                        title="View Job"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <MdOutlineVisibility size={16} /> Open
                      </Link>
                    </div>
                  </td>
                </tr>
               )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-body-color dark:text-bodydark italic">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
