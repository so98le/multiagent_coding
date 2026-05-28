# multiagent_coding

`multiagent_coding`은 학습용으로 관리하는 저장소이고, 현재 핵심 프로젝트는 `nextjs-boilerplate/` 아래의 Next.js 앱입니다.

이 앱은 다음 구성을 기반으로 합니다.

- Next.js App Router
- Auth.js v5 + Google OAuth
- Prisma + PostgreSQL
- Tailwind CSS + shadcn/ui
- Vitest

## 현재 구현 범위

현재 앱에는 아래 기능이 들어 있습니다.

- Google 로그인
- 로그인 사용자용 대시보드
- Prisma 기반 사용자/세션 저장
- 게시글 상세 페이지
- 1단 댓글 기능
- 댓글 작성은 로그인 사용자만 가능
- 댓글은 등록 즉시 공개
- 댓글 작성자 또는 `ADMIN` 권한 사용자는 댓글 삭제 가능
- 비로그인 사용자는 게시글 상세 페이지를 볼 수 있지만 댓글 작성은 불가

## 디렉터리 구조

```text
multiagent_coding/
├─ docs/
│  └─ superpowers/
│     ├─ plans/
│     └─ specs/
├─ nextjs-boilerplate/
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  ├─ prisma/
│  ├─ public/
│  └─ __tests__/
└─ README.md
```

실제 애플리케이션 개발은 `nextjs-boilerplate/` 안에서 진행합니다.

## 기술 개요

### 인증

- Auth.js v5를 사용합니다.
- Google OAuth로 로그인합니다.
- 인증이 필요한 일반 페이지는 로그인으로 리다이렉트됩니다.
- `/posts/[postId]` 상세 페이지는 공개 접근이 가능하고, 로그인한 사용자만 댓글 폼을 볼 수 있습니다.

### 데이터 모델

Prisma 스키마에는 아래 주요 모델이 있습니다.

- `User`
  - `role: USER | ADMIN`
- `Post`
  - 게시글 제목, 본문, 작성자
- `Comment`
  - 게시글 기준 1단 댓글
  - `deletedAt` 기반 소프트 삭제

### 댓글 정책

- 대댓글 없음
- 익명 댓글 없음
- 댓글 수정 없음
- 댓글 신고/승인 워크플로우 없음
- 댓글 목록은 오래된 순으로 표시

## 실행 방법

### 1. 의존성 설치

```bash
cd nextjs-boilerplate
npm install
```

### 2. 환경 변수 설정

`nextjs-boilerplate/.env.example`를 참고해서 `nextjs-boilerplate/.env.local`을 채웁니다.

필수 값:

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DATABASE_URL=
```

Google OAuth 리디렉션 URI:

```text
http://localhost:3000/api/auth/callback/google
```

### 3. Prisma 반영

```bash
npm run db:push
```

필요하면 Prisma Client를 다시 생성합니다.

```bash
npm run db:generate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:3000
```

## 자주 쓰는 스크립트

`nextjs-boilerplate/package.json` 기준:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run db:push
npm run db:migrate
npm run db:studio
```

## 댓글 기능 확인 방법

현재는 게시글 작성 UI가 아직 없기 때문에, 댓글 기능을 보려면 먼저 사용자와 게시글 데이터가 있어야 합니다.

### 1. Prisma Studio 실행

```bash
npm run db:studio
```

### 2. 데이터 준비

최소한 아래 데이터가 필요합니다.

- 로그인 가능한 `User`
- 해당 사용자가 작성했거나 아무 작성자나 연결된 `Post`

필요하면 관리자 테스트용으로 `User.role = ADMIN` 사용자도 하나 만듭니다.

### 3. 상세 페이지 열기

생성한 게시글 ID를 기준으로:

```text
http://localhost:3000/posts/<postId>
```

### 4. 확인 포인트

- 비로그인 상태
  - 게시글은 보임
  - 댓글 목록은 보임
  - 댓글 작성 폼 대신 로그인 안내가 보임
- 로그인 상태
  - 댓글 작성 가능
  - 새 댓글은 즉시 보임
  - 본인 댓글은 삭제 버튼이 보임
- 관리자 상태
  - 모든 댓글에 삭제 권한이 적용됨

## 테스트

현재는 아래 수준까지 자동 검증되어 있습니다.

- 댓글 입력 검증
- 댓글 삭제 권한 로직
- 삭제된 댓글 필터링
- 댓글 오래된순 정렬

실행:

```bash
npm test
npx eslint .
npx tsc --noEmit --pretty false
```

## 현재 한계

- 게시글 목록/작성/수정 UI 없음
- 댓글 수정 없음
- 대댓글 없음
- 관리자 전용 운영 UI 없음
- 서버 액션과 페이지 흐름에 대한 브라우저 수준 E2E 테스트 없음

## 관련 문서

설계 및 구현 계획 문서는 아래에 있습니다.

- `docs/superpowers/specs/2026-05-28-post-comments-design.md`
- `docs/superpowers/plans/2026-05-28-post-comments.md`
