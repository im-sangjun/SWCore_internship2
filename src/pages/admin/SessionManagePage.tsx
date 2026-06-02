import FeaturePage from '../../components/FeaturePage'

export default function SessionManagePage() {
  return (
    <FeaturePage
      title="세션 관리"
      description="학기별 인턴십 접수 기간과 상태를 관리하는 화면입니다. 세션 편집 기능을 준비하고 있습니다."
      backTo="/admin"
      backLabel="관리자 메뉴로 돌아가기"
    />
  )
}
