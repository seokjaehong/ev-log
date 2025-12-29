# EV LOG - 전기차 충전 기록 관리 앱

EV LOG는 전기차 충전 기록을 쉽고 편리하게 관리할 수 있는 React Native (Expo) 애플리케이션입니다.

## 주요 기능

### 충전 기록 관리
- 충전 날짜, 장소, 충전기 타입, 충전량, 단가, 총 비용 기록
- 배터리 잔량(%) 기록 (선택사항)
- 월별 충전 통계 자동 계산 (총 비용, 총 충전량, 충전 횟수)
- 최신순 정렬된 충전 기록 리스트

### OCR 영수증 스캔
- Tesseract.js 기반 무료 OCR (API 비용 없음)
- 한국어 + 영어 자동 인식
- 카메라 촬영 또는 앨범에서 이미지 선택
- 영수증에서 날짜, 장소, 충전량, 단가, 총액 자동 추출
- 클라이언트 측 실행 (개인정보 보호)

### 차량 정보 관리
- 8개 제조사 지원 (현대, 기아, 테슬라, BMW, 메르세데스-벤츠, 제네시스, 볼보, 폴스타)
- 50+ 전기차 모델 데이터베이스
- 배터리 용량 자동 입력
- 차량 별명, 차량 번호 등 상세 정보 저장
- 직접 입력 옵션 (목록에 없는 차량)

### 다크/라이트 테마
- 사용자 선호에 따른 테마 전환
- AsyncStorage를 통한 설정 저장
- 모든 화면과 컴포넌트에 일관된 테마 적용

### 웹 모바일 최적화
- 모바일 기기에 최적화된 반응형 디자인
- PWA 지원 (홈 화면에 추가 가능)
- 웹에서는 모바일 프레임 (430x932px) 내 표시

## 기술 스택

- **프레임워크**: React Native (Expo SDK 54)
- **언어**: TypeScript
- **네비게이션**: React Navigation (Native Stack)
- **데이터 저장**: AsyncStorage (로컬)
- **상태 관리**: Context API (테마)
- **OCR**: Tesseract.js
- **플랫폼**: Web, iOS, Android

## 시작하기

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 또는 yarn 사용 시
yarn install
```

### 개발 서버 실행

```bash
# Expo 개발 서버 시작
npm start

# 플랫폼 선택:
# - 웹: 'w' 키 입력
# - iOS: 'i' 키 입력
# - Android: 'a' 키 입력
```

또는 플랫폼별로 직접 실행:

```bash
npm run web      # 웹 브라우저
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
```

## 배포

### Vercel 배포

이 프로젝트는 Vercel을 통해 쉽게 배포할 수 있습니다.

```bash
# 웹 빌드
npm run build:web

# Vercel 배포
npm run deploy
```

자세한 배포 가이드는 [배포 가이드](./docs/DEPLOYMENT.md)를 참조하세요.

## 프로젝트 구조

```
charge-paper/
├── src/
│   ├── screens/          # 화면 컴포넌트
│   │   ├── HomeScreen.tsx
│   │   ├── AddChargeScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── VehicleSettingsScreen.tsx
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── MonthlySummary.tsx
│   │   ├── ChargeListItem.tsx
│   │   ├── SelectModal.tsx
│   │   └── ScanResultModal.tsx
│   ├── contexts/         # Context API
│   │   └── ThemeContext.tsx
│   ├── services/         # 외부 서비스
│   │   └── ocrService.ts
│   ├── utils/            # 유틸리티 함수
│   │   ├── storage.ts
│   │   ├── vehicleData.ts
│   │   └── receiptParser.ts
│   └── types/            # TypeScript 타입 정의
│       └── index.ts
├── docs/                 # 프로젝트 문서
│   ├── DEPLOYMENT.md     # 배포 가이드
│   ├── SETUP.md          # 프로젝트 설정 가이드
│   └── TESTING.md        # 테스트 가이드
├── assets/               # 이미지, 아이콘 등
├── App.tsx               # 앱 엔트리 포인트
├── app.json              # Expo 설정
├── package.json
├── tsconfig.json
├── vercel.json           # Vercel 배포 설정
├── CLAUDE.md             # AI 컨텍스트 가이드
└── README.md             # 프로젝트 소개
```

## 데이터 저장

모든 데이터는 AsyncStorage를 사용하여 로컬에 저장됩니다:
- **충전 기록**: `@ev_log_charges`
- **테마 설정**: `@ev_log_theme`
- **차량 정보**: `@ev_log_vehicle`

서버 없이 완전히 클라이언트 측에서 동작하여 개인정보를 보호합니다.

## 문서

프로젝트와 관련된 상세한 문서는 `docs/` 폴더에서 확인할 수 있습니다:

- **[배포 가이드](./docs/DEPLOYMENT.md)** - Vercel 배포 방법 및 체크리스트
- **[프로젝트 설정 가이드](./docs/SETUP.md)** - Supabase 설정 및 환경 변수 설정
- **[테스트 가이드](./docs/TESTING.md)** - 저장 기능 테스트 방법
- **[AI 개발 가이드](./CLAUDE.md)** - Claude Code용 프로젝트 컨텍스트

## 브라우저 개발자 도구 활용

웹에서 실행 시 브라우저 개발자 도구의 Console 탭에서 상세한 로그를 확인할 수 있습니다:
- 저장 프로세스 추적
- LocalStorage 데이터 확인
- OCR 진행 상황 모니터링

## 라이선스

MIT License

## 작성자

EV 충전 기록 관리를 위한 개인 프로젝트

---

**Note**: 이 앱은 개인정보를 외부 서버로 전송하지 않으며, 모든 데이터는 사용자의 기기에 로컬로 저장됩니다.
