import { Link } from 'react-router-dom'

export default function StudentDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">학생 대시보드</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/student/companies" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">기업 리스트</h2>
          <p className="mt-2 text-sm text-slate-600">인턴십 모집 기업을 확인합니다.</p>
        </Link>

        <Link to="/student/apply" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">인턴십 지원</h2>
          <p className="mt-2 text-sm text-slate-600">1순위/2순위 기업에 지원합니다.</p>
        </Link>

        <Link to="/student/applications" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">지원 현황</h2>
          <p className="mt-2 text-sm text-slate-600">지원 여부와 선발 상태를 확인합니다.</p>
        </Link>
      </div>
    </div>
  )
}
