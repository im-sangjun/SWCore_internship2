import FeaturePage from '../../components/FeaturePage'

export default function UserManagePage() {
  return (
    <FeaturePage
      title="사용자 관리"
      description="매니저 승인과 사용자 정보를 관리하는 화면입니다. 승인 처리 기능을 준비하고 있습니다."
      backTo="/admin"
      backLabel="관리자 메뉴로 돌아가기"
    />
  )
}
