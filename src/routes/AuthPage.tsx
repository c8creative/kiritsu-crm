import { useState } from 'react'
import { signIn, signUp, signInWithGoogle, resetPassword } from '../lib/db'
import { auth } from '../lib/firebase'
import Logo from '../images/brand/kiritsu-crm-logo.png'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setBusy(true)
    try {
      if (isForgotPassword) {
        if (!email) throw new Error('Please enter your email to reset password.')
        await resetPassword(email)
        setSuccessMsg('Password reset email sent! Check your inbox.')
        setTimeout(() => setIsForgotPassword(false), 3000)
      } else if (isSignUp) {
        if (password.length < 8) throw new Error('Password must be at least 8 characters long.')
        if (password !== confirmPassword) throw new Error('Passwords do not match.')
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setError(err.message ?? (isSignUp ? 'Sign up failed' : 'Login failed'))
    } finally {
      setBusy(false)
    }
  }

  const onGoogleSignIn = async () => {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message ?? 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-whiten dark:bg-boxdark-2">
      <div className="rounded-[25px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-[420px] p-8 sm:p-10 flex flex-col items-center">
        <div className="mb-4">
          <img src={Logo} alt="Kiritsu CRM" className="h-24 w-auto" />
        </div>
        <h2 className="mb-2 text-2xl font-bold font-nunito text-black dark:text-white sm:text-title-xl2 text-center">
          {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="mb-8 font-medium text-body-color dark:text-bodydark text-center">
          {isForgotPassword 
            ? 'Enter your email to receive a password reset link'
            : isSignUp 
              ? 'Sign up to modernize your customer retention' 
              : 'Log in to continue to Kiritsu CRM'}
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

        <form onSubmit={onSubmit} className="w-full">
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

          {!isForgotPassword && (
            <div className="mb-6">
              <div className="mb-2.5 flex justify-between items-center">
                <label className="block font-medium text-black dark:text-white">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true)
                      setError(null)
                      setSuccessMsg(null)
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-body-color dark:text-bodydark tracking-wider">
                  Must be at least 8 characters long
                </p>
              )}
            </div>
          )}

          {isSignUp && !isForgotPassword && (
            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">Confirm Password</label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {error && <div className="mb-4 text-meta-1">{error}</div>}
          {successMsg && <div className="mb-4 text-[#34A853]">{successMsg}</div>}

          <div className="mb-5">
            <button
              className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-3 text-white transition hover:bg-opacity-90 font-medium"
              disabled={busy}
            >
              {busy 
                ? (isForgotPassword ? 'Sending…' : isSignUp ? 'Creating account…' : 'Signing in…') 
                : (isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign in')}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => {
              if (isForgotPassword) {
                setIsForgotPassword(false)
              } else {
                setIsSignUp(!isSignUp)
              }
              setError(null)
              setSuccessMsg(null)
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            {isForgotPassword 
              ? 'Back to Login' 
              : isSignUp 
                ? 'Already have an account? Sign In' 
                : 'Need an account? Sign Up'}
          </button>
        </div>

        {!isForgotPassword && (
          <div className="mb-6 mt-6 flex items-center justify-between">
            <span className="block h-px w-full bg-stroke dark:bg-strokedark"></span>
            <span className="px-3 text-sm text-body-color dark:text-bodydark">OR</span>
            <span className="block h-px w-full bg-stroke dark:bg-strokedark"></span>
          </div>
        )}

        {!isForgotPassword && (
          <button
            onClick={onGoogleSignIn}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-3 font-medium text-black hover:bg-opacity-90 dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.9897 10.1871C19.9897 9.36761 19.9214 8.76973 19.7714 8.14966H10.2051V11.8501H15.8158C15.6962 12.8356 15.0477 14.1528 13.7677 15.0312L13.7489 15.1548L16.7399 17.4302L16.9464 17.4504C18.8504 15.7193 19.9897 13.1899 19.9897 10.1871Z"
                  fill="#4285F4"
                />
                <path
                  d="M10.2055 19.9639C12.9363 19.9639 15.2234 19.0772 16.9469 17.4504L13.7681 15.0312C12.9147 15.6291 11.7545 16.0498 10.2055 16.0498C7.54303 16.0498 5.27303 14.2995 4.46243 11.8384L4.34638 11.8481L1.24028 14.2116L1.19971 14.3201C2.87229 17.596 6.27957 19.9639 10.2055 19.9639Z"
                  fill="#34A853"
                />
                <path
                  d="M4.46201 11.8385C4.25719 11.2396 4.13774 10.597 4.13774 9.92605C4.13774 9.25505 4.25719 8.61254 4.44493 8.01358L4.43926 7.88418L1.31215 5.48511L1.20961 5.53917C0.578143 6.78018 0.219727 8.18821 0.219727 9.68261C0.219727 11.177 0.578143 12.585 1.20961 13.8261L4.46201 11.8385Z"
                  fill="#FBBC05"
                />
                <path
                  d="M10.2055 3.80219C12.1001 3.80219 13.3802 4.60002 14.1141 5.28688L16.9977 2.51642C15.2059 0.9575 12.9359 0 10.2055 0C6.27957 0 2.87229 2.36783 1.19971 5.64375L4.44493 8.01358C5.27303 5.55246 7.54303 3.80219 10.2055 3.80219Z"
                  fill="#EB4335"
                />
              </svg>
            </span>
            Sign in with Google
          </button>
        )}

        <div className="mt-8 text-center border-t border-stroke dark:border-strokedark pt-6 w-full">
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-widest">
            © 2026 Kiritsu Services | C8Creates
          </p>
        </div>
      </div>
    </div>
  )
}
