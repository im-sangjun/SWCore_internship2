import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getDashboardPath, useAuth } from '../../app/auth'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const { session, profile, loading, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    const nextProfile = await refreshProfile(data.session)
    navigate(getDashboardPath(nextProfile?.role), { replace: true })
  }

  if (!loading && session) {
    return <Navigate to={getDashboardPath(profile?.role)} replace />
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">이메일</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">비밀번호</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white">
          로그인
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      )}
    </div>
  )
}
