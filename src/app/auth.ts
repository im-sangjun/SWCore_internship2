import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '../types/app'

export interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: (nextSession?: Session | null) => Promise<Profile | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function getDashboardPath(role?: UserRole) {
  if (role === 'admin') return '/admin'
  if (role === 'manager') return '/manager'
  return '/student'
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
