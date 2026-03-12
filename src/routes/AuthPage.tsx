
import { useState } from 'react'
import { signIn } from '../lib/db'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '10vh auto' }} className="card">
      <div className="h1">Kiritsu CRM Lite</div>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>Single-user login (Firebase Auth)</p>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <div className="label">Email</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div className="label">Password</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <div style={{ color: 'var(--danger)', marginBottom: 10 }}>{error}</div>}
        <button className="btn primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
        Create your user in Firebase Auth first.
      </div>
    </div>
  )
}
