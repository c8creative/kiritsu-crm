import { Navigate, Route, Routes } from 'react-router-dom'
import DefaultLayout from '../layout/DefaultLayout'
import AuthPage from './AuthPage'
import InboxPage from './InboxPage'
import PipelinePage from './PipelinePage'
import AccountsPage from './AccountsPage'
import AccountDetailPage from './AccountDetailPage'
import FollowUpsPage from './FollowUpsPage'
import JobsPage from './JobsPage'
import JobDetailPage from './JobDetailPage'
import ProfilePage from './ProfilePage'
import ContactsPage from './ContactsPage'
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
        <Route path="/" element={<Navigate to="/followups" replace />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/followups" element={<FollowUpsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/inbox" replace />} />
      </Routes>
    </DefaultLayout>
  )
}
