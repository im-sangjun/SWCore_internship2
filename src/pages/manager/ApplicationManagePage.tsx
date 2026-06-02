import { useEffect, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { formatSessionLabel } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Application, ApplicationStatus, InternshipTerm, Recruitment } from '../../types/app'

const selectableStatuses: ApplicationStatus[] = ['submitted', 'reviewing', 'selected', 'rejected']
const statusLabel: Record<ApplicationStatus, string> = {
  submitted: '지원 완료',
  reviewing: '심사중',
  selected: '선발',
  rejected: '반려',
  canceled: '지원 포기',
}
const statusSortOrder: Record<ApplicationStatus, number> = {
  selected: 0,
  reviewing: 1,
  submitted: 2,
  rejected: 3,
  canceled: 4,
}
const blockedTermGroups: InternshipTerm[][] = [
  ['하계', '하계_2학기'],
  ['동계', '동계_1학기'],
]

function getBlockedGroup(term?: InternshipTerm | null) {
  return blockedTermGroups.find((group) => term && group.includes(term))
}

interface RecruitmentApplicant {
  application: Application
  priority: '1순위' | '2순위'
}

export default function ApplicationManagePage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [groupMessages, setGroupMessages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [recruitmentResult, applicationResult] = await Promise.all([
      supabase.from('internship_recruitments').select('*,companies(*),internship_sessions(*),job_codes(*)').order('created_at', { ascending: false }),
      supabase.from('applications').select('*,profiles(*),internship_sessions(*),first_recruitment:internship_recruitments!applications_first_recruitment_id_fkey(*,companies(*)),second_recruitment:internship_recruitments!applications_second_recruitment_id_fkey(*,companies(*))').order('submitted_at', { ascending: false }),
    ])
    setRecruitments((recruitmentResult.data as Recruitment[] | null) ?? [])
    setApplications((applicationResult.data as Application[] | null) ?? [])
    setMessage(recruitmentResult.error?.message ?? applicationResult.error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const getApplicants = (recruitmentId: string) => applications.flatMap((application): RecruitmentApplicant[] => {
    if (application.status === 'canceled') return []
    const applicants: RecruitmentApplicant[] = []
    if (application.first_recruitment_id === recruitmentId) applicants.push({ application, priority: '1순위' })
    if (application.second_recruitment_id === recruitmentId) applicants.push({ application, priority: '2순위' })
    return applicants
  })

  const getSortedApplicants = (recruitmentId: string) => getApplicants(recruitmentId).sort((left, right) => {
    const statusGap = statusSortOrder[left.application.status] - statusSortOrder[right.application.status]
    if (statusGap !== 0) return statusGap
    if (left.priority !== right.priority) return left.priority === '1순위' ? -1 : 1
    return (left.application.profiles?.name ?? '').localeCompare(right.application.profiles?.name ?? '')
  })

  const updateStatus = async (application: Application, status: ApplicationStatus, recruitmentId: string) => {
    if (status === 'selected') {
      const blockedGroup = getBlockedGroup(application.internship_sessions?.term)
      const blockedApplication = blockedGroup
        ? applications.find((item) =>
          item.id !== application.id
          && item.student_id === application.student_id
          && item.status === 'selected'
          && Boolean(item.internship_sessions?.term && blockedGroup.includes(item.internship_sessions.term))
        )
        : null

      if (blockedApplication) {
        const companyName = blockedApplication.first_recruitment?.companies?.company_name ?? blockedApplication.second_recruitment?.companies?.company_name ?? '다른 기업'
        setGroupMessages((prev) => ({ ...prev, [recruitmentId]: `${blockedGroup?.join(', ')} 세션 묶음에서는 학생 1명당 1개 기업만 선발 저장할 수 있습니다. 이미 ${companyName}에 선발된 학생입니다.` }))
        return
      }
    }

    const { error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', application.id)
    if (error) {
      setGroupMessages((prev) => ({ ...prev, [recruitmentId]: error.message }))
      return
    }
    setApplications((prev) => prev.map((item) => item.id === application.id ? { ...item, status } : item))
    setGroupMessages((prev) => ({ ...prev, [recruitmentId]: `${application.profiles?.name ?? '학생'} 상태를 ${statusLabel[status]}(으)로 저장했습니다.` }))
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">지원현황 및 결과</h1>
      <p className="text-sm text-slate-600">기업체별 지원 학생 리스트를 확인하고 선발 여부 상태를 저장합니다.</p>
      {loading ? <Loading /> : recruitments.length === 0 ? <Empty>등록된 모집 직무가 없습니다.</Empty> : recruitments.map((recruitment) => {
        const applicants = getSortedApplicants(recruitment.id)
        const groupMessage = groupMessages[recruitment.id]
        return (
          <section key={recruitment.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{recruitment.companies?.company_name ?? '기업명 없음'} · {recruitment.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{formatSessionLabel(recruitment.internship_sessions)} / {recruitment.job_codes?.name ?? '직무 미지정'} / 모집 {recruitment.recruit_count}명</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">지원 {applicants.length}명</span>
            </div>
            {groupMessage && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{groupMessage}</div>}

            {applicants.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">지원 학생이 없습니다.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr><th className="p-3">순위</th><th className="p-3">이름</th><th className="p-3">학번</th><th className="p-3">학과</th><th className="p-3">이메일</th><th className="p-3">연락처</th><th className="p-3">현재 상태</th><th className="p-3">선발 여부 저장</th></tr>
                  </thead>
                  <tbody>
                    {applicants.map(({ application, priority }) => (
                      <tr key={`${recruitment.id}-${application.id}-${priority}`} className={`border-b ${application.status === 'selected' ? 'bg-emerald-50' : ''}`}>
                        <td className="p-3">{priority}</td>
                        <td className="p-3 font-medium">{application.profiles?.name || '-'}</td>
                        <td className="p-3">{application.profiles?.student_no || '-'}</td>
                        <td className="p-3">{application.profiles?.department || '-'}</td>
                        <td className="p-3">{application.profiles?.email || '-'}</td>
                        <td className="p-3">{application.profiles?.phone || '-'}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${application.status === 'selected' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                            {statusLabel[application.status]}
                          </span>
                        </td>
                        <td className="p-3">
                          <select className={`rounded-lg border px-3 py-2 ${application.status === 'selected' ? 'border-emerald-300 bg-emerald-100 font-semibold text-emerald-800' : ''}`} value={application.status} onChange={(event) => void updateStatus(application, event.target.value as ApplicationStatus, recruitment.id)}>
                            {selectableStatuses.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}
      {message && <Message>{message}</Message>}
    </div>
  )
}
