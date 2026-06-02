import { Link } from 'react-router-dom'

export default function ManagerDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">매니저 대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/manager/companies" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">모집 등록 관리</h2>
          <p className="mt-2 text-sm text-slate-600">
            세션별 기업 모집 직무를 등록합니다.
          </p>
        </Link>
        <Link to="/manager/recruitments" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">기업별 모집현황</h2><p className="mt-2 text-sm text-slate-600">기업별 모집 공고와 공개 여부를 확인합니다.</p></Link>
        <Link to="/manager/company-list" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">기업 전체 리스트</h2><p className="mt-2 text-sm text-slate-600">기업 상세정보를 등록하고 검색·정렬합니다.</p></Link>

        <Link to="/manager/applications" className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">지원현황 및 결과</h2>
          <p className="mt-2 text-sm text-slate-600">
            기업체별 지원 학생과 선발 여부를 관리합니다.
          </p>
        </Link>
        <Link to="/manager/students" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">참여 학생 관리</h2><p className="mt-2 text-sm text-slate-600">학생 기본 정보와 희망 직무를 확인합니다.</p></Link>
        <Link to="/manager/notices" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">공지사항</h2><p className="mt-2 text-sm text-slate-600">운영 공지를 확인합니다.</p></Link>
        <Link to="/manager/notifications" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">알림</h2><p className="mt-2 text-sm text-slate-600">개인 알림을 확인합니다.</p></Link>
        <Link to="/manager/profile" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">개인정보 수정</h2><p className="mt-2 text-sm text-slate-600">이름과 비밀번호를 수정합니다.</p></Link>
      </div>
    </div>
  )
}
