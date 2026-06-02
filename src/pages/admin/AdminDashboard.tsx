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
            1학기, 하계, 하계_2학기, 2학기, 동계, 동계_1학기 세션을 관리합니다.
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
        <Link to="/admin/companies" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">모집 등록 관리</h2><p className="mt-2 text-sm text-slate-600">세션별 기업 모집 직무를 등록합니다.</p></Link>
        <Link to="/admin/recruitments" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">기업별 모집현황</h2><p className="mt-2 text-sm text-slate-600">기업별 모집 공고와 공개 여부를 확인합니다.</p></Link>
        <Link to="/admin/applications" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">지원현황 및 결과</h2><p className="mt-2 text-sm text-slate-600">기업체별 지원 학생과 선발 여부를 관리합니다.</p></Link>
        <Link to="/admin/company-list" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">기업 전체 리스트</h2><p className="mt-2 text-sm text-slate-600">기업 상세정보를 등록하고 검색·정렬합니다.</p></Link>
        <Link to="/admin/notices" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">공지 관리</h2><p className="mt-2 text-sm text-slate-600">역할별 공지를 등록하고 확인합니다.</p></Link>
        <Link to="/admin/consultations" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">상담 관리</h2><p className="mt-2 text-sm text-slate-600">학생 상담 요청에 답변합니다.</p></Link>
        <Link to="/admin/notifications" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">알림</h2><p className="mt-2 text-sm text-slate-600">개인 알림을 확인합니다.</p></Link>
        <Link to="/admin/profile" className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-bold">개인정보 수정</h2><p className="mt-2 text-sm text-slate-600">이름과 비밀번호를 수정합니다.</p></Link>
      </div>
    </div>
  )
}
