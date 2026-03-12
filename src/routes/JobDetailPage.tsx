
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
  if (!job) return <div>Loading…</div>

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="h1">Job</h1>
          <div className="pill">{job.frequency} • ${job.price_per_visit ?? '—'}/visit</div>
        </div>
      </div>

      {err && <div style={{ color: 'var(--danger)' }}>{err}</div>}

      <div className="split">
        <div className="card">
          <strong>Schedule visit</strong>
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
            style={{ marginTop: 10 }}
          >
            <div>
              <div className="label">Scheduled for</div>
              <input className="input" type="date" name="scheduled_for" />
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn primary" disabled={busy}>Add visit</button>
            </div>
          </form>

          <div style={{ marginTop: 14 }}>
            <strong>Visits</strong>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>Date</th><th>Status</th><th>Notes</th><th></th></tr></thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td>{v.scheduled_for ?? '—'}</td>
                    <td>{v.status}</td>
                    <td style={{ color: 'var(--muted)' }}>{v.notes ?? '—'}</td>
                    <td>
                      {v.status !== 'completed' && (
                        <button
                          className="btn"
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
                {visits.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>No visits yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <strong>Job notes</strong>
          <div style={{ marginTop: 10, color: 'var(--muted)' }}>{job.notes ?? '—'}</div>
        </div>
      </div>
    </div>
  )
}
