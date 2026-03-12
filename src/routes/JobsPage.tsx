
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createJob, listAccounts, listJobs } from '../lib/db'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    const [j, a] = await Promise.all([listJobs(), listAccounts()])
    setJobs(j as any)
    setAccounts(a as any)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusy(true)
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="h1">Jobs</h1>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Recurring agreements → visits</div>
        </div>
      </div>

      {err && <div style={{ color: 'var(--danger)', marginBottom: 10 }}>{err}</div>}

      <div className="split">
        <div className="card">
          <strong>Create job</strong>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const fd = new FormData(form)
              setBusy(true)
              setErr(null)
              try {
                const account_id = String(fd.get('account_id') || '')
                const frequency = String(fd.get('frequency') || 'weekly')
                const price_per_visit = fd.get('price_per_visit') ? Number(fd.get('price_per_visit')) : null
                const start_date = String(fd.get('start_date') || '') || null
                await createJob({
                  account_id,
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
            style={{ marginTop: 10 }}
          >
            <div style={{ marginBottom: 10 }}>
              <div className="label">Account</div>
              <select className="input" name="account_id" required>
                <option value="">Select…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="row">
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Frequency</div>
                <select className="input" name="frequency" defaultValue="weekly">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Day of week (0=Sun)</div>
                <input className="input" name="day_of_week" placeholder="1" />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Start date</div>
                <input className="input" type="date" name="start_date" />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Price per visit</div>
                <input className="input" name="price_per_visit" placeholder="150" />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="label">Notes</div>
              <textarea className="input" name="notes" rows={3} placeholder="Gate code / access / glass notes" />
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn primary" disabled={busy}>Create</button>
            </div>
          </form>
        </div>

        <div className="card">
          <strong>All jobs</strong>
          <table className="table" style={{ marginTop: 10 }}>
            <thead><tr><th>Account</th><th>Frequency</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td style={{ color: 'var(--accent)' }}>{accounts.find((a) => a.id === j.account_id)?.name ?? j.account_id}</td>
                  <td>{j.frequency}</td>
                  <td style={{ color: 'var(--muted)' }}>{j.price_per_visit ?? '—'}</td>
                  <td><Link className="btn" to={`/jobs/${j.id}`}>Open</Link></td>
                </tr>
              ))}
              {jobs.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>No jobs yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
