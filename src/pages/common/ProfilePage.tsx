import { useState } from 'react'
import { useAuth } from '../../app/auth'
import { Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [studentNo, setStudentNo] = useState(profile?.student_no ?? '')
  const [department, setDepartment] = useState(profile?.department ?? '')
  const [grade, setGrade] = useState(profile?.grade?.toString() ?? '')
  const [desiredJob, setDesiredJob] = useState(profile?.desired_job ?? '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile) return
    const { error } = await supabase.from('profiles').update({
      name,
      phone,
      student_no: profile.role === 'student' ? studentNo : null,
      department: profile.role === 'student' ? department : null,
      grade: profile.role === 'student' && grade ? Number(grade) : null,
      desired_job: profile.role === 'student' ? desiredJob : null,
    }).eq('id', profile.id)
    if (error) return setMessage(error.message)
    if (password) {
      const { error: passwordError } = await supabase.auth.updateUser({ password })
      if (passwordError) return setMessage(passwordError.message)
      setPassword('')
    }
    await refreshProfile()
    setMessage('개인정보를 수정했습니다.')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 text-2xl font-bold">개인정보 수정</h1>
      <form onSubmit={save} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <label className="block text-sm">이메일<input className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2" value={profile?.email ?? ''} disabled /></label>
        <label className="block text-sm">이름<input className="mt-1 w-full rounded-lg border px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="block text-sm">연락처<input className="mt-1 w-full rounded-lg border px-3 py-2" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="010-0000-0000" /></label>
        {profile?.role === 'student' && <>
          <label className="block text-sm">학번<input className="mt-1 w-full rounded-lg border px-3 py-2" value={studentNo} onChange={(event) => setStudentNo(event.target.value)} required /></label>
          <label className="block text-sm">학과<input className="mt-1 w-full rounded-lg border px-3 py-2" value={department} onChange={(event) => setDepartment(event.target.value)} required /></label>
          <label className="block text-sm">학년<select className="mt-1 w-full rounded-lg border px-3 py-2" value={grade} onChange={(event) => setGrade(event.target.value)} required><option value="">선택</option>{[1, 2, 3, 4].map((item) => <option key={item} value={item}>{item}학년</option>)}</select></label>
          <label className="block text-sm">희망 직무<input className="mt-1 w-full rounded-lg border px-3 py-2" value={desiredJob} onChange={(event) => setDesiredJob(event.target.value)} placeholder="인턴십 참여 시 추가 입력" /></label>
        </>}
        <label className="block text-sm">새 비밀번호<input type="password" className="mt-1 w-full rounded-lg border px-3 py-2" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="변경할 때만 입력" /></label>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white">저장</button>
      </form>
      {message && <Message>{message}</Message>}
    </div>
  )
}
