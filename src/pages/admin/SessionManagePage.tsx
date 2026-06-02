import { useEffect, useMemo, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { InternshipSession, InternshipTerm, SessionStatus } from '../../types/app'

const statuses: SessionStatus[] = ['draft', 'open', 'closed', 'matching', 'completed']
const terms: InternshipTerm[] = ['1학기', '하계', '하계_2학기', '2학기', '동계', '동계_1학기']
const termOrder: Record<InternshipTerm, number> = {
  '1학기': 1,
  하계: 2,
  '하계_2학기': 3,
  '2학기': 4,
  동계: 5,
  '동계_1학기': 6,
}
const statusLabel: Record<SessionStatus, string> = {
  draft: '준비',
  open: '접수 가능',
  closed: '접수 마감',
  matching: '매칭 중',
  completed: '완료',
}

export default function SessionManagePage() {
  const [items, setItems] = useState<InternshipSession[]>([])
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [term, setTerm] = useState<InternshipTerm>('1학기')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.year - a.year || termOrder[b.term] - termOrder[a.term]),
    [items],
  )

  const load = async () => {
    const { data, error } = await supabase.from('internship_sessions').select('*').order('year', { ascending: false })
    setItems(data ?? [])
    setMessage(error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const add = async (event: React.FormEvent) => {
    event.preventDefault()
    const sessionName = name.trim() || `${year}년 ${term} SWCore 인턴십`
    const { error } = await supabase.from('internship_sessions').insert({
      year: Number(year),
      term,
      name: sessionName,
      status: 'draft',
    })
    if (error) return setMessage(error.message)
    setName('')
    await load()
    setMessage('인턴십 세션을 등록했습니다.')
  }

  const update = async (item: InternshipSession, patch: Partial<InternshipSession>) => {
    const { error } = await supabase.from('internship_sessions').update(patch).eq('id', item.id)
    if (error) return setMessage(error.message)
    await load()
    setMessage('세션 설정을 저장했습니다.')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">인턴십 세션 관리</h1>
      <form onSubmit={add} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-4">
        <h2 className="font-bold md:col-span-4">세션 등록</h2>
        <input type="number" className="rounded-lg border px-3 py-2" value={year} onChange={(event) => setYear(event.target.value)} required />
        <select className="rounded-lg border px-3 py-2" value={term} onChange={(event) => setTerm(event.target.value as InternshipTerm)}>{terms.map((item) => <option key={item}>{item}</option>)}</select>
        <input className="rounded-lg border px-3 py-2" placeholder="세션명 미입력 시 자동 생성" value={name} onChange={(event) => setName(event.target.value)} />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white">세션 등록</button>
      </form>
      {loading ? <Loading /> : sortedItems.length === 0 ? <Empty>세션이 없습니다.</Empty> : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3">년도</th>
                <th className="p-3">세션</th>
                <th className="p-3">세션명</th>
                <th className="p-3">상태</th>
                <th className="p-3">접수 시작</th>
                <th className="p-3">접수 종료</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id} className={item.status === 'open' ? 'border-b bg-emerald-50' : 'border-b'}>
                  <td className="p-3 font-semibold">{item.year}</td>
                  <td className="p-3">{item.term}</td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">
                    <select className={`rounded-lg border px-3 py-2 ${item.status === 'open' ? 'border-emerald-300 bg-emerald-100 font-semibold text-emerald-800' : ''}`} value={item.status} onChange={(event) => void update(item, { status: event.target.value as SessionStatus })}>
                      {statuses.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
                    </select>
                  </td>
                  <td className="p-3"><input type="date" className="rounded-lg border px-3 py-2" value={item.application_start ?? ''} onChange={(event) => void update(item, { application_start: event.target.value || null })} /></td>
                  <td className="p-3"><input type="date" className="rounded-lg border px-3 py-2" value={item.application_end ?? ''} onChange={(event) => void update(item, { application_end: event.target.value || null })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {message && <Message>{message}</Message>}
    </div>
  )
}
