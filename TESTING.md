# 저장 기능 테스트 가이드

## 웹 브라우저에서 테스트하기

### 1. 앱 실행
```bash
npm run web
```

### 2. 브라우저 개발자 도구 열기
- Chrome/Edge: F12 또는 Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- Console 탭으로 이동

### 3. 충전 기록 추가 테스트

#### Step 1: 새 기록 추가 화면으로 이동
1. 홈 화면에서 "+" 버튼 클릭
2. "새 충전 기록 추가" 화면 확인

#### Step 2: 데이터 입력
- **날짜**: 오늘 날짜 (자동 설정됨)
- **장소**: "테슬라 슈퍼차저 성수"
- **충전기 타입**: "슈퍼차저" 선택
- **충전량**: 40 kWh (슬라이더 조정)
- **단가**: 350원 (슬라이더 조정)
- **배터리 %**: 85 (선택사항)

#### Step 3: 저장 버튼 클릭
1. "💾 저장하기" 버튼 클릭
2. 자동으로 홈 화면으로 돌아가는지 확인
3. 방금 추가한 기록이 목록에 표시되는지 확인

### 4. LocalStorage 확인 (브라우저 개발자 도구)

#### Application/Storage 탭에서 확인:
1. 개발자 도구 → Application (또는 Storage) 탭
2. Local Storage → http://localhost:8081 (또는 실행 중인 URL)
3. `@ev_log_charges` 키 확인
4. 저장된 JSON 데이터 확인

#### 또는 Console에서 확인:
```javascript
// 저장된 모든 충전 기록 보기
JSON.parse(localStorage.getItem('@ev_log_charges'))

// 마지막 저장 확인
const records = JSON.parse(localStorage.getItem('@ev_log_charges'));
console.table(records);
```

### 5. 월별 통계 확인
- 홈 화면 상단의 월별 통계 카드 확인
- 총 비용, 총 충전량, 충전 횟수가 업데이트되었는지 확인

## 예상 결과

### 성공적인 저장 시:
✅ 저장 후 자동으로 홈 화면으로 이동
✅ 홈 화면 목록에 새 기록 표시
✅ 월별 통계 업데이트
✅ LocalStorage에 데이터 저장됨

### 오류 발생 시:
1. **"장소를 입력해주세요" 알림**
   - 장소 필드가 비어있음
   - 해결: 장소 입력 후 다시 저장

2. **"저장 중 오류가 발생했습니다" 알림**
   - Console 탭에서 에러 로그 확인
   - 에러 내용을 복사해서 보고

## 자동화 테스트 스크립트

브라우저 Console에 다음 코드를 붙여넣어 자동으로 테스트할 수 있습니다:

```javascript
// 테스트 데이터 생성 및 저장
async function testSaveFunction() {
  console.log('=== 저장 기능 테스트 시작 ===');

  // 1. 기존 데이터 확인
  const before = localStorage.getItem('@ev_log_charges');
  console.log('저장 전 데이터:', before ? JSON.parse(before).length + '개' : '없음');

  // 2. 테스트 데이터 추가
  const testRecord = {
    id: `test-${Date.now()}`,
    date: new Date().toISOString(),
    location: '테스트 충전소',
    chargerType: '급속',
    chargeAmount: 40,
    unitPrice: 300,
    totalCost: 12000,
    batteryPercent: 85
  };

  // 3. 저장
  const existing = JSON.parse(localStorage.getItem('@ev_log_charges') || '[]');
  existing.push(testRecord);
  existing.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  localStorage.setItem('@ev_log_charges', JSON.stringify(existing));

  // 4. 저장 확인
  const after = JSON.parse(localStorage.getItem('@ev_log_charges'));
  console.log('저장 후 데이터:', after.length + '개');
  console.log('마지막 저장 항목:', after[0]);

  // 5. 결과
  if (after.length > (before ? JSON.parse(before).length : 0)) {
    console.log('✅ 저장 성공!');
    console.table(after);
  } else {
    console.log('❌ 저장 실패!');
  }

  console.log('=== 테스트 완료 ===');
  console.log('페이지를 새로고침하면 HomeScreen에 데이터가 표시됩니다.');
}

// 테스트 실행
testSaveFunction();
```

## 데이터 초기화 (필요시)

테스트 후 모든 데이터를 삭제하려면:

```javascript
// 모든 충전 기록 삭제
localStorage.removeItem('@ev_log_charges');
console.log('모든 기록이 삭제되었습니다.');

// 또는 모든 앱 데이터 삭제
localStorage.clear();
console.log('모든 앱 데이터가 삭제되었습니다.');
```

## 문제 해결

### 저장이 안되는 경우:
1. Console에서 에러 메시지 확인
2. LocalStorage 용량 확인 (보통 5-10MB 제한)
3. 브라우저 시크릿 모드 확인 (LocalStorage 비활성화 가능)
4. 브라우저 쿠키 설정 확인

### 목록에 표시가 안되는 경우:
1. 페이지 새로고침 (F5)
2. HomeScreen의 useFocusEffect 훅 동작 확인
3. Console에서 데이터 직접 확인

## 추가 테스트 항목

- [ ] 새 기록 저장
- [ ] 기존 기록 수정
- [ ] 기록 삭제
- [ ] 여러 개 기록 추가
- [ ] 날짜 정렬 확인 (최신순)
- [ ] 월별 통계 계산 확인
- [ ] 페이지 새로고침 후 데이터 유지 확인
