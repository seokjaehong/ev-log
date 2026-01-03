# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

EV LOG는 전기차 충전 기록을 관리하는 React Native (Expo) 애플리케이션입니다. 사용자는 충전 장소, 충전기 타입, 비용, 충전량 등을 기록할 수 있으며, 월별 통계와 충전 기록 히스토리를 확인할 수 있습니다.

## 앱 실행 방법

```bash
# 개발 서버 시작 (시작 후 플랫폼 선택)
npm start

# 그 다음 키 입력:
# - 'w' 웹 브라우저
# - 'i' iOS 시뮬레이터
# - 'a' Android 에뮬레이터
# 또는 Expo Go 앱으로 QR 코드 스캔

# 플랫폼별 직접 실행
npm run web      # 웹 브라우저
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터

# 웹 빌드 및 배포
npm run build:web  # 웹 빌드 (dist 디렉토리 생성)
npm run deploy     # Vercel에 배포 (빌드 + 배포)
```

## 배포

이 프로젝트는 Vercel을 통해 배포할 수 있도록 설정되어 있습니다:

- **빌드 명령어**: `npm run build:web`
- **출력 디렉토리**: `dist`
- **배포 방법**: GitHub 연동 또는 Vercel CLI
- **설정 파일**: `vercel.json`
- **상세 가이드**: `docs/DEPLOYMENT.md` 참조

## 프로젝트 구조

```
charge-paper/
├── src/
│   ├── screens/       # 화면 컴포넌트
│   ├── components/    # 재사용 가능한 컴포넌트
│   ├── contexts/      # Context API (테마 등)
│   ├── services/      # 외부 서비스 (OCR 등)
│   ├── utils/         # 유틸리티 함수
│   └── types/         # TypeScript 타입 정의
├── docs/              # 프로젝트 문서
│   ├── DEPLOYMENT.md  # Vercel 배포 가이드
│   ├── SETUP.md       # Supabase 설정 가이드
│   └── TESTING.md     # 테스트 가이드
├── assets/            # 이미지, 아이콘 등
├── CLAUDE.md          # 이 파일 (AI 컨텍스트)
├── README.md          # 프로젝트 소개
└── ...
```

## 아키텍처

### 데이터 흐름

1. **인증 레이어** (`src/contexts/AuthContext.tsx`): Supabase 인증 관리
2. **Storage 레이어** (`src/utils/storage.ts`): Supabase 데이터베이스 연동 (충전 기록, 차량 정보)
3. **타입 시스템** (`src/types/index.ts`): `ChargeRecord`, `MonthlySummary`, `Vehicle` 등 타입 정의
4. **Screen 레이어**: HomeScreen과 AddChargeScreen이 UI 상태를 관리하고 storage 작업 실행
5. **Component 레이어**: 재사용 가능한 UI 컴포넌트 (MonthlySummary, ChargeListItem, Statistics)

### 핵심 데이터 구조

모든 충전 기록은 `ChargeRecord` 객체 배열로 저장되며, 저장 시 자동으로 날짜순(최신순) 정렬됩니다. Storage 유틸리티는 다음을 처리합니다:
- CRUD 작업 (생성, 읽기, 수정, 삭제)
- 자동 날짜 정렬
- 월별 통계 계산

### 네비게이션

React Navigation native stack을 사용하며 2개의 화면으로 구성:
- `Home`: 모든 기록 리스트 + 월별 통계 표시
- `AddCharge`: 기록 생성/수정 폼 (수정 시 `editRecord` 파라미터 전달)

### 플랫폼별 코드

웹, iOS, Android를 지원합니다. 플랫폼별 렌더링은 `Platform.OS` 체크로 처리됩니다:

**AddChargeScreen의 웹 전용 컴포넌트:**
- 날짜 선택기: DateTimePicker 대신 HTML5 `<input type="date">` 사용
- 슬라이더: React Native Slider 대신 HTML5 `<input type="range">` 사용

새로운 네이티브 기능 추가 시 항상 웹 대체 방안을 고려해야 합니다.

### 상태 관리

