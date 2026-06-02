import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { ManagerStatus, Profile } from '../../types/app'

export default function UserManagePage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const load = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('email')
    setUsers(data ?? [])
    setMessage(error?.message ?? '')
    setLoading(false)
  }
  useEffect(() => { void Promise.resolve().then(load) }, [])
  const setManagerStatus = async (id: string, manager_status: ManagerStatus) => {
    const { error } = await supabase.rpc('set_manager_status', { target_id: id, next_status: manager_status })
    if (error) return setMessage(error.message)
    await load()
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">사용자 관리</h1>
      {loading ? <Loading /> : users.length === 0 ? <Empty>등록된 사용자가 없습니다.</Empty> : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr><th className="p-3">이름</th><th className="p-3">이메일</th><th className="p-3">권한</th><th className="p-3">학생 정보</th><th className="p-3">승인</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b"><td className="p-3">{user.name}</td><td className="p-3">{user.email}</td><td className="p-3">{user.role}</td><td className="p-3">{user.student_no && `${user.student_no} / ${user.department} / ${user.grade}학년`}</td><td className="p-3">{user.role === 'manager' && <div className="flex gap-2"><span>{user.manager_status}</span><button className="text-blue-700" onClick={() => void setManagerStatus(user.id, 'approved')}>승인</button><button className="text-red-700" onClick={() => void setManagerStatus(user.id, 'rejected')}>거절</button></div>}</td></tr>)}</tbody></table></div>
      )}
      {message && <Message>{message}</Message>}
    </div>
  )
}
