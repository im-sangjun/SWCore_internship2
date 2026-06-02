import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getDashboardPath, useAuth } from '../../app/auth'
import { supabase } from '../../lib/supabase'
import type { UserRole } from '../../types/app'

export default function RegisterPage() {
  const { session, profile, loading } = useAuth()
  const [role, setRole] = useState<UserRole>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [studentNo, setStudentNo] = useState('')
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
          student_no: role === 'student' ? studentNo : null,
          department: role === 'student' ? department : null,
          grade: role === 'student' && grade ? Number(grade) : null,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      return
    }

    if (role === 'manager') {
      setMessage('매니저 회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.')
    } else {
      setMessage('회원가입이 완료되었습니다. 이메일 확인이 필요한 경우 메일함을 확인해주세요.')
    }
  }

  if (!loading && session) {
    return <Navigate to={getDashboardPath(profile?.role)} replace />
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">회원가입</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">회원 유형</label>
          <div className="grid grid-cols-2 rounded-xl border bg-slate-50 p-1">
            {(['student', 'manager'] as UserRole[]).map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${role === item ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'}`}
                onClick={() => setRole(item)}
              >
                {item === 'student' ? '학생' : '매니저'}
              </button>
            ))}
          </div>
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

        <div>
          <label className="mb-1 block text-sm font-medium">연락처</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="010-0000-0000"
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
