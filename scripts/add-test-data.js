/**
 * 차트 테스트를 위한 샘플 충전 기록 생성 스크립트
 *
 * 사용법:
 * 1. .env 파일에 EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY가 설정되어 있어야 함
 * 2. 로그인한 상태에서 브라우저 콘솔(F12)을 열고 이 스크립트를 실행
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ .env 파일에 EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 테스트용 충전 기록 데이터 생성
function generateTestRecords(userId, vehicleId) {
  const now = new Date();
  const records = [];

  // 최근 6개월 동안의 데이터 생성
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const recordsPerMonth = Math.floor(Math.random() * 5) + 3; // 월별 3-7개 기록

    for (let i = 0; i < recordsPerMonth; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);

      const chargerTypes = ['완속', '급속', '슈퍼차저'];
      const chargerType = chargerTypes[Math.floor(Math.random() * chargerTypes.length)];

      // 충전기 타입별 평균 충전량과 단가
      let chargeAmount, unitPrice;
      if (chargerType === '완속') {
        chargeAmount = Math.random() * 30 + 20; // 20-50 kWh
        unitPrice = Math.random() * 50 + 200; // 200-250원
      } else if (chargerType === '급속') {
        chargeAmount = Math.random() * 40 + 30; // 30-70 kWh
        unitPrice = Math.random() * 100 + 300; // 300-400원
      } else {
        chargeAmount = Math.random() * 50 + 40; // 40-90 kWh
        unitPrice = Math.random() * 150 + 400; // 400-550원
      }

      const totalCost = Math.round(chargeAmount * unitPrice);

      const locations = [
        '서울 강남구 테헤란로',
        '서울 서초구 서초대로',
        '경기 성남시 분당구',
        '서울 송파구 올림픽로',
        '경기 수원시 영통구',
        '서울 마포구 월드컵로'
      ];

      records.push({
        user_id: userId,
        vehicle_id: vehicleId,
        date: date.toISOString().split('T')[0],
        location: locations[Math.floor(Math.random() * locations.length)],
        charger_type: chargerType,
        charge_amount: Math.round(chargeAmount * 10) / 10,
        unit_price: Math.round(unitPrice),
        total_cost: totalCost,
        battery_before: Math.floor(Math.random() * 30) + 10, // 10-40%
        battery_after: Math.floor(Math.random() * 30) + 70,  // 70-100%
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  // 날짜순 정렬 (최신순)
  return records.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function addTestData() {
  console.log('🔐 사용자 인증 필요...');
  console.log('');
  console.log('📧 이메일을 입력하세요:');

  // Node.js 환경에서 사용자 입력 받기
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('이메일: ', async (email) => {
    readline.question('비밀번호: ', async (password) => {
      readline.close();

      try {
        // 로그인
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (authError) {
          console.error('❌ 로그인 실패:', authError.message);
          return;
        }

        console.log('✅ 로그인 성공:', authData.user.email);
        const userId = authData.user.id;

        // 차량 정보 확인
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', userId)
          .limit(1);

        if (vehicleError) {
          console.error('❌ 차량 정보 조회 실패:', vehicleError.message);
          return;
        }

        let vehicleId;
        if (!vehicles || vehicles.length === 0) {
          console.log('⚠️  등록된 차량이 없습니다. 테스트 차량을 생성합니다...');

          // 테스트 차량 생성
          const { data: newVehicle, error: createError } = await supabase
            .from('vehicles')
            .insert({
              user_id: userId,
              manufacturer: '현대',
              model: '아이오닉 5',
              battery_capacity: 77.4,
              nickname: '내 아이오닉',
              license_plate: '123가4567',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ 차량 생성 실패:', createError.message);
            return;
          }

          vehicleId = newVehicle.id;
          console.log('✅ 테스트 차량 생성 완료:', newVehicle.model);
        } else {
          vehicleId = vehicles[0].id;
          console.log('✅ 차량 정보 확인:', vehicles[0].manufacturer, vehicles[0].model);
        }

        // 테스트 데이터 생성
        console.log('📊 테스트 충전 기록 생성 중...');
        const testRecords = generateTestRecords(userId, vehicleId);
        console.log(`   생성된 기록 수: ${testRecords.length}개`);

        // 데이터 삽입
        const { data, error } = await supabase
          .from('charge_records')
          .insert(testRecords);

        if (error) {
          console.error('❌ 데이터 삽입 실패:', error.message);
          return;
        }

        console.log('');
        console.log('✅ 테스트 데이터 추가 완료!');
        console.log('');
        console.log('📈 생성된 데이터 요약:');
        console.log(`   - 총 기록 수: ${testRecords.length}개`);
        console.log(`   - 기간: 최근 6개월`);
        console.log(`   - 충전기 타입: 완속, 급속, 슈퍼차저 (랜덤)`);
        console.log(`   - 장소: 서울/경기 지역 (랜덤)`);
        console.log('');
        console.log('🎯 이제 브라우저를 새로고침하고 "📊 통계" 탭을 확인하세요!');

        // 로그아웃
        await supabase.auth.signOut();
      } catch (err) {
        console.error('❌ 오류 발생:', err.message);
      }
    });
  });
}

// 스크립트 실행
addTestData();
