
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAccounts } from '../lib/db'
import type { Account } from '../lib/types'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    listAccounts().then(setAccounts).catch((e) => setErr(e.message))
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return accounts
    return accounts.filter((a) => a.name.toLowerCase().includes(s))
  }, [accounts, q])

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="h1">Accounts</h1>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Customers + prospects</div>
        </div>
        <input className="input" style={{ maxWidth: 320 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
      </div>

      {err && <div style={{ color: 'var(--danger)' }}>{err}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Industry</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><Link to={`/accounts/${a.id}`} style={{ color: 'var(--accent)' }}>{a.name}</Link></td>
                <td>{a.status}</td>
                <td style={{ color: 'var(--muted)' }}>{a.industry ?? '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>No accounts.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
