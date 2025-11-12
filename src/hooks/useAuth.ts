import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// auth hook keeps ctx handy
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within SupabaseProvider')
  }
  return context
}

