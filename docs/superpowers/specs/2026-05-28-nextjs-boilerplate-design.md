# Next.js Boilerplate Design Spec

**Date:** 2026-05-28  
**Status:** Approved

## Overview

A minimal Next.js boilerplate as a subdirectory (`nextjs-boilerplate/`) inside the current repo. Provides a ready-to-use starting point with authentication, database, and UI setup — no extra features beyond what every project needs.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Auth | Auth.js v5 (NextAuth v5) |
| Auth Provider | Google OAuth |
| ORM | Prisma |
| Database | PostgreSQL |

## Project Structure

```
multiagent_coding/
└── nextjs-boilerplate/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/
    │   │   │   └── page.tsx       # Google 로그인 버튼
    │   │   └── layout.tsx
    │   ├── (dashboard)/
    │   │   ├── dashboard/
    │   │   │   └── page.tsx       # 로그인 후 진입 페이지
    │   │   └── layout.tsx         # 인증 체크 포함
    │   ├── api/
    │   │   └── auth/
    │   │       └── [...nextauth]/
    │   │           └── route.ts   # Auth.js 핸들러
    │   ├── layout.tsx             # 루트 레이아웃
    │   └── page.tsx               # 랜딩 (/ → /dashboard 리디렉션)
    ├── components/
    │   └── ui/                    # shadcn/ui 컴포넌트
    ├── lib/
    │   ├── auth.ts                # Auth.js 설정
    │   ├── db.ts                  # Prisma 클라이언트 싱글턴
    │   └── utils.ts               # cn() 유틸
    ├── prisma/
    │   └── schema.prisma          # DB 스키마
    ├── .env.local                 # 환경변수 (gitignored)
    ├── .env.example               # 환경변수 템플릿
    └── middleware.ts              # 라우트 보호
```

## Authentication

Auth.js v5를 사용하며 Google OAuth를 유일한 프로바이더로 설정한다.

**`lib/auth.ts`**
- `PrismaAdapter`로 세션/유저 데이터를 PostgreSQL에 저장
- `signIn`, `signOut`, `auth`, `handlers` 를 이 파일에서 export
- `pages.signIn`을 `/login`으로 지정

**`middleware.ts`**
- 미인증 요청을 `/login`으로 리디렉션
- `/api`, `_next/static`, `_next/image`, `favicon.ico`는 매처에서 제외

**`app/api/auth/[...nextauth]/route.ts`**
- Auth.js의 `handlers`를 GET/POST로 export

**로그인 흐름:** `/` → (미인증이면) `/login` → Google OAuth → `/dashboard`

## Database

Prisma + PostgreSQL 조합. Auth.js 어댑터 필수 모델 4개를 포함한다.

**모델:**
- `User` — id(cuid), name, email(unique), emailVerified, image, createdAt, updatedAt
- `Account` — OAuth 계정 연결 정보, userId로 User 참조
- `Session` — 세션 토큰, userId로 User 참조
- `VerificationToken` — 이메일 인증 토큰

프로젝트별 데이터 모델은 `User`에 relation을 추가하는 방식으로 확장한다.

**`lib/db.ts`**
- `globalThis`에 Prisma 인스턴스를 캐시해 개발 환경 핫 리로드 시 커넥션 중복 방지

## UI

shadcn/ui를 기본 컴포넌트 라이브러리로 사용. 초기 설치 컴포넌트는 `button`, `card` 두 개만 포함한다. 추가 컴포넌트는 `npx shadcn add <component>`로 필요 시 추가.

**`lib/utils.ts`** — `clsx` + `tailwind-merge`를 묶은 `cn()` 유틸 제공

**로그인 페이지 (`app/(auth)/login/page.tsx`)**
- 중앙 정렬 카드 레이아웃
- "Google로 계속하기" 버튼 하나
- Server Action으로 `signIn("google")` 호출

**대시보드 페이지 (`app/(dashboard)/dashboard/page.tsx`)**
- `auth()`로 서버에서 세션 조회
- 유저 이름 표시

## Environment Variables

```
AUTH_SECRET=          # npx auth secret 으로 생성
AUTH_GOOGLE_ID=       # Google Cloud Console OAuth 클라이언트 ID
AUTH_GOOGLE_SECRET=   # Google Cloud Console OAuth 클라이언트 시크릿
DATABASE_URL=         # PostgreSQL 연결 문자열
```

`.env.example` 파일을 레포에 포함하고 `.env.local`은 gitignore 처리한다.

## Out of Scope

- 다크모드 토글
- 유저 프로필 페이지
- 환경변수 검증 (t3-env/Zod)
- tRPC
- 배포 설정 (Vercel/Docker)

이 항목들은 필요 시 별도로 추가한다.
