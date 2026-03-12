
import { useEffect, useMemo, useState } from 'react'
import { format, isBefore, isEqual, parseISO, startOfDay } from 'date-fns'
import { listFollowUps, PIPELINE_STAGES } from '../lib/db'
import type { Opportunity } from '../lib/types'

export default function FollowUpsPage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    listFollowUps().then(setItems).catch((e) => setErr(e.message))
  }, [])

  const today = startOfDay(new Date())

  const enriched = useMemo(() => {
    const stageLabel = (k: string) => PIPELINE_STAGES.find((s) => s.key === k)?.label ?? k
    return items.map((o) => {
      const d = o.next_follow_up_date ? parseISO(o.next_follow_up_date) : null
      const overdue = d ? isBefore(d, today) : false
      const dueToday = d ? isEqual(startOfDay(d), today) : false
      return { ...o, stageLabel: stageLabel(o.stage), overdue, dueToday }
    })
  }, [items])

  const overdue = enriched.filter((x: any) => x.overdue)
  const dueToday = enriched.filter((x: any) => x.dueToday)
  const upcoming = enriched.filter((x: any) => !x.overdue && !x.dueToday)

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="h1">Follow-ups</h1>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Overdue → Today → Upcoming</div>
        </div>
      </div>
      {err && <div style={{ color: 'var(--danger)' }}>{err}</div>}

      <div className="split">
        <div className="card">
          <strong>Overdue</strong>
          <table className="table" style={{ marginTop: 10 }}>
            <thead><tr><th>Stage</th><th>Follow-up</th><th>Note</th></tr></thead>
            <tbody>
              {overdue.map((o: any) => (
                <tr key={o.id}>
                  <td>{o.stageLabel}</td>
                  <td style={{ color: 'var(--danger)' }}>{o.next_follow_up_date}</td>
                  <td style={{ color: 'var(--muted)' }}>{o.next_follow_up_note ?? '—'}</td>
                </tr>
              ))}
              {overdue.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>None</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <strong>Due today</strong>
          <table className="table" style={{ marginTop: 10 }}>
            <thead><tr><th>Stage</th><th>Follow-up</th><th>Note</th></tr></thead>
            <tbody>
              {dueToday.map((o: any) => (
                <tr key={o.id}>
                  <td>{o.stageLabel}</td>
                  <td>{o.next_follow_up_date}</td>
                  <td style={{ color: 'var(--muted)' }}>{o.next_follow_up_note ?? '—'}</td>
                </tr>
              ))}
              {dueToday.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>None</td></tr>}
            </tbody>
          </table>

          <div style={{ marginTop: 16 }}>
            <strong>Upcoming</strong>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>Stage</th><th>Follow-up</th><th>Note</th></tr></thead>
              <tbody>
                {upcoming.map((o: any) => (
                  <tr key={o.id}>
                    <td>{o.stageLabel}</td>
                    <td>{o.next_follow_up_date ? format(parseISO(o.next_follow_up_date), 'yyyy-MM-dd') : '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{o.next_follow_up_note ?? '—'}</td>
                  </tr>
                ))}
                {upcoming.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>None</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
