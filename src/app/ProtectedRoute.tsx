import { Navigate, Outlet } from 'react-router-dom'
import { getDashboardPath, useAuth } from './auth'
import type { UserRole } from '../types/app'

export default function ProtectedRoute({ role }: { role: UserRole }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return <p className="text-sm text-slate-600">사용자 정보를 확인하고 있습니다.</p>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return (
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">프로필 설정이 필요합니다</h1>
        <p className="mt-3 text-sm text-slate-600">
          로그인 계정의 프로필을 찾지 못했습니다. 관리자에게 문의해주세요.
        </p>
      </section>
    )
  }

  if (profile.role !== role) {
    return <Navigate to={getDashboardPath(profile.role)} replace />
  }

  if (role === 'manager' && profile.manager_status !== 'approved') {
    return (
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">매니저 승인 대기 중입니다</h1>
        <p className="mt-3 text-sm text-slate-600">
          관리자 승인 후 매니저 메뉴를 사용할 수 있습니다.
        </p>
      </section>
    )
  }

  return <Outlet />
}