전역 상태 관리 라이브러리를 사용하지 않습니다. 각 화면이 자체 상태를 관리합니다:
- HomeScreen: `useFocusEffect` 훅으로 화면 포커스 시 기록 로드
- AddChargeScreen: 로컬 폼 상태, 제출 시 storage에 저장
- 두 화면 모두 storage 유틸리티 함수로 데이터 새로고침

### 스타일링

모든 스타일은 React Native StyleSheet API의 인라인 스타일 객체를 사용합니다. 외부 CSS나 스타일링 라이브러리는 없습니다. 주요 색상:
- Primary background: `#0f1419` (진한 파란색)
- Accent: `#1fb28a` (청록색)
- Cards: `#1a2332` (밝은 진한 파란색)


## 구현된 주요 기능

### 1. Supabase 인증 시스템 ✅ (2026-01-03)
- 이메일/비밀번호 기반 인증
- 사용자별 데이터 격리 (Row Level Security)
- AuthContext를 통한 전역 인증 상태 관리
- LoginScreen 구현
- `src/contexts/AuthContext.tsx`: 인증 컨텍스트
- `src/screens/LoginScreen.tsx`: 로그인 화면
- `docs/SETUP.md`: Supabase 설정 가이드

### 2. 차트 시각화 시스템 ✅ (2026-01-03)
- **4가지 차트 구현**:
  - 월별 추세 차트 (LineChart): 최근 6개월 충전비 추세
  - 충전기 타입 분포 (PieChart): 완속/급속/슈퍼차저 비율
  - 요일별 패턴 (BarChart): 요일별 평균 충전 횟수
  - 상세 통계 카드: 총 충전 횟수, 평균 비용, 가장 많이 사용한 충전소 등

- **플랫폼별 최적화**:
  - 웹: 커스텀 SVG 차트 (`SimpleLineChart.tsx`) - react-gifted-charts 버그 회피
  - 모바일: react-native-gifted-charts 사용 (안정적)

- **구현 파일**:
  - `src/components/statistics/MonthlyTrendChart.tsx`: 월별 추세
  - `src/components/statistics/ChargerTypeChart.tsx`: 타입 분포
  - `src/components/statistics/WeekdayPatternChart.tsx`: 요일 패턴
  - `src/components/statistics/DetailedStatsCard.tsx`: 상세 통계
  - `src/components/statistics/SimpleLineChart.tsx`: 웹 전용 SVG 차트
  - `src/components/statistics/ErrorBoundary.tsx`: 에러 처리
  - `src/utils/chartDataProcessor.ts`: 차트 데이터 계산 로직

### 3. 다크/라이트 테마 시스템 ✅
- Context API 기반 전역 테마 관리 (`src/contexts/ThemeContext.tsx`)
- AsyncStorage를 통한 사용자 선호 테마 저장
- 모든 화면과 컴포넌트에서 동적 스타일 적용
- 설정 화면에서 테마 토글 가능

### 4. 차량 등록 기능 ✅
- 제조사 선택: 현대, 기아, 테슬라, BMW, 메르세데스-벤츠, 제네시스, 볼보, 폴스타 등
- 모델 선택: 각 제조사별 전기차 모델 리스트
- 배터리 용량 자동 입력
- 직접 입력 옵션 (목록에 없는 차량)
- 차량 별명, 차량 번호 등 상세 정보 저장
- `src/utils/vehicleData.ts`: 전기차 모델 데이터베이스
- `src/components/SelectModal.tsx`: 선택 UI 컴포넌트

### 5. OCR 영수증 스캔 기능 ✅
- **Gemini Vision API** 사용 (높은 정확도)
- 이미지 자동 분석 및 파싱
- 자동 추출 필드: 날짜, 장소, 충전량, 단가, 총액, 충전기 타입
- 스캔 결과 미리보기 및 수정 가능
- `src/services/visionService.ts`: Gemini Vision API 연동
- `src/screens/AddChargeScreen.tsx`: 스캔 기능 통합

### 6. 웹 모바일 최적화 ✅
- 모바일 프레임 (최대 430x932px, iPhone 14 Pro Max 사이즈)
- PWA 지원 (홈 화면에 추가 가능)
- Viewport 최적화
- 반응형 디자인
- Vercel 배포 지원

## 화면 구조

1. **LoginScreen** (`src/screens/LoginScreen.tsx`)
   - 이메일/비밀번호 로그인
   - 회원가입 링크

