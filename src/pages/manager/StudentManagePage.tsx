import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/app'

export default function StudentManagePage() {
  const [items, setItems] = useState<Profile[]>([]); const [loading, setLoading] = useState(true); const [message, setMessage] = useState('')
  useEffect(() => { const load = async () => { const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student').order('student_no'); setItems(data ?? []); setMessage(error?.message ?? ''); setLoading(false) }; void load() }, [])
  return <div className="space-y-4"><h1 className="text-2xl font-bold">참여 학생 관리</h1>{loading ? <Loading /> : items.length === 0 ? <Empty>등록된 학생이 없습니다.</Empty> : items.map((item) => <article key={item.id} className="rounded-xl bg-white p-4 shadow-sm"><b>{item.name}</b><p className="mt-1 text-sm text-slate-600">{item.student_no} / {item.department} / {item.grade}학년 / 희망 직무: {item.desired_job || '미등록'}</p></article>)}{message && <Message>{message}</Message>}</div>
}
