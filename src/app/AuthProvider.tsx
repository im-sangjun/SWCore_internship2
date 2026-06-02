import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/app'
import { AuthContext } from './auth'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (currentSession: Session | null) => {
    if (!currentSession) {
      setProfile(null)
      return null
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentSession.user.id)
      .maybeSingle<Profile>()

    setProfile(data)
    return data
  }

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      await loadProfile(data.session)
      setLoading(false)
    }

    void initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(true)
      void loadProfile(nextSession).finally(() => setLoading(false))
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = (nextSession = session) => loadProfile(nextSession)

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
