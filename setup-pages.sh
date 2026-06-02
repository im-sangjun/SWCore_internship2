#!/bin/bash

mkdir -p src/pages/public
mkdir -p src/pages/student
mkdir -p src/pages/manager
mkdir -p src/pages/admin
mkdir -p src/app
mkdir -p src/types
mkdir -p src/lib

cat > src/pages/public/HomePage.tsx <<'EOT'
import { Link } from 'react-router-dom'

export default function HomePage() {
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

        <div className="flex gap-3">
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
        </div>
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
EOT

cat > src/pages/public/LoginPage.tsx <<'EOT'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('로그인되었습니다.')
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">이메일</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">비밀번호</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white">
          로그인
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      )}
    </div>
  )
}
EOT

cat > src/pages/public/RegisterPage.tsx <<'EOT'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { UserRole } from '../../types/app'

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [studentNo, setStudentNo] = useState('')
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    const userId = data.user?.id

    if (!userId) {
      setMessage('회원가입은 되었지만 사용자 ID를 확인하지 못했습니다.')
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      name,
      role,
      student_no: role === 'student' ? studentNo : null,
      department: role === 'student' ? department : null,
      grade: role === 'student' && grade ? Number(grade) : null,
      manager_status: role === 'manager' ? 'pending' : null,
    })

    if (profileError) {
      setMessage(profileError.message)
      return
    }

    if (role === 'manager') {
      setMessage('매니저 회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.')
    } else {
      setMessage('회원가입이 완료되었습니다.')
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">회원가입</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">회원 유형</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="student">학생</option>
            <option value="manager">매니저</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">이메일</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">비밀번호</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">이름</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        {role === 'student' && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">학번</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={studentNo}
                onChange={(event) => setStudentNo(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">학과</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">학년</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                required
              >
                <option value="">선택</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
                <option value="4">4학년</option>
              </select>
            </div>
          </>
        )}

        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white">
          회원가입
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      )}
    </div>
  )
}
EOT

cat > src/pages/student/StudentDashboard.tsx <<'EOT'
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
EOT

cat > src/pages/manager/ManagerDashboard.tsx <<'EOT'
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
EOT

cat > src/pages/admin/AdminDashboard.tsx <<'EOT'
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
EOT

cat > src/pages/student/CompanyListPage.tsx <<'EOT'
export default function CompanyListPage() {
  return <h1 className="text-2xl font-bold">기업 리스트</h1>
}
EOT

cat > src/pages/student/ApplyPage.tsx <<'EOT'
export default function ApplyPage() {
  return <h1 className="text-2xl font-bold">인턴십 지원</h1>
}
EOT

cat > src/pages/student/MyApplicationsPage.tsx <<'EOT'
export default function MyApplicationsPage() {
  return <h1 className="text-2xl font-bold">내 지원 현황</h1>
}
EOT

cat > src/pages/manager/CompanyManagePage.tsx <<'EOT'
export default function CompanyManagePage() {
  return <h1 className="text-2xl font-bold">기업 현황 관리</h1>
}
EOT

cat > src/pages/manager/ApplicationManagePage.tsx <<'EOT'
export default function ApplicationManagePage() {
  return <h1 className="text-2xl font-bold">지원 현황 관리</h1>
}
EOT

cat > src/pages/admin/UserManagePage.tsx <<'EOT'
export default function UserManagePage() {
  return <h1 className="text-2xl font-bold">사용자 관리</h1>
}
EOT

cat > src/pages/admin/SessionManagePage.tsx <<'EOT'
export default function SessionManagePage() {
  return <h1 className="text-2xl font-bold">세션 관리</h1>
}
EOT

cat > src/pages/admin/CodeManagePage.tsx <<'EOT'
export default function CodeManagePage() {
  return <h1 className="text-2xl font-bold">코드 관리</h1>
}
EOT

cat > src/pages/admin/MatchingManagePage.tsx <<'EOT'
export default function MatchingManagePage() {
  return <h1 className="text-2xl font-bold">기업-학생 매칭 관리</h1>
}
EOT

echo "12번~14번 페이지 파일 생성 완료"
