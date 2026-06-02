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
        <Link to="/student/notices" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">공지사항</h2><p className="mt-2 text-sm text-slate-600">주요 안내를 확인합니다.</p></Link>
        <Link to="/student/consultations" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">상담 신청</h2><p className="mt-2 text-sm text-slate-600">상담을 요청하고 답변을 확인합니다.</p></Link>
        <Link to="/student/notifications" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">알림</h2><p className="mt-2 text-sm text-slate-600">개인 알림을 확인합니다.</p></Link>
        <Link to="/student/profile" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">개인정보 수정</h2><p className="mt-2 text-sm text-slate-600">기본 정보와 비밀번호를 수정합니다.</p></Link>
      </div>
    </div>
  )
}
