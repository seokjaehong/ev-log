# Vercel 배포 가이드

EV LOG 앱을 Vercel에 배포하는 방법을 단계별로 설명합니다.

## 목차
1. [사전 준비](#사전-준비)
2. [배포 방법](#배포-방법)
3. [환경 변수 설정](#환경-변수-설정-필수)
4. [배포 체크리스트](#배포-체크리스트)
5. [배포 후 확인사항](#배포-후-확인사항)
6. [커스텀 도메인 연결](#커스텀-도메인-연결-선택사항)
7. [트러블슈팅](#트러블슈팅)

## 사전 준비

### 1. Vercel 계정 생성
- [vercel.com](https://vercel.com) 방문
- GitHub, GitLab, 또는 Bitbucket 계정으로 가입
- 무료 Hobby 플랜 사용 가능

### 2. Vercel CLI 설치 (선택사항)
```bash
npm install -g vercel
```

## 배포 방법

### 방법 1: GitHub 연동 배포 (권장)

#### Step 1: GitHub Repository 생성
```bash
# 프로젝트를 Git 저장소로 초기화 (아직 안했다면)
git init

# .gitignore 확인 (node_modules, .env 등이 포함되어야 함)
cat .gitignore

# 파일 추가 및 커밋
git add .
git commit -m "Initial commit for Vercel deployment"

# GitHub에 새 저장소 생성 후 연결
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

#### Step 2: Vercel에서 프로젝트 Import
1. [vercel.com/dashboard](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. "Deploy" 클릭

#### Step 3: 자동 배포 설정
- 이제 GitHub에 push할 때마다 자동으로 배포됩니다
- `main` 브랜치에 push하면 프로덕션 배포
- 다른 브랜치에 push하면 프리뷰 배포

### 방법 2: Vercel CLI로 직접 배포

#### Step 1: Vercel CLI 로그인
```bash
vercel login
```

#### Step 2: 프로젝트 설정
```bash
# 프로젝트 디렉토리에서 실행
vercel

# 질문에 답변:
# - Set up and deploy? Y
# - Which scope? (계정 선택)
# - Link to existing project? N
# - Project name? ev-log (또는 원하는 이름)
# - In which directory is your code? ./
# - Want to override settings? Y
#   - Build Command: npm run build:web
#   - Output Directory: dist
#   - Development Command: npm run web
```

#### Step 3: 프로덕션 배포
```bash
# 빠른 배포 (스크립트 사용)
npm run deploy

# 또는 직접 명령어 실행
npm run build:web
vercel deploy --prod
```

## 환경 변수 설정 (필수)

**중요**: EV LOG는 Supabase 인증을 사용하므로 환경 변수 설정이 필수입니다.

### 필수 환경 변수
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key

### Vercel Dashboard에서 설정 (권장)
1. [vercel.com/dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → Environment Variables 클릭
4. 다음 변수 추가:

   **Name**: `EXPO_PUBLIC_SUPABASE_URL`
   **Value**: (Supabase Dashboard > Settings > API에서 복사)
   **Environments**: Production, Preview, Development 모두 체크

   **Name**: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   **Value**: (Supabase Dashboard > Settings > API에서 "anon public" 키 복사)
   **Environments**: Production, Preview, Development 모두 체크

5. "Save" 클릭
6. 프로젝트 재배포 (Deployments → 최신 배포 → "Redeploy")

### CLI에서 설정
```bash
vercel env add EXPO_PUBLIC_SUPABASE_URL production
# 프롬프트에서 값 입력

vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production
# 프롬프트에서 값 입력
```

### Supabase 설정 확인
환경 변수를 찾는 방법:
1. https://app.supabase.com 접속
2. 프로젝트 선택
3. Settings → API 클릭
4. "Project URL" 복사 → `EXPO_PUBLIC_SUPABASE_URL`
5. "Project API keys" → "anon public" 복사 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 배포 체크리스트

### 버전 관리 (Semantic Versioning)

버전 형식: **MAJOR.MINOR.PATCH** (예: 1.0.1)

- **MAJOR**: 호환되지 않는 API 변경 (예: 1.0.0 → 2.0.0)
- **MINOR**: 새로운 기능 추가 (하위 호환) (예: 1.0.0 → 1.1.0)
- **PATCH**: 버그 수정 (하위 호환) (예: 1.0.0 → 1.0.1)

#### 버전 업데이트 파일:
1. `package.json` - `version` 필드
2. `app.json` - `expo.version` 필드

**예시**:
```json
// package.json
{
  "version": "1.0.1"
}

// app.json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

### 배포 단계

#### Step 1: 버전 결정
현재 변경사항을 검토하고 적절한 버전 증가를 결정합니다.

**예시**:
- 🐛 버그 수정 (삭제 버튼 오류 등) → PATCH (1.0.0 → 1.0.1)
- ✨ 새 기능 추가 (Footer, 새로운 화면 등) → MINOR (1.0.0 → 1.1.0)
- 💥 Breaking Change (구조 대변경, API 변경) → MAJOR (1.0.0 → 2.0.0)

#### Step 2: 버전 업데이트
```bash
# package.json과 app.json의 version 필드를 수동으로 수정
```

#### Step 3: 변경사항 확인
```bash
git status
git diff package.json app.json
```

#### Step 4: 환경 변수 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env.example`에 실제 키가 없는가?
- [ ] Vercel 환경 변수가 모두 설정되어 있는가?

#### Step 5: 빌드 테스트 (선택사항)
```bash
npm run build:web
```

#### Step 6: Git 커밋
```bash
git add package.json app.json
git commit -m "Bump version to 1.0.1"

# 다른 변경사항 커밋
git add .
git commit -m "기능 설명"
```

#### Step 7: Git 푸시
```bash
git push origin main
```

#### Step 8: Vercel 배포 확인
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Deployments 탭에서 배포 상태 확인
4. 배포 완료 후 URL 접속하여 테스트

### 버전 히스토리 예시

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.1 | 2025-12-29 | 🐛 웹 환경 삭제 버튼 오류 수정, Footer 추가 |
| 1.0.0 | 2025-12-28 | 🎉 초기 배포 (Gemini Vision API, Supabase 인증) |

### 자동화 개선 계획 (향후)

#### npm scripts 추가 고려
```json
{
  "scripts": {
    "version:patch": "npm version patch && git push && git push --tags",
    "version:minor": "npm version minor && git push && git push --tags",
    "version:major": "npm version major && git push && git push --tags"
  }
}
```

**사용 예시**:
```bash
npm run version:patch  # 1.0.0 → 1.0.1
npm run version:minor  # 1.0.0 → 1.1.0
npm run version:major  # 1.0.0 → 2.0.0
```

## 배포 후 확인사항

### 기능 테스트
- [ ] 로그인/로그아웃 (Supabase 인증)
- [ ] 홈 화면 로딩
- [ ] 충전 기록 추가/수정/삭제
- [ ] 영수증 스캔 (Tesseract.js OCR)
- [ ] 월별 통계 표시
- [ ] 다크/라이트 테마 전환
- [ ] 차량 정보 등록/관리
- [ ] 데이터 새로고침 후에도 유지 (Supabase)
- [ ] 사용자별 데이터 격리 (다른 계정으로 로그인 시 데이터 안 보임)
- [ ] **설정 화면 Footer 버전 확인** (현재 버전 표시 확인)

### 버전 확인
- [ ] 설정 화면 하단에 올바른 버전이 표시되는가? (예: "EV LOG v1.0.1")

### 플랫폼 테스트
- [ ] 웹 브라우저 (Chrome, Safari, Firefox)
- [ ] iOS (시뮬레이터 또는 실제 기기)
- [ ] Android (에뮬레이터 또는 실제 기기)

### 모바일 최적화 확인
- [ ] 모바일 기기에서 접속
- [ ] 반응형 레이아웃 확인
- [ ] 터치 동작 확인
- [ ] PWA 설치 가능 여부 확인

### 성능 확인
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/)에서 성능 측정
- [ ] Lighthouse 점수 확인

## 커스텀 도메인 연결 (선택사항)

### Vercel Dashboard에서 설정
1. 프로젝트 → Settings → Domains
2. "Add" 클릭
3. 도메인 입력 (예: evlog.yourdomain.com)
4. DNS 설정 지침 따르기

### DNS 설정 예시
도메인 제공업체에서 다음 레코드 추가:
```
Type: CNAME
Name: evlog (또는 www)
Value: cname.vercel-dns.com
```

### 배포 URL

배포 후 다음과 같은 URL을 받게 됩니다:
- 프로덕션: `https://ev-log.vercel.app` (또는 커스텀 도메인)
- 프리뷰: `https://ev-log-git-branch-name.vercel.app`

## 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build:web

# 에러 확인
cat dist/index.html
```

### 라우팅 문제
- vercel.json의 rewrites 설정 확인
- 모든 경로가 index.html로 리다이렉트되는지 확인

### 환경 변수 문제
```bash
# Vercel 환경 변수 확인
vercel env ls

# 로컬 환경 변수 확인
cat .env
```

### 캐시 문제
```bash
# Vercel 빌드 캐시 삭제
vercel --force

# 또는 Vercel Dashboard에서 "Redeploy" 시 "Clear cache" 선택
```

### 배포 후 업데이트

#### GitHub 연동 시
```bash
git add .
git commit -m "Update feature"
git push origin main
# 자동으로 배포됩니다
```

#### CLI 배포 시
```bash
npm run deploy
```

## 배포 비용

Vercel Hobby 플랜 (무료):
- 대역폭: 100GB/월
- 빌드 시간: 100시간/월
- 프로젝트: 무제한
- 개인 프로젝트에 충분

더 많은 리소스가 필요하면 Pro 플랜($20/월) 고려

## 추가 최적화

### 1. 이미지 최적화
Vercel은 자동으로 이미지를 최적화하지만, Next.js Image가 아니므로 직접 최적화 필요:
```bash
# 이미지 압축 도구 설치
npm install --save-dev imagemin imagemin-pngquant imagemin-mozjpeg
```

### 2. 번들 크기 최적화
```bash
# 번들 분석
npx expo export --platform web --analyzer
```

### 3. PWA 최적화
- app.json에 PWA 설정 확인 (이미 완료)
- 서비스 워커 등록 확인
- 오프라인 지원 테스트

## 모니터링

Vercel Dashboard에서 확인 가능:
- 배포 상태
- 방문자 수
- 성능 메트릭
- 에러 로그
- 빌드 로그

## 참고 자료

- [Semantic Versioning 2.0.0](https://semver.org/lang/ko/)
- [npm version 명령어](https://docs.npmjs.com/cli/v8/commands/npm-version)
- [Vercel 공식 문서](https://vercel.com/docs)
- [Expo Web 배포 가이드](https://docs.expo.dev/distribution/publishing-websites/)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
