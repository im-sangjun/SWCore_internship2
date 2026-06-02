import { useEffect, useMemo, useState } from 'react'
import { Empty, Loading, Message } from '../../components/PageState'
import { supabase } from '../../lib/supabase'
import type { Company } from '../../types/app'

type SortKey = 'company_name' | 'business_type' | 'contact_name'

export default function CompanyListManagePage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('company_name')
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [address, setAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const visibleCompanies = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return companies
      .filter((company) => !keyword || [company.company_name, company.business_type, company.contact_name, company.contact_email].some((value) => value?.toLowerCase().includes(keyword)))
      .sort((a, b) => (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '', 'ko'))
  }, [companies, search, sortKey])

  const load = async () => {
    const { data, error } = await supabase.from('companies').select('*').order('company_name')
    setCompanies(data ?? [])
    setMessage(error?.message ?? '')
    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [])

  const add = async (event: React.FormEvent) => {
    event.preventDefault()
    const { error } = await supabase.from('companies').insert({
      company_name: companyName,
      business_type: businessType || null,
      address: address || null,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      description: description || null,
    })
    if (error) return setMessage(error.message)
    setCompanyName('')
    setBusinessType('')
    setAddress('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setDescription('')
    await load()
    setMessage('기업 정보를 등록했습니다.')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">기업 전체 리스트</h1>
      <form onSubmit={add} className="grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
        <h2 className="font-bold md:col-span-2">기업 기본정보 등록</h2>
        <input className="rounded-lg border px-3 py-2" placeholder="기업명 *" value={companyName} onChange={(event) => setCompanyName(event.target.value)} required />
        <input className="rounded-lg border px-3 py-2" placeholder="업종" value={businessType} onChange={(event) => setBusinessType(event.target.value)} />
        <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="주소" value={address} onChange={(event) => setAddress(event.target.value)} />
        <input className="rounded-lg border px-3 py-2" placeholder="담당자명" value={contactName} onChange={(event) => setContactName(event.target.value)} />
        <input className="rounded-lg border px-3 py-2" placeholder="담당자 이메일" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
        <input className="rounded-lg border px-3 py-2" placeholder="담당자 전화번호" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
        <textarea className="rounded-lg border px-3 py-2" placeholder="기업 소개" value={description} onChange={(event) => setDescription(event.target.value)} />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white md:col-span-2">기업 등록</button>
      </form>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">등록 기업</h2>
          <div className="flex gap-2">
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="기업명, 업종, 담당자 검색" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="rounded-lg border px-3 py-2 text-sm" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
              <option value="company_name">기업명순</option>
              <option value="business_type">업종순</option>
              <option value="contact_name">담당자순</option>
            </select>
          </div>
        </div>
        {loading ? <Loading /> : visibleCompanies.length === 0 ? <Empty>검색 조건에 맞는 기업이 없습니다.</Empty> : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b bg-slate-50"><tr><th className="p-3">기업명</th><th className="p-3">업종</th><th className="p-3">주소</th><th className="p-3">담당자</th><th className="p-3">이메일</th><th className="p-3">전화번호</th><th className="p-3">소개</th></tr></thead>
              <tbody>{visibleCompanies.map((company) => <tr key={company.id} className="border-b"><td className="p-3 font-medium">{company.company_name}</td><td className="p-3">{company.business_type || '-'}</td><td className="p-3">{company.address || '-'}</td><td className="p-3">{company.contact_name || '-'}</td><td className="p-3">{company.contact_email || '-'}</td><td className="p-3">{company.contact_phone || '-'}</td><td className="max-w-xs truncate p-3">{company.description || '-'}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
      {message && <Message>{message}</Message>}
    </div>
  )
}
