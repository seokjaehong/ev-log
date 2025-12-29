# 배포 체크리스트

## 배포 전 필수 사항

### 1. 버전 관리 (Semantic Versioning)

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

---

## 배포 단계

### Step 1: 버전 결정
현재 변경사항을 검토하고 적절한 버전 증가를 결정합니다.

**예시**:
- 🐛 버그 수정 (삭제 버튼 오류 등) → PATCH (1.0.0 → 1.0.1)
- ✨ 새 기능 추가 (Footer, 새로운 화면 등) → MINOR (1.0.0 → 1.1.0)
- 💥 Breaking Change (구조 대변경, API 변경) → MAJOR (1.0.0 → 2.0.0)

### Step 2: 버전 업데이트
```bash
# package.json과 app.json의 version 필드를 수동으로 수정
```

### Step 3: 변경사항 확인
```bash
git status
git diff package.json app.json
```

### Step 4: 환경 변수 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env.example`에 실제 키가 없는가?
- [ ] Vercel 환경 변수가 모두 설정되어 있는가?

### Step 5: 빌드 테스트 (선택사항)
```bash
npm run build:web
```

### Step 6: Git 커밋
```bash
git add package.json app.json
git commit -m "Bump version to 1.0.1"

# 다른 변경사항 커밋
git add .
git commit -m "기능 설명"
```

### Step 7: Git 푸시
```bash
git push origin main
```

### Step 8: Vercel 배포 확인
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Deployments 탭에서 배포 상태 확인
4. 배포 완료 후 URL 접속하여 테스트

---

## 배포 후 확인사항

### 기능 테스트
- [ ] 로그인/로그아웃
- [ ] 충전 기록 추가/수정/삭제
- [ ] 영수증 스캔 (Gemini Vision API)
- [ ] 월별 통계
- [ ] 다크/라이트 테마
- [ ] 차량 정보 관리
- [ ] **설정 화면 Footer 버전 확인** (현재 버전 표시 확인)

### 버전 확인
- [ ] 설정 화면 하단에 올바른 버전이 표시되는가? (예: "EV LOG v1.0.1")

### 플랫폼 테스트
- [ ] 웹 브라우저
- [ ] iOS (시뮬레이터 또는 실제 기기)
- [ ] Android (에뮬레이터 또는 실제 기기)

---

## 버전 히스토리 예시

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.1 | 2025-12-29 | 🐛 웹 환경 삭제 버튼 오류 수정, Footer 추가 |
| 1.0.0 | 2025-12-28 | 🎉 초기 배포 (Gemini Vision API, Supabase 인증) |

---

## 자동화 개선 계획 (향후)

### npm scripts 추가 고려
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

---

## 참고 자료

- [Semantic Versioning 2.0.0](https://semver.org/lang/ko/)
- [npm version 명령어](https://docs.npmjs.com/cli/v8/commands/npm-version)
- [Vercel 배포 문서](https://vercel.com/docs)
