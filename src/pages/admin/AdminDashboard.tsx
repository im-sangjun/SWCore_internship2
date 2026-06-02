import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">관리자 대시보드</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/admin/users" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">사용자 관리</h2>
          <p className="mt-2 text-sm text-slate-600">
            매니저 승인과 학생 정보를 관리합니다.
          </p>
        </Link>

        <Link to="/admin/sessions" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">세션 관리</h2>
          <p className="mt-2 text-sm text-slate-600">
            1학기, 하계, 2학기, 동계 인턴십 세션을 관리합니다.
          </p>
        </Link>

        <Link to="/admin/matchings" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">기업-학생 매칭</h2>
          <p className="mt-2 text-sm text-slate-600">
            학생 지원 현황을 바탕으로 기업 매칭을 관리합니다.
          </p>
        </Link>

        <Link to="/admin/codes" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">코드 관리</h2>
          <p className="mt-2 text-sm text-slate-600">
            AI개발, SW개발 등 직무 코드를 관리합니다.
          </p>
        </Link>
      </div>
    </div>
  )
}
