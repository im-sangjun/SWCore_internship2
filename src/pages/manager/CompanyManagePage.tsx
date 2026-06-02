import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/auth'
import { Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { Company, InternshipSession, JobCode } from '../../types/app'

export default function CompanyManagePage() {
  const { profile } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [sessions, setSessions] = useState<InternshipSession[]>([])
  const [jobs, setJobs] = useState<JobCode[]>([])
  const [sessionId, setSessionId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [jobId, setJobId] = useState('')
  const [title, setTitle] = useState('')
  const [count, setCount] = useState('1')
  const [departments, setDepartments] = useState('')
  const [grades, setGrades] = useState('')
  const [linked, setLinked] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [companyResult, sessionResult, jobResult] = await Promise.all([
      supabase.from('companies').select('*').order('company_name'),
      supabase.from('internship_sessions').select('*').order('year', { ascending: false }),
      supabase.from('job_codes').select('*').eq('is_active', true).order('sort_order'),
    ])
    setCompanies(companyResult.data ?? [])
    setSessions(sessionResult.data ?? [])
    setJobs(jobResult.data ?? [])
    setMessage(companyResult.error?.message ?? sessionResult.error?.message ?? jobResult.error?.message ?? '')
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const addRecruitment = async (event: React.FormEvent) => {
    event.preventDefault()
    const { error } = await supabase.from('internship_recruitments').insert({
      session_id: sessionId,
      company_id: companyId,
      job_code_id: jobId || null,
      title,
      recruit_count: Number(count),
      related_departments: departments.split(',').map((item) => item.trim()).filter(Boolean),
      target_grades: grades.split(',').map(Number).filter(Boolean),
      employment_linked: linked,
      is_visible_to_students: false,
    })
    if (error) return setMessage(error.message)
    setTitle('')
    setMessage('모집 직무를 등록했습니다. 학생 공개 토글을 켜면 학생 목록에 표시됩니다.')
    await load()
  }

  const companyListPath = profile?.role === 'admin' ? '/admin/company-list' : '/manager/company-list'
  const recruitmentStatusPath = profile?.role === 'admin' ? '/admin/recruitments' : '/manager/recruitments'

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">모집 등록 관리</h1>
      <div className="flex flex-wrap gap-2">
        <Link className="inline-block rounded-lg border bg-white px-4 py-2 text-sm shadow-sm" to={companyListPath}>기업 전체 리스트 및 기본정보 등록</Link>
        <Link className="inline-block rounded-lg border bg-white px-4 py-2 text-sm shadow-sm" to={recruitmentStatusPath}>현재 모집 현황 보기</Link>
      </div>

      <form onSubmit={addRecruitment} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="font-bold md:col-span-2">세션별 모집 직무 등록</h2>
        <select className="rounded-lg border px-3 py-2" value={sessionId} onChange={(event) => setSessionId(event.target.value)} required><option value="">세션 선택</option>{sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select className="rounded-lg border px-3 py-2" value={companyId} onChange={(event) => setCompanyId(event.target.value)} required><option value="">기업 선택</option>{companies.map((item) => <option key={item.id} value={item.id}>{item.company_name}</option>)}</select>
        <select className="rounded-lg border px-3 py-2" value={jobId} onChange={(event) => setJobId(event.target.value)}><option value="">직무 선택</option>{jobs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <input className="rounded-lg border px-3 py-2" placeholder="모집 제목" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <input className="rounded-lg border px-3 py-2" type="number" min="1" placeholder="모집 인원" value={count} onChange={(event) => setCount(event.target.value)} />
        <input className="rounded-lg border px-3 py-2" placeholder="관련 학과, 쉼표 구분" value={departments} onChange={(event) => setDepartments(event.target.value)} />
        <input className="rounded-lg border px-3 py-2" placeholder="대상 학년 예: 3,4" value={grades} onChange={(event) => setGrades(event.target.value)} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={linked} onChange={(event) => setLinked(event.target.checked)} />채용 연계</label>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white md:col-span-2">모집 등록</button>
      </form>
      {message && <Message>{message}</Message>}
    </div>
  )
}
