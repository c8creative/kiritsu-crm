
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addActivity, addContact, addLocation, getAccount } from '../lib/db'

export default function AccountDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    if (!id) return
    const d = await getAccount(id)
    setData(d)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [id])

  if (!id) return null
  if (!data) return <div>Loading…</div>

  const { account, contacts, locations, opps, activities, jobs } = data
  const primaryOpp = opps?.[0]?.id ?? null

  const onAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusy(true)
    try {
      await addContact(id, {
        name: String(fd.get('name') || ''),
        role: String(fd.get('role') || ''),
        phone: String(fd.get('phone') || ''),
        email: String(fd.get('email') || ''),
      })
      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const onAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusy(true)
    try {
      await addLocation(id, {
        label: String(fd.get('label') || ''),
        address1: String(fd.get('address1') || ''),
        city: String(fd.get('city') || ''),
        state: String(fd.get('state') || ''),
        zip: String(fd.get('zip') || ''),
        notes: String(fd.get('notes') || ''),
      } as any)
      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

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
    <div>
      <div className="topbar">
        <div>
          <h1 className="h1">{account.name}</h1>
          <div className="pill">{account.status}</div>
        </div>
      </div>

      {err && <div style={{ color: 'var(--danger)', marginBottom: 10 }}>{err}</div>}

      <div className="split">
        <div className="card">
          <strong>Timeline</strong>
          <form onSubmit={onAddNote} style={{ marginTop: 10 }}>
            <div className="row">
              <div style={{ flex: 1 }}>
                <div className="label">Summary</div>
                <input className="input" name="summary" placeholder="Spoke with GM…" />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="label">Details</div>
              <textarea className="input" name="details" rows={3} placeholder="What happened / next step" />
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn primary" disabled={busy}>Add note</button>
            </div>
          </form>

          <div style={{ marginTop: 14 }}>
            {(activities ?? []).map((a: any) => (
              <div key={a.id} className="cardItem">
                <strong>{a.summary || a.activity_type}</strong>
                <div className="meta">{new Date(a.occurred_at).toLocaleString()}</div>
                {a.details && <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>{a.details}</div>}
              </div>
            ))}
            {(activities ?? []).length === 0 && <div style={{ color: 'var(--muted)' }}>No activity yet.</div>}
          </div>
        </div>

        <div className="card">
          <strong>Contacts</strong>
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr><th>Name</th><th>Role</th><th>Contact</th></tr>
            </thead>
            <tbody>
              {(contacts ?? []).map((c: any) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{c.role ?? '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>{c.email || c.phone || '—'}</td>
                </tr>
              ))}
              {(contacts ?? []).length === 0 && <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>No contacts yet.</td></tr>}
            </tbody>
          </table>

          <form onSubmit={onAddContact} style={{ marginTop: 10 }}>
            <div className="row">
              <div style={{ flex: 1 }}>
                <div className="label">Name</div>
                <input className="input" name="name" required />
              </div>
              <div style={{ flex: 1 }}>
                <div className="label">Role</div>
                <input className="input" name="role" placeholder="Owner / GM" />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <div className="label">Phone</div>
                <input className="input" name="phone" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="label">Email</div>
                <input className="input" name="email" />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn" disabled={busy}>Add contact</button>
            </div>
          </form>

          <div style={{ marginTop: 16 }}>
            <strong>Locations</strong>
            <table className="table" style={{ marginTop: 10 }}>
              <thead>
                <tr><th>Label</th><th>Address</th></tr>
              </thead>
              <tbody>
                {(locations ?? []).map((l: any) => (
                  <tr key={l.id}>
                    <td>{l.label || '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{[l.address1, l.city, l.state, l.zip].filter(Boolean).join(', ') || '—'}</td>
                  </tr>
                ))}
                {(locations ?? []).length === 0 && <tr><td colSpan={2} style={{ color: 'var(--muted)' }}>No locations yet.</td></tr>}
              </tbody>
            </table>

            <form onSubmit={onAddLocation} style={{ marginTop: 10 }}>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <div className="label">Label</div>
                  <input className="input" name="label" placeholder="Downtown" />
                </div>
                <div style={{ flex: 2 }}>
                  <div className="label">Address</div>
                  <input className="input" name="address1" placeholder="123 King St" />
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div style={{ flex: 1 }}>
                  <div className="label">City</div>
                  <input className="input" name="city" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label">State</div>
                  <input className="input" name="state" defaultValue="VA" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label">ZIP</div>
                  <input className="input" name="zip" />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="label">Notes</div>
                <textarea className="input" name="notes" rows={2} placeholder="Glass notes / access" />
              </div>
              <div style={{ marginTop: 10 }}>
                <button className="btn" disabled={busy}>Add location</button>
              </div>
            </form>
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>Jobs</strong>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>
              Jobs are managed from the Jobs page (link in sidebar).
            </div>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>Frequency</th><th>Price/Visit</th><th>Active</th></tr></thead>
              <tbody>
                {(jobs ?? []).slice(0,5).map((j: any) => (
                  <tr key={j.id}>
                    <td>{j.frequency}</td>
                    <td style={{ color: 'var(--muted)' }}>{j.price_per_visit ?? '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{j.active ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {(jobs ?? []).length === 0 && <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>No jobs yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
