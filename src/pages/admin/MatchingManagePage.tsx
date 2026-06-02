import { useEffect, useState } from 'react'
import { useAuth } from '../../app/auth'
import { Empty, Loading, Message } from '../../components/PageState'
import { formatSessionLabel } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Application, InternshipTerm, Matching } from '../../types/app'

const blockedTermGroups: InternshipTerm[][] = [
  ['하계', '하계_2학기'],
  ['동계', '동계_1학기'],
]

function getBlockedGroup(term?: InternshipTerm | null) {
  return blockedTermGroups.find((group) => term && group.includes(term))
}

export default function MatchingManagePage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<Application[]>([])
  const [matchings, setMatchings] = useState<Matching[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [applicationResult, matchingResult] = await Promise.all([
      supabase.from('applications').select('*,profiles(*),internship_sessions(*),first_recruitment:internship_recruitments!applications_first_recruitment_id_fkey(*,companies(*)),second_recruitment:internship_recruitments!applications_second_recruitment_id_fkey(*,companies(*))').order('submitted_at'),
      supabase.from('matchings').select('*,internship_sessions(*)'),
    ])
    const nextItems = (applicationResult.data as Application[] | null) ?? []
    const nextMatchings = (matchingResult.data as Matching[] | null) ?? []
    setItems(nextItems)
    setMatchings(nextMatchings)
    setSelected(Object.fromEntries(nextItems.map((item) => {
      const matching = nextMatchings.find((nextMatching) => nextMatching.session_id === item.session_id && nextMatching.student_id === item.student_id && nextMatching.status !== 'canceled')
      return [item.id, matching?.recruitment_id ?? '']
    })))
    setMessage(applicationResult.error?.message ?? matchingResult.error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const match = async (item: Application) => {
    const recruitmentId = selected[item.id]
    const recruitment = recruitmentId === item.first_recruitment_id ? item.first_recruitment : item.second_recruitment
    const { data: existingRows, error: findError } = await supabase
      .from('matchings')
      .select('id')
      .eq('session_id', item.session_id)
      .eq('student_id', item.student_id)
      .limit(1)
      .returns<{ id: string }[]>()
    if (findError) return setMessage(findError.message)

    const existing = existingRows?.[0]
    if (!recruitmentId) {
      if (existing) {
        const { error } = await supabase.from('matchings').delete().eq('id', existing.id)
        if (error) return setMessage(error.message)
      }
      await load()
      return setMessage('매칭 배정을 해제했습니다.')
    }

    if (!recruitment?.company_id) return setMessage('배정할 기업을 선택해주세요.')

    const blockedGroup = getBlockedGroup(item.internship_sessions?.term)
    const blockedMatching = blockedGroup
      ? matchings.find((matching) =>
        matching.student_id === item.student_id
        && matching.session_id !== item.session_id
        && matching.status !== 'canceled'
        && Boolean(matching.internship_sessions?.term && blockedGroup.includes(matching.internship_sessions.term))
      )
      : null

    if (blockedMatching) {
      return setMessage(`${blockedGroup?.join(', ')} 세션 묶음에서는 학생 1명당 1개 기업만 매칭할 수 있습니다.`)
    }

    const payload = { company_id: recruitment.company_id, recruitment_id: recruitmentId, matched_by: profile?.id, status: 'matched' as const }
    const { error } = existing
      ? await supabase.from('matchings').update(payload).eq('id', existing.id)
      : await supabase.from('matchings').insert({ session_id: item.session_id, student_id: item.student_id, ...payload })
    if (error) return setMessage(error.message)
    await load()
    setMessage('기업-학생 매칭을 저장했습니다.')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">기업-학생 매칭 관리</h1>
      {loading ? <Loading /> : items.length === 0 ? <Empty>지원 내역이 없습니다.</Empty> : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[1500px] text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr><th className="p-3">학생</th><th className="p-3">이메일</th><th className="p-3">연락처</th><th className="p-3">학번</th><th className="p-3">학과/학년</th><th className="p-3">희망 직무</th><th className="p-3">세션</th><th className="p-3">1순위</th><th className="p-3">2순위</th><th className="p-3">지원 상태</th><th className="p-3">매칭 배정</th><th className="p-3">처리</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b align-top">
                  <td className="p-3 font-medium">{item.profiles?.name || '-'}</td>
                  <td className="p-3">{item.profiles?.email || '-'}</td>
                  <td className="p-3">{item.profiles?.phone || '-'}</td>
                  <td className="p-3">{item.profiles?.student_no || '-'}</td>
                  <td className="p-3">{item.profiles?.department || '-'} / {item.profiles?.grade ? `${item.profiles.grade}학년` : '-'}</td>
                  <td className="p-3">{item.profiles?.desired_job || '-'}</td>
                  <td className="p-3">{formatSessionLabel(item.internship_sessions)}</td>
                  <td className="p-3">{item.first_recruitment ? `${item.first_recruitment.companies?.company_name} · ${item.first_recruitment.title}` : '-'}</td>
                  <td className="p-3">{item.second_recruitment ? `${item.second_recruitment.companies?.company_name} · ${item.second_recruitment.title}` : '선택 안 함'}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3">
                    <select className="w-full rounded-lg border px-3 py-2" value={selected[item.id] ?? ''} onChange={(event) => setSelected({ ...selected, [item.id]: event.target.value })}>
                      <option value="">미배정(매칭 해제)</option>
                      {item.first_recruitment_id && <option value={item.first_recruitment_id}>1순위: {item.first_recruitment?.companies?.company_name}</option>}
                      {item.second_recruitment_id && <option value={item.second_recruitment_id}>2순위: {item.second_recruitment?.companies?.company_name}</option>}
                    </select>
                  </td>
                  <td className="p-3"><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => void match(item)}>저장</button></td>
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
