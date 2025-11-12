import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

// signin ui keeps auth simple
export const SignInPage = () => {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const client = supabase!

  useEffect(() => {
    if (!loading && session) {
      navigate('/hunt', { replace: true })
    }
  }, [session, loading, navigate])

  const handleGoogleSignIn = async () => {
    setBusy(true)
    setError(null)
    const redirectTo = `${window.location.origin}/hunt`
    const { error: authError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setBusy(false)
    }
  }

  return (
    <div className="signin-shell">
      <div className="grid-overlay" />
      <div className="glow-overlay" />
      <div className="signin-card">
        <p className="signin-tag">gdg cryptic hunt :3</p>
        <h1 className="signin-title">buttocks pain excercises</h1>
        <p className="signin-blurb">leaderboard #1 gets a free buttocks pain excercise session</p>
        <button type="button" className="signin-btn" disabled={busy} onClick={handleGoogleSignIn}>
          <span className="signin-btn__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 48 48" role="img">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.9 2.35 30.47 0 24 0 14.62 0 6.53 5.38 2.56 13.22l7.98 6.2C12.6 13.05 17.8 9.5 24 9.5"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.55c0-1.64-.15-3.22-.45-4.75H24v9h12.7c-.55 2.95-2.24 5.46-4.75 7.14l7.48 5.8C43.55 38.6 46.5 32.15 46.5 24.55"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.98A14.47 14.47 0 0 1 9.5 24c0-1.74.3-3.42.84-4.98l-7.98-6.2C.88 15.43 0 19.61 0 24c0 4.32.86 8.43 2.42 12.18z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.92-2.13 15.9-5.82l-7.48-5.8c-2.08 1.4-4.76 2.22-8.42 2.22-6.19 0-11.42-4-13.3-9.6l-7.96 6.18C6.5 42.53 14.62 48 24 48"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          </span>
          sign in with google
        </button>
        {error ? <p className="signin-error">{error}</p> : null}
      </div>
    </div>
  )
}