2. **HomeScreen** (`src/screens/HomeScreen.tsx`)
   - **📋 기록 탭**:
     - 월별 충전 통계 (총 비용, 총 충전량, 충전 횟수)
     - 충전 기록 리스트 (최신순 정렬)
   - **📊 통계 탭** (2026-01-03 추가):
     - 월별 추세 차트
     - 충전기 타입 분포 차트
     - 요일별 패턴 차트
     - 상세 통계 카드
   - 설정 버튼 (⚙️)

3. **AddChargeScreen** (`src/screens/AddChargeScreen.tsx`)
   - 예상 충전 금액 카드
   - 영수증 스캔 버튼 (📷) - Gemini Vision API
   - 날짜, 장소, 충전기 타입, 충전량, 단가, 배터리 % 입력
   - 저장/삭제 기능

4. **SettingsScreen** (`src/screens/SettingsScreen.tsx`)
   - 다크 모드 토글
   - 차량 정보 표시/등록
   - 로그아웃 버튼

5. **VehicleSettingsScreen** (`src/screens/VehicleSettingsScreen.tsx`)
   - 제조사 선택 모달
   - 모델 선택 모달
   - 차량 정보 입력 폼
   - 저장/삭제

## 영수증 스캔 사용법

영수증 스캔 기능은 **Gemini Vision API**를 사용합니다:

- **장점**:
  - 높은 정확도 (AI 기반 이미지 분석)
  - 자동 필드 추출 (날짜, 장소, 충전량, 단가, 총액, 충전기 타입)
  - 한국어 완벽 지원
  - 웹/iOS/Android 모두 지원

- **API 키 설정**: `.env` 파일에 `EXPO_PUBLIC_GEMINI_API_KEY` 필요
- **구현 파일**: `src/services/visionService.ts`

## 최근 버그 수정 (2026-01-03)

1. **차트 hover 에러 해결**:
   - 문제: 웹에서 차트에 마우스 hover 시 `pointerShiftX` 에러 발생
   - 해결: 웹 전용 커스텀 SVG 차트 구현 (`SimpleLineChart.tsx`)
   - 영향: 웹과 모바일 플랫폼별 최적화

2. **HomeScreen 안내 메시지 버그**:
   - 문제: 충전 기록이 있는데도 "이번 달의 충전 기록이 없습니다" 메시지 표시
   - 해결: 조건부 렌더링 추가 (`summary.totalRecords === 0`)

---

# 다음 개발 계획

> **작성일**: 2026-01-03
> **상세 계획**: `/Users/seokjaehong/.claude/plans/validated-sauteeing-rabin.md` 참조

## 우선순위 1: 충전소 통합 검색 시스템 (10-14시간)

### Part A: 즐겨찾기 자동완성 (5-7시간)
- 3회 이상 방문한 충전소 자동 즐겨찾기 등록
- 장소 입력 시 자동완성 드롭다운 표시
- 충전소별 통계: 평균 단가, 방문 횟수, 마지막 방문

**새로 생성할 파일**:
- `src/utils/favoriteLocations.ts`: 충전소 통계 계산
- `src/components/LocationInput.tsx`: 자동완성 입력 필드
- `src/components/LocationSuggestionList.tsx`: 드롭다운 목록

### Part B: 공공 충전소 DB 검색 (5-7시간)
- 환경부 전기차 충전소 정보 API 연동
- 검색어로 충전소 검색
- 충전소명, 주소, 충전기 타입, 사용 가능 여부 표시

**새로 생성할 파일**:
- `src/services/chargingStationService.ts`: API 연동
- `src/components/PublicStationSearchModal.tsx`: 검색 모달

**수정할 파일**:
- `src/screens/AddChargeScreen.tsx`: LocationInput 통합
- `src/types/index.ts`: 타입 정의 추가

---

## 📝 새로운 설계 지시

> **여기에 새로운 기능 요구사항이나 설계 변경사항을 작성해주세요.**
> 작성 후 Claude가 자동으로 구현 계획을 수립합니다.

### 요구사항:

(여기에 작성)

### 기술적 제약사항:

(있다면 여기에 작성)

### 참고사항:

(있다면 여기에 작성)