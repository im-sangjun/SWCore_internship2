import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export default function NotificationPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadItems = async () => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
    setMessage(error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(loadItems)
  }, [])

  const read = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    if (error) return setMessage(error.message)
    await loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">알림</h1>
      {loading ? <Loading /> : items.length === 0 ? <Empty>도착한 알림이 없습니다.</Empty> : items.map((item) => (
        <article key={item.id} className={`rounded-xl border p-5 ${item.is_read ? 'bg-white' : 'border-blue-200 bg-blue-50'}`}>
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-bold">{item.title}</h2><p className="mt-2 text-sm text-slate-600">{item.message}</p></div>
            {!item.is_read && <button type="button" className="text-sm text-blue-700" onClick={() => void read(item.id)}>읽음 처리</button>}
          </div>
        </article>
      ))}
      {message && <Message>{message}</Message>}
    </div>
  )
}
