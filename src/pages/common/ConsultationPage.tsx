import { useEffect, useState } from 'react'
import { useAuth } from '../../app/auth'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'

interface Consultation {
  id: string
  title: string
  content: string
  status: string
  answer: string | null
  created_at: string
  profiles?: { name: string | null; email: string } | null
}

export default function ConsultationPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<Consultation[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadItems = async () => {
    const { data, error } = await supabase.from('consultations').select('id,title,content,status,answer,created_at,profiles!consultations_student_id_fkey(name,email)').order('created_at', { ascending: false })
    setItems((data as Consultation[] | null) ?? [])
    setMessage(error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(loadItems)
  }, [])

  const request = async (event: React.FormEvent) => {
    event.preventDefault()
    const { error } = await supabase.from('consultations').insert({ student_id: profile?.id, title, content })
    if (error) return setMessage(error.message)
    setTitle('')
    setContent('')
    setMessage('상담을 신청했습니다.')
    await loadItems()
  }

  const answer = async (id: string) => {
    const value = answers[id]?.trim()
    if (!value) return
    const { error } = await supabase.from('consultations').update({ answer: value, status: 'answered', answered_by: profile?.id, answered_at: new Date().toISOString() }).eq('id', id)
    if (error) return setMessage(error.message)
    setMessage('답변을 등록했습니다.')
    await loadItems()
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">상담 {profile?.role === 'student' ? '신청' : '관리'}</h1>
      {profile?.role === 'student' && (
        <form onSubmit={request} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <input className="w-full rounded-lg border px-3 py-2" placeholder="상담 제목" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <textarea className="w-full rounded-lg border px-3 py-2" placeholder="상담 내용" value={content} onChange={(event) => setContent(event.target.value)} required />
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-white">상담 신청</button>
        </form>
      )}
      {loading ? <Loading /> : items.length === 0 ? <Empty>상담 내역이 없습니다.</Empty> : items.map((item) => (
        <article key={item.id} className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex justify-between gap-3"><h2 className="font-bold">{item.title}</h2><span className="text-xs text-blue-700">{item.status}</span></div>
          {profile?.role === 'admin' && <p className="mt-1 text-xs text-slate-500">{item.profiles?.name ?? '이름 미등록'} · {item.profiles?.email}</p>}
          <p className="mt-3 whitespace-pre-wrap text-sm">{item.content}</p>
          {item.answer && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm"><b>답변</b><br />{item.answer}</p>}
          {profile?.role === 'admin' && item.status === 'requested' && <div className="mt-3 flex gap-2"><input className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" placeholder="답변" value={answers[item.id] ?? ''} onChange={(event) => setAnswers({ ...answers, [item.id]: event.target.value })} /><button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => void answer(item.id)}>답변 등록</button></div>}
        </article>
      ))}
      {message && <Message>{message}</Message>}
    </div>
  )
}
