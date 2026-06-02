import { Link } from 'react-router-dom'

export default function ManagerDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">매니저 대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/manager/companies" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">기업 현황 관리</h2>
          <p className="mt-2 text-sm text-slate-600">
            기업 정보와 모집 직무를 관리합니다.
          </p>
        </Link>

        <Link to="/manager/applications" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">지원 현황 관리</h2>
          <p className="mt-2 text-sm text-slate-600">
            학생 지원 현황을 조회하고 관리합니다.
          </p>
        </Link>
      </div>
    </div>
  )
}
