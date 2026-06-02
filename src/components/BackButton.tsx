import { useLocation, useNavigate } from 'react-router-dom'
import { getDashboardPath, useAuth } from '../app/auth'

export default function BackButton() {
  const { profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dashboardPath = getDashboardPath(profile?.role)

  if (!profile || location.pathname === '/' || location.pathname === dashboardPath) return null

  return (
    <button
      type="button"
      className="mb-5 rounded-lg border bg-white px-4 py-2 text-sm shadow-sm"
      onClick={() => navigate(-1)}
    >
      ← 뒤로가기
    </button>
  )
}
