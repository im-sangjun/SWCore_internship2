import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../app/auth'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { Application, InternshipSession, Recruitment } from '../../types/app'

const statusLabel = {
  submitted: '지원 완료',
  reviewing: '검토 중',
  selected: '선발',
  rejected: '미선발',
  canceled: '지원 포기',
}

export default function ApplyPage() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<InternshipSession[]>([])
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [sessionId, setSessionId] = useState('')
  const [firstId, setFirstId] = useState('')
  const [secondId, setSecondId] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const available = useMemo(() => recruitments.filter((item) => item.session_id === sessionId), [recruitments, sessionId])
  const currentApplication = useMemo(() => applications.find((item) => item.session_id === sessionId), [applications, sessionId])

  useEffect(() => {
    const load = async () => {
      const [{ data: sessionData, error: sessionError }, { data: recruitmentData, error: recruitmentError }, { data: applicationData, error: applicationError }] = await Promise.all([
        supabase.from('internship_sessions').select('*').eq('status', 'open').order('year', { ascending: false }).order('application_start'),
        supabase.from('internship_recruitments').select('*,companies(*),job_codes(*)').eq('status', 'open').eq('is_visible_to_students', true),
        supabase.from('applications').select('*'),
      ])
      const nextSessions = (sessionData as InternshipSession[] | null) ?? []
      const nextApplications = (applicationData as Application[] | null) ?? []
      const firstSessionId = nextSessions[0]?.id ?? ''
      setSessions(nextSessions)
      setRecruitments((recruitmentData as Recruitment[] | null) ?? [])
      setApplications(nextApplications)
      setSessionId(firstSessionId)
      const firstApplication = nextApplications.find((item) => item.session_id === firstSessionId)
      setFirstId(firstApplication?.first_recruitment_id ?? '')
      setSecondId('')
      setMemo(firstApplication?.memo ?? '')
      setMessage(sessionError?.message ?? recruitmentError?.message ?? applicationError?.message ?? '')
      setLoading(false)
    }
    void load()
  }, [])

  const chooseSession = (nextSessionId: string) => {
    const nextApplication = applications.find((item) => item.session_id === nextSessionId)
    setSessionId(nextSessionId)
    setFirstId(nextApplication?.first_recruitment_id ?? '')
    setSecondId('')
    setMemo(nextApplication?.memo ?? '')
  }

  const chooseRecruitment = (priority: 'first' | 'second', recruitmentId: string) => {
    if (priority === 'first') {
      setFirstId(recruitmentId)
      if (secondId === recruitmentId) setSecondId('')
      return
    }
    if (firstId === recruitmentId) {
      setMessage('2순위는 1순위와 다른 기업을 선택해주세요.')
      return
    }
    setSecondId(recruitmentId)
    setMessage('')
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!firstId) return setMessage('1순위 기업을 선택해주세요. 2순위는 선택 사항입니다.')
    if (secondId && firstId === secondId) return setMessage('1순위와 2순위는 서로 다른 모집 직무를 선택해주세요.')
    const { data, error } = await supabase
      .from('applications')
      .upsert({ session_id: sessionId, student_id: profile?.id, first_recruitment_id: firstId, second_recruitment_id: secondId || null, memo, status: 'submitted', updated_at: new Date().toISOString() }, { onConflict: 'session_id,student_id' })
      .select('*')
      .single<Application>()
    if (error) return setMessage(error.message)
    setApplications((prev) => {
      return currentApplication ? prev.map((item) => item.id === currentApplication.id ? data : item) : [...prev, data]
    })
    setMessage('지원서를 제출했습니다.')
  }

  if (loading) return <Loading />
  if (sessions.length === 0) return <Empty>현재 지원 가능한 인턴십 세션이 없습니다.</Empty>

  return (
      <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold">인턴십 지원</h1>
      <p className="mb-5 text-sm text-slate-600">1순위는 필수, 2순위는 선택 사항입니다. 모바일에서도 쉽게 선택할 수 있도록 카드로 구성했습니다.</p>
      {currentApplication && (
        <div className={`mb-5 rounded-xl border p-4 text-sm ${currentApplication.status === 'canceled' ? 'border-red-200 bg-red-50 text-red-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
          현재 상태: {statusLabel[currentApplication.status]}
        </div>
      )}
      <form onSubmit={submit} className="space-y-5">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-bold">인턴십 세션</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {sessions.map((item) => (
              <button key={item.id} type="button" className={`rounded-xl border p-4 text-left ${sessionId === item.id ? 'border-blue-500 bg-blue-50 text-blue-900' : 'bg-white'}`} onClick={() => chooseSession(item.id)}>
                <span className="block text-sm font-semibold">{item.year}년 {item.term}</span>
                <span className="mt-1 block text-xs text-slate-600">{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {(['first', 'second'] as const).map((priority) => {
            const selectedId = priority === 'first' ? firstId : secondId
            return (
              <div key={priority} className="rounded-xl bg-white p-4 shadow-sm">
                <h2 className="mb-3 font-bold">{priority === 'first' ? '1순위 선택' : '2순위 선택 사항'}</h2>
                {priority === 'second' && (
                  <button
                    type="button"
                    className={`mb-3 w-full rounded-xl border p-4 text-left ${!secondId ? 'border-blue-500 bg-blue-50 text-blue-900' : 'bg-white text-slate-600'}`}
                    onClick={() => setSecondId('')}
                  >
                    <span className="block font-semibold">선택 안 함</span>
                    <span className="mt-2 block text-xs text-slate-500">2순위는 비워둘 수 있습니다.</span>
                  </button>
                )}
                <div className="space-y-3">
                  {available.length === 0 ? <p className="text-sm text-slate-500">선택한 세션의 공개 모집 기업이 없습니다.</p> : available.map((item) => (
                    <button key={item.id} type="button" disabled={priority === 'second' && firstId === item.id} className={`w-full rounded-xl border p-4 text-left disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${selectedId === item.id ? 'border-slate-900 bg-slate-900 text-white' : 'bg-white'}`} onClick={() => chooseRecruitment(priority, item.id)}>
                      <span className="block font-semibold">{item.companies?.company_name} · {item.title}</span>
                      <span className={`mt-2 block text-xs ${selectedId === item.id ? 'text-slate-200' : 'text-slate-500'}`}>{item.job_codes?.name ?? '직무 미지정'} / {item.recruit_count}명 모집 {item.employment_linked && '/ 채용 연계'}{priority === 'second' && firstId === item.id && ' / 1순위 선택됨'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium">메모</label>
          <textarea className="mt-2 min-h-24 w-full rounded-lg border px-3 py-2" value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="선택 입력" />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white sm:w-auto">{currentApplication?.status === 'canceled' ? '다시 지원하기' : '지원서 제출'}</button>
          </div>
        </section>
      </form>
      {message && <Message>{message}</Message>}
    </div>
  )
}
