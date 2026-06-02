import FeaturePage from '../../components/FeaturePage'

export default function ApplicationManagePage() {
  return (
    <FeaturePage
      title="지원 현황 관리"
      description="학생별 지원 현황을 조회하고 관리하는 화면입니다. 목록과 필터 기능을 준비하고 있습니다."
      backTo="/manager"
      backLabel="매니저 메뉴로 돌아가기"
    />
  )
}
