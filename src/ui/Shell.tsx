
import { NavLink } from 'react-router-dom'
import { signOut } from '../lib/db'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Kiritsu CRM</div>
        <nav className="nav">
          <NavLink to="/inbox">Inbox</NavLink>
          <NavLink to="/pipeline">Pipeline</NavLink>
          <NavLink to="/followups">Follow-ups</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
        </nav>
        <div style={{ marginTop: 16 }}>
          <button className="btn danger" onClick={() => signOut()}>Sign out</button>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
          Barebones CRM + recurring jobs.
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  )
}
