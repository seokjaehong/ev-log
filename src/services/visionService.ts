import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChargeRecordAnalysis } from '../types';

/**
 * Gemini Vision API를 사용한 충전 영수증 이미지 분석
 * 단순 OCR을 넘어 이미지 타입, 충전 상태, 맥락을 이해하는 AI
 */
export async function analyzeChargingReceipt(
  imageUri: string
): Promise<ChargeRecordAnalysis> {
  // API 키 확인
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'Gemini API Key가 설정되지 않았습니다.\n' +
      '.env 파일에 EXPO_PUBLIC_GEMINI_API_KEY를 설정해주세요.\n' +
      'https://aistudio.google.com/app/apikey 에서 발급받을 수 있습니다.'
    );
  }

  // Gemini AI 초기화
  const genAI = new GoogleGenerativeAI(apiKey);

  // Gemini 2.5 Flash 모델 사용 (무료 티어: 15 req/min, 1,500 req/day)
  const generationConfig = {
    temperature: 0, // 정확성 최우선 - 매번 같은 결과
    topP: 1,
    topK: 1,
  };

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig,
  });

  // 이미지를 base64로 변환
  const imageBase64 = await imageToBase64(imageUri);

  // Vision AI 프롬프트
  const prompt = `당신은 전기차 충전 영수증 분석 전문가입니다.

이미지를 분석하고 다음 형식의 JSON으로 응답하세요:

{
  "imageType": "charger_screen" | "vehicle_screen" | "paper_receipt" | "unknown",
  "isValid": true | false,
  "chargingStatus": "completed" | "in_progress" | "not_started" | "unknown",
  "chargerType": "완속" | "급속" | "슈퍼차저" | "unknown",
  "location": "환경부 급속충전소",
  "rawScreenDate": "25.12.24",
  "rawScreenTime": "14:39",
  "date": "2024-10-25T14:30:00",
  "chargeAmount": 22.78,
  "unitPrice": 347.3,
  "totalCost": 7908,
  "batteryPercent": 90,
  "elapsedTime": "00:25:30",
  "remainingTime": "00:24:00",
  "reasoning": "이 이미지는 충전 완료 화면입니다. '충전완료' 텍스트와 경과시간이 표시되어 있습니다.",
  "confidence": 0.95
}

**중요 규칙**:
1. **이미지 타입 판별**:
   - "charger_screen": 충전기 화면 (KEPCO, 환경부 등 충전기 UI)
   - "vehicle_screen": 차량 내부 화면 (계기판, 인포테인먼트)
   - "paper_receipt": 종이 영수증
   - "unknown": 알 수 없음

2. **유효성 판단**:
   - isValid: true = 충전 영수증으로 사용 가능 (충전기 화면 또는 종이 영수증)
   - isValid: false = 차량 내부 화면이거나 관련 없는 이미지

3. **충전 상태 추론**:
   - "completed": "충전완료", "충전종료" 또는 경과시간만 있는 경우
   - "in_progress": "충전중", "남은 시간" 있는 경우
   - "not_started": 충전 시작 전
   - "unknown": 알 수 없음

4. **충전기 타입 인식**:
   - "급속": KEPCO, 환경부, DC 충전기, 급속충전소
   - "완속": AC 충전기, 완속충전소
   - "슈퍼차저": Tesla Supercharger
   - "unknown": 알 수 없음

5. **날짜/시간 추출 - 매우 신중하게 읽으세요**:

   **STEP 1**: 화면 상단 왼쪽에서 날짜/시간을 찾으세요
   - 날짜는 "YY.MM.DD" 형식 (예: "25.12.24")
   - 시간은 "HH:MM" 형식 (예: "14:39")

   **STEP 2**: 화면에 보이는 날짜를 **그대로** rawScreenDate에 적으세요
   - 마지막 2자리(일)를 매우 조심히 읽으세요
   - "24" = 2와 4 (24일)
   - "31" = 3과 1 (31일)
   - 확실하지 않으면 다시 한 번 확인하세요

   **STEP 3**: 화면에 보이는 시간을 **그대로** rawScreenTime에 적으세요

   **STEP 4**: rawScreenDate와 rawScreenTime을 ISO 8601 형식으로 변환하여 date에 적으세요
   - "YY.MM.DD HH:MM" → "20YY-MM-DDTHH:MM:00"
   - 예: rawScreenDate="25.12.24", rawScreenTime="14:39" → date="2025-12-24T14:39:00"

   **중요**:
   - 날짜가 화면에 없으면 rawScreenDate, rawScreenTime, date 모두 null
   - 추측하지 마세요 - 화면에 보이는 그대로만 적으세요

6. **기타 데이터 추출**:
   - 모든 숫자는 number 타입으로 (문자열 아님)
   - 경과/남은 시간은 "HH:MM:SS" 형식
   - 한국어 텍스트 정확히 읽기

7. **추론 설명**:
   - reasoning 필드에 왜 그렇게 판단했는지 한국어로 간단히 설명
   - 어떤 텍스트나 UI 요소를 보고 판단했는지 명시

8. **신뢰도**:
   - confidence: 0.0 ~ 1.0 (0% ~ 100%)
   - 명확한 충전 완료 화면: 0.9 이상
   - 충전 중 화면: 0.8 이상
   - 차량 내부 화면: isValid: false, confidence: 0.7 이상

**JSON만 응답하세요. 다른 설명은 필요 없습니다.**`;

  try {
    // Vision AI 실행
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // JSON 추출 (markdown 코드 블록 제거)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini가 올바른 JSON 형식으로 응답하지 않았습니다');
    }

    const analysis: ChargeRecordAnalysis = JSON.parse(jsonMatch[0]);

    return analysis;
  } catch (error) {
    console.error('Gemini Vision API 오류:', error);
    throw new Error(
      `이미지 분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

/**
 * 이미지를 base64로 변환
 */
async function imageToBase64(imageUri: string): Promise<string> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // "data:image/jpeg;base64," 제거
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => {
        reject(new Error('이미지를 base64로 변환하는 중 오류가 발생했습니다'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('이미지 변환 오류:', error);
    throw new Error('이미지를 불러오는 중 오류가 발생했습니다');
  }
}
