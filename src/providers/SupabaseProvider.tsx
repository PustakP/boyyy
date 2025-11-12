import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { AuthContext, type Profile } from '../context/AuthContext'

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const client = supabase
  const fallbackAuthValue = useMemo(
    () => ({
      session: null,
      profile: null,
      loading: false,
      refreshProfile: async () => {},
      signOut: async () => {},
    }),
    [],
  )

  useEffect(() => {
    if (!client) {
      setLoading(false)
      return
    }

    let ignore = false

    const handleSession = async () => {
      setLoading(true)
      const {
        data: { session: initialSession },
      } = await client.auth.getSession()
      if (!ignore) {
        setSession(initialSession)
        setLoading(false)
      }
    }

    handleSession()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession)
      if (!authSession) {
        setProfile(null)
      }
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [client])

  useEffect(() => {
    if (!client) {
      setProfile(null)
      setLoading(false)
      return
    }

    if (!session?.user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }

    let ignore = false

    const loadProfile = async () => {
      setLoading(true)
      const { data, error } = await client
        .from('profiles')
        .select('id, display_name, current_level, updated_at')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('failed to load profile', error)
      }

      if (!ignore) {
        setProfile(data ?? null)
        setLoading(false)
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [client, session?.user?.id])

  const refreshProfile = useCallback(async () => {
    if (!client) {
      setProfile(null)
      return
    }
    if (!session?.user?.id) {
      setProfile(null)
      return
    }
    const { data, error } = await client
      .from('profiles')
      .select('id, display_name, current_level, updated_at')
      .eq('id', session.user.id)
      .maybeSingle()
    if (error) {
      console.error('failed to refresh profile', error)
      return
    }
    setProfile(data ?? null)
  }, [client, session?.user?.id])

  const signOut = useCallback(async () => {
    if (!client) {
      return
    }
    await client.auth.signOut()
    setProfile(null)
  }, [client])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      refreshProfile,
      signOut,
    }),
    [session, profile, loading, refreshProfile, signOut],
  )

  if (!isSupabaseConfigured || !client) {
    // env msg keeps supa dx clear
    return (
      <AuthContext.Provider value={fallbackAuthValue}>
        <div className="config-shell">
          <div className="grid-overlay" />
          <div className="glow-overlay" />
          <div className="config-card">
            <h2 className="config-title">supabase env needed</h2>
            <p className="config-blurb">
              add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a local <code>.env</code>{' '}
              file, then restart the dev server.
            </p>
            <ul className="config-list">
              <li>copy values from supabase project settings</li>
              <li>ensure redirect uri matches <code>http://localhost:5173/hunt</code></li>
              <li>run <code>npm run dev</code> again after saving</li>
            </ul>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
