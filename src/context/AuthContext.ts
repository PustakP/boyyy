import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type Profile = {
  id: string
  display_name: string | null
  current_level: number
  updated_at: string | null
}

export type AuthContextValue = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

