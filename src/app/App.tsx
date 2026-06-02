import { Link, Outlet, useNavigate } from 'react-router-dom'
import { getDashboardPath, useAuth } from './auth'

export default function App() {
  const { session, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const displayName =
    profile?.name?.trim() || session?.user.email || '로그인 사용자'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold">
            SWCore Internship
          </Link>

          <nav className="flex gap-4 text-sm">
            {!loading && !session && (
              <>
                <Link to="/login">로그인</Link>
                <Link to="/register">회원가입</Link>
              </>
            )}

            {!loading && session && (
              <>
                {profile && (
                  <Link to={getDashboardPath(profile.role)}>내 메뉴</Link>
                )}
                <span className="font-medium text-slate-700">
                  {displayName}님
                </span>
                <button type="button" onClick={handleSignOut}>
                  로그아웃
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
