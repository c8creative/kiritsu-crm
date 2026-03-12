import { useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function useSession() {
  const [session, setSession] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return { session, loading }
}
