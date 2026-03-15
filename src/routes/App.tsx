import { Navigate, Route, Routes } from 'react-router-dom'
import DefaultLayout from '../layout/DefaultLayout'
import AuthPage from './AuthPage'
import InboxPage from './InboxPage'
import PipelinePage from './PipelinePage'
import ConnectionsPage from './ConnectionsPage'
import ConnectionDetailPage from './ConnectionDetailPage'
import DashboardPage from './DashboardPage'
import JobsPage from './JobsPage'
import JobDetailPage from './JobDetailPage'
import ProfilePage from './ProfilePage'
import SettingsPage from './SettingsPage'
import { useSession } from '../ui/useSession'

export default function App() {
  const { session, loading } = useSession()

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>

  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/connections/:id" element={<ConnectionDetailPage />} />
        <Route path="/followups" element={<Navigate to="/" replace />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefaultLayout>
  )
}
