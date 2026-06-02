import { Link } from 'react-router-dom'
import { getDashboardPath, useAuth } from '../../app/auth'

export default function HomePage() {
  const { session, profile, loading } = useAuth()

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-blue-600">
          SW중심대학 인턴십 관리 시스템
        </p>

        <h1 className="mb-4 text-3xl font-bold">
          SWCore Internship
        </h1>

        <p className="mb-6 text-slate-600">
          인턴십 기업 모집, 학생 신청, 지원 현황, 기업-학생 매칭,
          상담 및 공지를 통합 관리하는 서버리스 PWA입니다.
        </p>

        {!loading && (
          <div className="flex gap-3">
            {session ? (
              <Link
                to={getDashboardPath(profile?.role)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                내 메뉴로 이동
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white"
                >
                  로그인
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg border px-4 py-2"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-bold">학생</h2>
          <p className="text-sm text-slate-600">
            기업 리스트 확인, 1순위/2순위 지원, 지원 현황 확인,
            상담 신청을 할 수 있습니다.
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-bold">매니저</h2>
          <p className="text-sm text-slate-600">
            기업 현황, 참여 학생, 지원 현황, 직무 그룹핑을 관리합니다.
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-bold">관리자</h2>
          <p className="text-sm text-slate-600">
            사용자 승인, 세션 설정, 기업-학생 매칭, 코드 관리,
            공지와 상담을 관리합니다.
          </p>
        </div>
      </section>
    </div>
  )
}
