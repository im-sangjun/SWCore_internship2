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
정책을 함께 설치합니다. 운영 데이터를 넣기 전에 반드시 적용해야 합니다.

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
