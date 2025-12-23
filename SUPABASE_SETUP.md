# Supabase 데이터베이스 설정 가이드

코드 구현이 완료되었습니다! 이제 Supabase에서 데이터베이스 테이블과 테스트 사용자를 설정해야 합니다.

## 1. Supabase SQL Editor 열기

1. https://app.supabase.com 접속
2. 프로젝트 선택 (esxwwpgpruugurjvdets)
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭

## 2. 데이터베이스 테이블 생성

아래 SQL을 복사하여 SQL Editor에 붙여넣고 **Run** 클릭:

```sql
-- charge_records 테이블 생성
CREATE TABLE charge_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  charger_type TEXT NOT NULL CHECK (charger_type IN ('완속', '급속', '슈퍼차저')),
  charge_amount DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  battery_percent INTEGER CHECK (battery_percent >= 0 AND battery_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- vehicles 테이블 생성
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manufacturer TEXT NOT NULL,
  nickname TEXT NOT NULL,
  model_name TEXT NOT NULL,
  battery_capacity DECIMAL(10, 2) NOT NULL,
  license_plate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_charge_records_user_id ON charge_records(user_id);
CREATE INDEX idx_charge_records_date ON charge_records(user_id, date DESC);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- charge_records 테이블에 트리거 적용
CREATE TRIGGER update_charge_records_updated_at
  BEFORE UPDATE ON charge_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- vehicles 테이블에 트리거 적용
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. Row Level Security (RLS) 정책 설정

새 쿼리를 열고 아래 SQL을 실행 (**매우 중요!** - 유저별 데이터 격리):

```sql
-- RLS 활성화
ALTER TABLE charge_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- charge_records 정책
CREATE POLICY "Users can view own charge records"
  ON charge_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charge records"
  ON charge_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charge records"
  ON charge_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own charge records"
  ON charge_records FOR DELETE
  USING (auth.uid() = user_id);

-- vehicles 정책
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. 이메일 확인 비활성화

1. 왼쪽 메뉴에서 **Authentication** > **Settings** 클릭
2. **Email** 탭에서 스크롤 다운
3. "Enable email confirmations" **체크 해제**
4. **Save** 클릭

## 5. 테스트 사용자 생성

### 방법 1: Supabase Dashboard (권장)

1. 왼쪽 메뉴에서 **Authentication** > **Users** 클릭
2. **Add user** > **Create new user** 클릭
3. 사용자 1:
   - Email: `user1@test.com`
   - Password: `password123`
   - **Auto Confirm User** 체크
4. **Create user** 클릭
5. 사용자 2 생성 (선택사항):
   - Email: `user2@test.com`
   - Password: `password123`
   - **Auto Confirm User** 체크

### 방법 2: SQL Editor

```sql
-- 테스트 사용자 생성 (비밀번호는 자동으로 해시됨)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user1@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), ''),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'user2@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '');
```

참고: 대시보드에서 생성하는 것이 더 간단하고 안전합니다.

## 6. 설정 확인

### 테이블 확인
1. **Table Editor** 메뉴 클릭
2. `charge_records`와 `vehicles` 테이블이 보이는지 확인
3. 각 테이블 열어서 컬럼 구조 확인

### RLS 정책 확인
1. **Table Editor** > `charge_records` 테이블 선택
2. 오른쪽 상단 **⚙️** 아이콘 클릭
3. **Policies** 탭에서 4개의 정책 확인
4. `vehicles` 테이블도 동일하게 확인

### 사용자 확인
1. **Authentication** > **Users**
2. 생성한 사용자 목록 확인

## 7. 로컬 테스트 실행

터미널에서:

```bash
npm run web
```

브라우저가 열리면:
1. 로그인 화면이 나타남
2. `user1@test.com` / `password123` 로그인
3. 충전 기록 추가 테스트
4. 차량 등록 테스트
5. 로그아웃 후 `user2@test.com`로 로그인
6. User1의 데이터가 보이지 않는지 확인 (데이터 격리 테스트)

## 문제 해결

### "JWT expired" 오류
- Supabase 프로젝트 설정에서 JWT 유효 기간 확인
- 로그아웃 후 다시 로그인

### "RLS policy violation" 오류
- RLS 정책이 올바르게 설정되었는지 확인
- SQL Editor에서 정책 재실행

### "relation does not exist" 오류
- 테이블이 제대로 생성되었는지 Table Editor에서 확인
- SQL 스크립트 재실행

### 로그인 실패
- 이메일 확인 비활성화 여부 확인
- 사용자가 제대로 생성되었는지 확인
- 브라우저 콘솔에서 에러 로그 확인

## 다음 단계

설정이 완료되면:
1. ✅ 로컬 테스트 완료
2. ✅ Vercel 환경 변수 설정
3. ✅ 배포 및 프로덕션 테스트

환경 변수 설정 방법은 DEPLOYMENT.md를 참조하세요!
