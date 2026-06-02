import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { formatSessionLabel } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Application, Recruitment, RecruitmentStatus } from '../../types/app'

const recruitmentStatuses: RecruitmentStatus[] = ['open', 'reviewing', 'closed']
const recruitmentStatusLabel: Record<RecruitmentStatus, string> = {
  open: '접수중',
  reviewing: '심사중',
  closed: '마감',
}
export default function RecruitmentStatusPage() {
  const [items, setItems] = useState<Recruitment[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [recruitmentResult, applicationResult] = await Promise.all([
      supabase.from('internship_recruitments').select('*,companies(*),internship_sessions(*),job_codes(*)').order('created_at', { ascending: false }),
      supabase.from('applications').select('*,profiles(*)').order('submitted_at', { ascending: false }),
    ])
    setItems((recruitmentResult.data as Recruitment[] | null) ?? [])
    setApplications((applicationResult.data as Application[] | null) ?? [])
    setMessage(recruitmentResult.error?.message ?? applicationResult.error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const toggleVisibility = async (item: Recruitment) => {
    const { error } = await supabase
      .from('internship_recruitments')
      .update({ is_visible_to_students: !item.is_visible_to_students })
      .eq('id', item.id)
    if (error) return setMessage(error.message)
    await load()
  }

  const updateRecruitmentStatus = async (item: Recruitment, status: RecruitmentStatus) => {
    if (status === 'closed' && !window.confirm('모집을 마감하면 선발되지 않은 지원자는 반려 상태로 변경됩니다. 계속하시겠습니까?')) return

    const { error } = await supabase
      .from('internship_recruitments')
      .update({ status })
      .eq('id', item.id)
    if (error) return setMessage(error.message)

    if (status === 'reviewing') {
      const { error: applicationError } = await supabase
        .from('applications')
        .update({ status: 'reviewing', updated_at: new Date().toISOString() })
        .eq('status', 'submitted')
        .or(`first_recruitment_id.eq.${item.id},second_recruitment_id.eq.${item.id}`)
      if (applicationError) return setMessage(applicationError.message)
    }

    if (status === 'closed') {
      const { error: applicationError } = await supabase
        .from('applications')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .not('status', 'in', '("selected","canceled")')
        .or(`first_recruitment_id.eq.${item.id},second_recruitment_id.eq.${item.id}`)
      if (applicationError) return setMessage(applicationError.message)
    }

    await load()
    setMessage(`${item.companies?.company_name ?? '모집'} 상태를 ${recruitmentStatusLabel[status]}(으)로 변경했습니다.`)
  }

  const getApplicantCount = (recruitmentId: string) => applications.filter((application) => {
    if (application.status === 'canceled') return false
    return application.first_recruitment_id === recruitmentId || application.second_recruitment_id === recruitmentId
  }).length

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">기업별 모집현황</h1>
      <p className="text-sm text-slate-600">기업별 모집 공고의 접수 상태와 학생 모집 공개 여부를 관리합니다. 지원자 상세와 선발 결과는 지원현황 및 결과 메뉴에서 관리합니다.</p>
      {loading ? <Loading /> : items.length === 0 ? <Empty>등록된 모집 직무가 없습니다.</Empty> : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr><th className="p-3">기업명</th><th className="p-3">인턴십 세션</th><th className="p-3">모집 직무</th><th className="p-3">인원</th><th className="p-3">상태 관리</th><th className="p-3">채용 연계</th><th className="p-3">지원자 수</th><th className="p-3">학생 모집 공개</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.companies?.company_name}</td>
                  <td className="p-3">{formatSessionLabel(item.internship_sessions)}</td>
                  <td className="p-3">{item.title}<span className="ml-1 text-xs text-slate-500">({item.job_codes?.name ?? '미지정'})</span></td>
                  <td className="p-3">{item.recruit_count}명</td>
                  <td className="p-3">
                    <select className="rounded-lg border px-3 py-2 text-sm" value={item.status} onChange={(event) => void updateRecruitmentStatus(item, event.target.value as RecruitmentStatus)}>
                      {recruitmentStatuses.map((status) => <option key={status} value={status}>{recruitmentStatusLabel[status]}</option>)}
                    </select>
                  </td>
                  <td className="p-3">{item.employment_linked ? '예' : '아니오'}</td>
                  <td className="p-3 font-semibold">{getApplicantCount(item.id)}명</td>
                  <td className="p-3"><label className="flex cursor-pointer items-center gap-2 font-medium"><input type="checkbox" checked={item.is_visible_to_students} onChange={() => void toggleVisibility(item)} />{item.is_visible_to_students ? '공개' : '비공개'}</label></td>
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
