import { useEffect, useMemo, useState } from 'react'
import { createLead, convertLeadToAccount, listLeads } from '../lib/db'
import type { Lead } from '../lib/types'
import CsvImport from '../ui/CsvImport'

type LeadSource = 'door' | 'website' | 'referral' | 'other'

export default function InboxPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const refresh = async () => {
    setErr(null)
    const data = await listLeads()
    setLeads(data)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  const newLeads = useMemo(
    () => leads.filter((l) => l.status === 'new'),
    [leads],
  )

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)

    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    // Basic normalization
    const source = (String(fd.get('source') || 'door') as LeadSource) ?? 'door'
    const name = String(fd.get('name') || '').trim()
    const phoneRaw = String(fd.get('phone') || '').trim()
    const emailRaw = String(fd.get('email') || '').trim()
    const addressRaw = String(fd.get('address_text') || '').trim()

    if (!name) {
      setErr('Business name is required.')
      return
    }

    setBusy(true)
    try {
      // ✅ IMPORTANT: Do NOT pass owner_id/id/created_at placeholders.
      // createLead() should derive owner_id from the authenticated session.
      await createLead({
        source,
        name,
        phone: phoneRaw.length ? phoneRaw : null,
        email: emailRaw.length ? emailRaw : null,
        address_text: addressRaw.length ? addressRaw : null,
        status: 'new',
      } as any)

      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create lead')
    } finally {
      setBusy(false)
    }
  }

  const onConvert = async (leadId: string) => {
    setErr(null)
    setBusy(true)
    try {
      await convertLeadToAccount(leadId)
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to convert lead')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="h1">Inbox</h1>
          <div className="pill">New leads: {newLeads.length}</div>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <strong>Add lead</strong>
          <form onSubmit={onCreate} style={{ marginTop: 10 }}>
            <div className="row">
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Source</div>
                <select name="source" className="input" defaultValue="door">
                  <option value="door">Door / Walk-in</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ flex: 2, minWidth: 220 }}>
                <div className="label">Business name</div>
                <input
                  name="name"
                  className="input"
                  placeholder="Restaurant / Business"
                  required
                />
              </div>
            </div>

            <div className="row" style={{ marginTop: 10 }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Phone</div>
                <input name="phone" className="input" placeholder="703-555-1234" />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Email</div>
                <input name="email" className="input" placeholder="gm@restaurant.com" />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="label">Address / Notes</div>
              <textarea
                name="address_text"
                className="input"
                rows={3}
                placeholder="Address or quick notes"
              />
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button className="btn primary" disabled={busy}>
                {busy ? 'Adding…' : 'Add'}
              </button>
              <span style={{ color: 'var(--muted)', fontSize: 12, alignSelf: 'center' }}>
                Convert a lead to create an Account + Opportunity.
              </span>
            </div>
          </form>

          {err && (
            <div style={{ color: 'var(--danger)', marginTop: 10 }}>
              {err}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <CsvImport onImported={refresh} />
          </div>
        </div>

        <div className="card">
          <strong>New leads</strong>
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Source</th>
                <th>Contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {newLeads.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.source}</td>
                  <td style={{ color: 'var(--muted)' }}>{l.email || l.phone || '—'}</td>
                  <td>
                    <button
                      className="btn primary"
                      onClick={() => onConvert(l.id)}
                      disabled={busy}
                    >
                      Convert
                    </button>
                  </td>
                </tr>
              ))}

              {newLeads.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--muted)' }}>
                    No new leads.
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