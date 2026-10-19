# Grinergy 프로젝트 개요

Grinergy는 친환경·에너지 혁신 기업의 Next.js 웹사이트입니다. 공개 웹사이트와, 뉴스·공지사항 등 콘텐츠를 관리하는 어드민 대시보드로 구성됩니다.

## 핵심 기술

- **런타임:** Node.js 24 (`engines.node: 24.x`, `.nvmrc`)
- **프레임워크:** Next.js 16 (App Router), React 19
- **언어:** TypeScript
- **데이터베이스:** MongoDB + Prisma ORM (v5)
- **인증:** 어드민 전용 JWT 쿠키 인증
- **스타일링:** Tailwind CSS v3, 로컬 폰트 (Noto Sans KR, Univers LT Pro)
- **다국어:** `next-intl` v4 (영어·한국어)
- **스토리지:** Cloudflare R2 (AWS SDK S3 클라이언트 사용)
- **폼:** React Hook Form + Zod
- **에디터:** `react-quill-new` (Quill 2)
- **애니메이션:** Framer Motion
- **모니터링:** Vercel Analytics, Slack 웹훅 에러 알림
- **린트:** ESLint 9 flat config (`eslint.config.mjs`)

## 프로젝트 구조

- `src/app`: 라우트와 페이지 로직
  - `(client)`: 공개 페이지 (Home, About, Product, Investors, News, Notice)
  - `(admin)/admin`: 어드민 대시보드. `(isAdmin)` 그룹의 `layout.tsx`에서 `getIsAdmin()`으로 접근을 막고, 미인증 시 `/admin/login`으로 리다이렉트
  - `api`: `news/[newsId]`, `notice/[noticeId]`, `download` 라우트 핸들러
  - `actions.ts`: `getIsAdmin()` 등 공용 Server Action
- `src/actions`: `log.actions.ts` (OperationLog 기록)
- `src/components`: 재사용 UI 컴포넌트
- `src/exceptions`: 커스텀 예외 클래스 (`GlobalException` 및 하위 클래스)
- `src/hooks`: 커스텀 훅
- `src/libs`: 핵심 로직과 유틸리티
  - `db-actions/`: News, Notice, File DB 조회·변경 함수
  - `db.ts`: Prisma 클라이언트
  - `s3-client.ts`: Cloudflare R2용 S3 클라이언트
  - `error-handler.ts`: 공통 에러 처리 (`handleError`)
  - `constants.ts`: 페이지 크기, 캐시 태그, 재검증 시간 등 상수
  - `utils.ts`: `cn`, `getIsEng`, `sendSlackNotification` 등
- `src/instrumentation.ts`: `onRequestError`로 처리되지 않은 서버 에러를 Slack에 알림
- `src/i18n.ts`: `next-intl` 요청 설정
- `prisma/schema.prisma`: News, Notice, File, OperationLog 모델
- `messages/`: 번역 파일 (`en.json`, `ko.json`)
- `public/`: 폰트, 이미지, 비디오 등 정적 파일

## 주요 동작 방식

### 다국어
`next-intl`을 사용합니다. 로케일은 `lan` 쿠키로 정하며 기본값은 `en`입니다. `RootLayout`이 로케일에 맞춰 `lang` 속성과 폰트 클래스를 지정합니다.

### 어드민 인증
`src/app/(admin)/admin/login/actions.ts`에서 비밀번호(`ADMIN_PASSWORD`)를 확인하고, 성공하면 `COOKIE_SECRET`으로 서명한 JWT를 `httpOnly` 쿠키 `token`에 저장합니다. 별도 미들웨어 없이 `(isAdmin)` 레이아웃에서 검증합니다.

### 데이터 캐싱
- 공개 페이지는 `src/libs/db-actions/`의 `getCached*` 함수(`unstable_cache`)로 조회해 DB 부하를 줄입니다. 캐시 태그는 `news`, `notice` 및 각 count 태그를 씁니다.
- 어드민 페이지는 캐시를 거치지 않고 DB를 바로 조회하는 함수(`get*ForAdmin`, `getTotal*Count` 등)를 씁니다.
- 어드민 Server Action에서 데이터를 바꾼 뒤에는 `updateTag()`로 해당 태그를 즉시 무효화합니다. (`revalidateTag` 대신 사용)

### 파일 관리
공지사항 첨부 파일은 Cloudflare R2에 올리고 지웁니다. 파일 메타데이터는 `Notice`와 연결된 `File` 모델에 저장합니다.

### 에러 처리와 알림
- Server Action과 API 라우트의 `catch` 블록에서는 `handleError()`를 호출합니다. `GlobalException`이면 해당 메시지와 상태 코드를 돌려주고, 그 외 예상치 못한 에러는 Slack으로 알립니다.
- 잡히지 않은 서버 에러는 `instrumentation.ts`의 `onRequestError`가 Slack으로 알립니다.

### 에디터
`src/components/Editor.tsx`는 `react-quill-new`를 쓰며 `useSemanticHTML={false}`로 저장합니다. 공백이 `&nbsp;`로 바뀌지 않고 목록의 `data-list` 속성이 유지되도록 하기 위함입니다. Quill 1로 작성된 기존 글의 `ul`/`ol` 목록 기호는 `globals.css`에서 따로 보정합니다.

### 작업 로그
뉴스·공지 생성·수정·삭제 시 `createLog()`로 `OperationLog`에 모델, 작업 종류, 변경 데이터, IP를 기록합니다.

## 환경 변수

`.env.example` 참고. 개발은 `.env.development`, 빌드는 `.env.production`을 사용합니다 (둘 다 git 제외).

- `DATABASE_URL`
- `ADMIN_PASSWORD`, `COOKIE_SECRET`
- `R2_ENDPOINT`, `R2_PUBLIC_ENDPOINT`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `SLACK_WEBHOOK_URL`

## 개발 명령어

- `yarn dev`: 개발 서버 실행
- `yarn build`: Prisma 클라이언트 생성, 운영 DB에 스키마 반영 후 빌드
- `yarn start`: 빌드된 앱 실행
- `yarn lint`: ESLint 검사 (`eslint .`)
- `yarn push:dev`: 개발 DB에 Prisma 스키마 반영
- `yarn studio:dev`: 개발 DB로 Prisma Studio 실행

## Next.js 16 / React 19 주의사항

- `cookies()`, `headers()`, 페이지의 `params`, `searchParams`는 모두 비동기입니다. 반드시 `await` 후 사용하세요.
- 폼 상태는 `useFormState` 대신 `useActionState`를 사용합니다.
- `next lint`는 없어졌습니다. `yarn lint`(ESLint CLI)를 사용하세요.

## 컨벤션

- **Server Action:** DB 변경과 민감한 작업은 `src/libs/db-actions` 또는 각 라우트의 `actions.ts`에 Server Action으로 작성합니다.
- **검증:** 폼 데이터와 API 입력은 Zod 스키마로 검증합니다.
- **스타일:** Tailwind 유틸리티 클래스를 쓰고, 조건부 클래스가 복잡하면 `cn()`(`clsx` + `tailwind-merge`)을 사용합니다.
- **에러 처리:** `src/exceptions`의 커스텀 예외 클래스와 `src/libs/error-handler.ts`의 `handleError`를 사용합니다.
- **커밋 메시지:** `feat:`, `fix:`, `chore:` 접두어 + 한글 요약 형식을 따릅니다.
