import { useEffect, useState } from 'react'
import { useAuth } from '../../app/auth'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'

interface Notice {
  id: string
  title: string
  content: string
  target_role: string
  created_at: string
}

export default function NoticePage() {
  const { profile } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetRole, setTargetRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('id,title,content,target_role,created_at')
      .order('created_at', { ascending: false })
    setNotices(data ?? [])
    setMessage(error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(loadNotices)
  }, [])

  const addNotice = async (event: React.FormEvent) => {
    event.preventDefault()
    const { error } = await supabase.from('notices').insert({
      title,
      content,
      target_role: targetRole,
      created_by: profile?.id,
    })
    if (error) return setMessage(error.message)
    setTitle('')
    setContent('')
    setMessage('공지를 등록했습니다.')
    await loadNotices()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">공지사항</h1>
      {profile?.role === 'admin' && (
        <form onSubmit={addNotice} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">공지 등록</h2>
          <input className="w-full rounded-lg border px-3 py-2" placeholder="제목" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <textarea className="w-full rounded-lg border px-3 py-2" placeholder="공지 내용" value={content} onChange={(event) => setContent(event.target.value)} required />
          <select className="rounded-lg border px-3 py-2" value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
            <option value="all">전체</option>
            <option value="student">학생</option>
            <option value="manager">매니저</option>
            <option value="admin">관리자</option>
          </select>
          <button className="ml-2 rounded-lg bg-slate-900 px-4 py-2 text-white">등록</button>
        </form>
      )}
      {loading ? <Loading /> : notices.length === 0 ? <Empty>등록된 공지가 없습니다.</Empty> : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <article key={notice.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex justify-between gap-3">
                <h2 className="font-bold">{notice.title}</h2>
                <span className="text-xs text-slate-500">{notice.target_role === 'all' ? '전체' : notice.target_role}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{notice.content}</p>
              <p className="mt-3 text-xs text-slate-400">{new Date(notice.created_at).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      )}
      {message && <Message>{message}</Message>}
    </div>
  )
}
