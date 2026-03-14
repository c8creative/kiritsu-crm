import { useState } from 'react'
import { signIn } from '../lib/db'
import { auth } from '../lib/firebase'

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-whiten dark:bg-boxdark-2">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-[420px] p-8 sm:p-10">
        <h2 className="mb-2 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
          Kiritsu CRM Lite
        </h2>
        <p className="mb-6 font-medium text-body-color dark:text-bodydark">
          Single-user login (Firebase Auth)
        </p>

        {!auth && (
          <div className="mb-6 flex w-full border-l-6 border-warning bg-warning bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
            <div className="w-full">
              <h5 className="mb-1 font-semibold text-[#9D5425]">
                Firebase Config Missing
              </h5>
              <p className="text-sm text-[#D0915C]">
                Please add your VITE_FIREBASE_* variables to your .env file to run the app.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">Email</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2.5 block font-medium text-black dark:text-white">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="mb-4 text-meta-1">{error}</div>}

          <div className="mb-5">
            <button
              className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-3 text-white transition hover:bg-opacity-90"
              disabled={busy}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-body-color dark:text-bodydark">
            Create your user in Firebase Auth first.
          </p>
        </div>
      </div>
    </div>
  )
}
