import FeaturePage from '../../components/FeaturePage'

export default function MyApplicationsPage() {
  return (
    <FeaturePage
      title="내 지원 현황"
      description="제출한 지원서와 선발 상태를 확인하는 화면입니다. 지원 현황 조회 기능을 준비하고 있습니다."
      backTo="/student"
      backLabel="학생 메뉴로 돌아가기"
    />
  )
}
