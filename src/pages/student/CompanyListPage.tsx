import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { Recruitment } from '../../types/app'

export default function CompanyListPage() {
  const [items, setItems] = useState<Recruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('internship_recruitments').select('*,companies(*),internship_sessions(*),job_codes(*)').eq('status', 'open').eq('is_visible_to_students', true).order('created_at', { ascending: false })
      setItems((data as Recruitment[] | null) ?? [])
      setMessage(error?.message ?? '')
      setLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">인턴십 기업 리스트</h1>
      {loading ? <Loading /> : items.length === 0 ? <Empty>현재 학생에게 공개된 모집 기업이 없습니다.</Empty> : items.map((item) => (
        <article key={item.id} className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">{item.internship_sessions?.name}</p>
          <h2 className="mt-1 text-lg font-bold">{item.companies?.company_name} · {item.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{item.job_codes?.name ?? '직무 미지정'} · {item.recruit_count}명 모집 {item.employment_linked && '· 채용 연계'}</p>
          <p className="mt-2 text-sm">{item.description}</p>
          <p className="mt-3 text-xs text-slate-500">관련 학과: {item.related_departments?.join(', ') || '제한 없음'} / 대상 학년: {item.target_grades?.map((grade) => `${grade}학년`).join(', ') || '제한 없음'}</p>
        </article>
      ))}
      {message && <Message>{message}</Message>}
    </div>
  )
}
