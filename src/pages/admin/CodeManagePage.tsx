import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { JobCode } from '../../types/app'

export default function CodeManagePage() {
  const [items, setItems] = useState<JobCode[]>([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => { const { data, error } = await supabase.from('job_codes').select('*').order('sort_order'); setItems(data ?? []); setMessage(error?.message ?? ''); setLoading(false) }
  useEffect(() => { void Promise.resolve().then(load) }, [])
  const add = async (event: React.FormEvent) => { event.preventDefault(); const { error } = await supabase.from('job_codes').insert({ code, name, sort_order: items.length + 1 }); if (error) return setMessage(error.message); setCode(''); setName(''); await load() }
  const toggle = async (item: JobCode) => { const { error } = await supabase.from('job_codes').update({ is_active: !item.is_active }).eq('id', item.id); if (error) return setMessage(error.message); await load() }
  return <div className="space-y-4"><h1 className="text-2xl font-bold">직무 코드 관리</h1><form onSubmit={add} className="flex flex-wrap gap-2 rounded-xl bg-white p-5 shadow-sm"><input className="rounded-lg border px-3 py-2" placeholder="코드 (예: QA)" value={code} onChange={(event) => setCode(event.target.value)} required /><input className="rounded-lg border px-3 py-2" placeholder="직무명" value={name} onChange={(event) => setName(event.target.value)} required /><button className="rounded-lg bg-slate-900 px-4 py-2 text-white">추가</button></form>{loading ? <Loading /> : items.length === 0 ? <Empty>직무 코드가 없습니다.</Empty> : items.map((item) => <article key={item.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"><div><b>{item.name}</b><span className="ml-2 text-xs text-slate-500">{item.code}</span></div><button type="button" className="text-sm text-blue-700" onClick={() => void toggle(item)}>{item.is_active ? '사용 중' : '사용 안 함'}</button></article>)}{message && <Message>{message}</Message>}</div>
}
