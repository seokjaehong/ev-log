# Vercel 배포 가이드

EV LOG 앱을 Vercel에 배포하는 방법을 단계별로 설명합니다.

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

## 배포 후 확인사항

### 1. 기능 테스트
- [ ] 로그인 (Supabase 인증)
- [ ] 홈 화면 로딩
- [ ] 충전 기록 추가
- [ ] 충전 기록 수정
- [ ] 충전 기록 삭제
- [ ] 월별 통계 표시
- [ ] 다크/라이트 테마 전환
- [ ] 차량 정보 등록
- [ ] OCR 영수증 스캔 (Tesseract.js)
- [ ] 로그아웃
- [ ] 데이터 새로고침 후에도 유지 (Supabase)
- [ ] 사용자별 데이터 격리 (다른 계정으로 로그인 시 데이터 안 보임)

### 2. 모바일 최적화 확인
- 모바일 기기에서 접속
- 반응형 레이아웃 확인
- 터치 동작 확인
- PWA 설치 가능 여부 확인

### 3. 성능 확인
- [PageSpeed Insights](https://pagespeed.web.dev/)에서 성능 측정
- Lighthouse 점수 확인

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

## 배포 URL

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

## 배포 후 업데이트

### GitHub 연동 시
```bash
git add .
git commit -m "Update feature"
git push origin main
# 자동으로 배포됩니다
```

### CLI 배포 시
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

- [Vercel 공식 문서](https://vercel.com/docs)
- [Expo Web 배포 가이드](https://docs.expo.dev/distribution/publishing-websites/)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
