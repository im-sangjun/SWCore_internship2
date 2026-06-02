# SWCore Internship

SW중심대학 인턴십 신청, 매칭, 관리를 위한 React PWA입니다.

## 로컬 실행

`.env.local` 파일에 Supabase 프로젝트 값을 설정합니다.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

의존성을 설치하고 개발 서버를 실행합니다.

```bash
npm ci
npm run dev
```

## Supabase 초기화

Supabase SQL Editor에서 아래 파일을 순서대로 실행합니다.

1. `supabase/init.sql`
2. `supabase/rls.sql`

`rls.sql`은 회원가입 시 프로필을 생성하는 트리거와 기본 Row Level Security
정책, 상태 변경 알림 트리거를 함께 설치합니다. 운영 데이터를 넣기 전에 반드시
적용해야 합니다.

기본 관리자 이메일은 `imsangjun@gmail.com`입니다. 이 이메일로 회원가입하면
자동으로 관리자 권한이 부여됩니다. 이미 가입된 계정이 있어도 `rls.sql` 실행 시
관리자 권한으로 갱신됩니다.

기존 DB에 다시 적용하는 경우 `matchings` 테이블에 동일 세션과 학생의 중복
데이터가 없어야 고유 인덱스가 생성됩니다.

회원가입 계정이 `auth.users`에는 있지만 `public.profiles`에 보이지 않는 경우에는
SQL Editor에서 `supabase/repair_profiles.sql`을 실행합니다. 기존 계정의 프로필을
복구하고 이후 가입자를 위한 트리거도 다시 설치합니다.

신규 회원가입 프로필 자동 생성 트리거만 다시 설치하려면 SQL Editor에서
`supabase/install_profile_trigger.sql`을 실행합니다. 로컬 개발 서버를 다시
시작할 필요는 없습니다.

기존 DB에 기업 모집 공개 토글을 추가하려면 SQL Editor에서
`supabase/add_recruitment_visibility.sql`을 실행합니다. 새 모집 공고는 기본적으로
학생에게 숨김 처리되며, 관리자 또는 매니저가 공개 토글을 켜면 학생 기업 리스트와
지원 화면에 표시됩니다. 이 파일은 필요한 권한 확인 함수도 함께 설치하므로
독립적으로 실행할 수 있습니다. 마이그레이션 시점에 이미 등록된 `open` 모집
공고는 학생 화면 확인을 위해 공개 상태로 전환됩니다.

관리자 세션 수정, 기업 등록, 모집 관리, 지원자 조회 권한을 기존 DB에 한 번에
보정하려면 SQL Editor에서 `supabase/install_management_permissions.sql`을
실행합니다.

지원 학생 팝업에서 연락처를 표시하려면 기존 DB에 `phone` 컬럼이 필요합니다.
`supabase/install_management_permissions.sql` 또는 `supabase/add_profile_phone.sql`
을 실행하면 추가됩니다.

기업-학생 매칭 저장에서 `ON CONFLICT` 관련 오류가 난 기존 DB는
`supabase/fix_matchings_unique.sql` 또는 `supabase/install_management_permissions.sql`
을 실행해 매칭 고유 인덱스를 추가합니다.

기존 DB에서 `하계_2학기`, `동계_1학기` 세션 항목을 사용하려면 SQL Editor에서
`supabase/update_session_terms.sql`을 실행합니다. 이미
`supabase/install_management_permissions.sql`을 실행했다면 이 보정도 함께
포함되어 있어 별도로 실행하지 않아도 됩니다.

## 역할별 기능

- 관리자: 사용자 승인, 세션, 기업 모집, 직무 코드, 매칭, 공지, 상담 관리
- 매니저: 기업 모집, 참여 학생, 지원 현황 관리
- 학생: 기업 조회, 1순위/2순위 지원, 지원 현황, 상담 신청, 공지, 알림 확인
- 공통: 개인정보와 비밀번호 수정

## 검증

```bash
npm run lint
npm run build
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 GitHub Pages에 자동 배포합니다.
저장소의 Actions secrets에 아래 값을 등록해야 합니다.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

배포 주소: <https://im-sangjun.github.io/SWCore_internship2/>
