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

1. **Storage 레이어** (`src/utils/storage.ts`): 모든 데이터는 AsyncStorage에 `@ev_log_charges` 키로 저장됨
2. **타입 시스템** (`src/types/index.ts`): `ChargeRecord`, `MonthlySummary`, 네비게이션 타입 정의
3. **Screen 레이어**: HomeScreen과 AddChargeScreen이 UI 상태를 관리하고 storage 작업 실행
4. **Component 레이어**: 재사용 가능한 UI 컴포넌트 (MonthlySummary, ChargeListItem)

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

### 1. 다크/라이트 테마 시스템 ✅
- Context API 기반 전역 테마 관리 (`src/contexts/ThemeContext.tsx`)
- AsyncStorage를 통한 사용자 선호 테마 저장
- 모든 화면과 컴포넌트에서 동적 스타일 적용
- 설정 화면에서 테마 토글 가능

### 2. 차량 등록 기능 ✅
- 제조사 선택: 현대, 기아, 테슬라, BMW, 메르세데스-벤츠, 제네시스, 볼보, 폴스타 등
- 모델 선택: 각 제조사별 전기차 모델 리스트
- 배터리 용량 자동 입력
- 직접 입력 옵션 (목록에 없는 차량)
- 차량 별명, 차량 번호 등 상세 정보 저장
- `src/utils/vehicleData.ts`: 전기차 모델 데이터베이스
- `src/components/SelectModal.tsx`: 선택 UI 컴포넌트

### 3. OCR 영수증 스캔 기능 ✅
- **Tesseract.js** 사용 (무료, 오프라인 가능, 클라이언트 측 실행)
- 한국어 + 영어 동시 인식
- 카메라 촬영 또는 앨범에서 이미지 선택
- 자동 파싱: 날짜, 장소, 충전량, 단가, 총액, 충전기 타입
- 스캔 결과 미리보기 모달
- 인식된 정보 자동 적용
- `src/services/ocrService.ts`: Tesseract.js OCR 처리
- `src/utils/receiptParser.ts`: 영수증 텍스트 파싱 로직
- `src/components/ScanResultModal.tsx`: 결과 표시 모달

### 4. 웹 모바일 최적화 ✅
- 모바일 프레임 (최대 430x932px, iPhone 14 Pro Max 사이즈)
- PWA 지원 (홈 화면에 추가 가능)
- Viewport 최적화
- 반응형 디자인

## 화면 구조

1. **HomeScreen** (`src/screens/HomeScreen.tsx`)
   - 월별 충전 통계 (총 비용, 총 충전량, 충전 횟수)
   - 충전 기록 리스트 (최신순 정렬)
   - 설정 버튼 (⚙️)

2. **AddChargeScreen** (`src/screens/AddChargeScreen.tsx`)
   - 예상 충전 금액 카드
   - 영수증 스캔 버튼 (📷)
   - 날짜, 장소, 충전기 타입, 충전량, 단가, 배터리 % 입력
   - 저장/삭제 기능

3. **SettingsScreen** (`src/screens/SettingsScreen.tsx`)
   - 다크 모드 토글
   - 차량 정보 표시/등록

4. **VehicleSettingsScreen** (`src/screens/VehicleSettingsScreen.tsx`)
   - 제조사 선택 모달
   - 모델 선택 모달
   - 차량 정보 입력 폼
   - 저장/삭제

## OCR 사용법

OCR 기능은 Tesseract.js를 사용하여 클라이언트에서 직접 실행됩니다:

- **장점**:
  - 무료 (API 비용 없음)
  - 오프라인에서도 작동
  - 개인정보 보호 (이미지가 외부 서버로 전송 안됨)
  - 웹/iOS/Android 모두 지원

- **언어**: 한국어(kor) + 영어(eng)
- **성능**: 첫 실행 시 언어 데이터 다운로드 (~10MB), 이후 캐시됨 