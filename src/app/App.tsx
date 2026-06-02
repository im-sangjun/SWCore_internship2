import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold">
            SWCore Internship
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link to="/login">로그인</Link>
            <Link to="/register">회원가입</Link>
            <Link to="/student">학생</Link>
            <Link to="/manager">매니저</Link>
            <Link to="/admin">관리자</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
