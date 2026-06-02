import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { formatSessionLabel } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Application, Matching } from '../../types/app'

const currentStatusLabel = { submitted: '지원 완료', reviewing: '심사중', selected: '선발', rejected: '반려', canceled: '지원 포기' }

export default function MyApplicationsPage() {
  const [items, setItems] = useState<Application[]>([])
  const [matchings, setMatchings] = useState<Matching[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [applicationResult, matchingResult] = await Promise.all([
      supabase.from('applications').select('*,internship_sessions(*),first_recruitment:internship_recruitments!applications_first_recruitment_id_fkey(*,companies(*)),second_recruitment:internship_recruitments!applications_second_recruitment_id_fkey(*,companies(*))').order('submitted_at', { ascending: false }),
      supabase.from('matchings').select('*,companies(*),internship_recruitments(*,companies(*))'),
    ])
    setItems((applicationResult.data as Application[] | null) ?? [])
    setMatchings((matchingResult.data as Matching[] | null) ?? [])
    setMessage(applicationResult.error?.message ?? matchingResult.error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const cancelApplication = async (item: Application) => {
    if (!window.confirm('정말 지원을 포기하시겠습니까? 지원 포기 후에도 인턴십 지원 화면에서 다시 지원할 수 있습니다.')) return
    const { error } = await supabase
      .from('applications')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) return setMessage(error.message)
    setItems((prev) => prev.map((prevItem) => prevItem.id === item.id ? { ...prevItem, status: 'canceled' } : prevItem))
    setMessage('지원 포기를 처리했습니다.')
  }

  const getMatching = (item: Application) => matchings.find((matching) => matching.session_id === item.session_id)
  const getMatchingCompanyName = (matching?: Matching) => matching?.companies?.company_name ?? matching?.internship_recruitments?.companies?.company_name
  const getCurrentStatus = (item: Application) => {
    if (item.status === 'canceled') return { label: '지원 포기', tone: 'red' as const }
    if (item.status === 'selected') return { label: '선발', tone: 'emerald' as const }
    if (item.status === 'rejected') return { label: '반려', tone: 'red' as const }
    return { label: currentStatusLabel[item.status], tone: item.status === 'reviewing' ? 'blue' as const : 'slate' as const }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">내 지원 현황</h1>
      {loading ? <Loading /> : items.length === 0 ? <Empty>제출한 지원서가 없습니다.</Empty> : items.map((item) => {
        const matching = getMatching(item)
        const matchingCompanyName = getMatchingCompanyName(matching)
        const currentStatus = getCurrentStatus(item)
        return (
          <article key={item.id} className="relative rounded-xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-bold">{formatSessionLabel(item.internship_sessions)}</h2>
                <p className="mt-1 text-sm text-slate-600">매칭 기업: {matchingCompanyName ?? '아직 매칭되지 않음'}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              현재 상태: <span className="font-bold">{currentStatus.label}</span>
            </div>
            <p className="mt-4 text-sm">1순위: {item.first_recruitment ? `${item.first_recruitment.companies?.company_name} · ${item.first_recruitment.title}` : '모집 정보 없음'}</p>
            <p className="mt-1 text-sm">2순위: {item.second_recruitment ? `${item.second_recruitment.companies?.company_name} · ${item.second_recruitment.title}` : '선택 안 함'}</p>
            {item.status !== 'canceled' && (
              <div className="absolute right-4 top-4">
                <button type="button" className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700" onClick={() => void cancelApplication(item)}>
                  지원 포기
                </button>
              </div>
            )}
          </article>
        )
      })}
      {message && <Message>{message}</Message>}
    </div>
  )
}
