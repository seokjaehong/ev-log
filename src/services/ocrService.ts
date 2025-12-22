import { createWorker } from 'tesseract.js';
import { OCRResult } from '../types';

/**
 * 이미지에서 텍스트를 추출하는 OCR 기능
 * Tesseract.js 사용 (무료, 오프라인 가능, 클라이언트 측 실행)
 */
export const performOCR = async (imageUri: string): Promise<OCRResult> => {
  console.log('Tesseract.js OCR 시작...');

  let worker;

  try {
    // Tesseract worker 생성
    worker = await createWorker('kor+eng', 1, {
      logger: (m) => {
        // 진행 상황 로그
        if (m.status === 'recognizing text') {
          console.log(`OCR 진행: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log('Tesseract worker 초기화 완료');

    // OCR 수행
    const { data } = await worker.recognize(imageUri);

    console.log('OCR 완료 - 텍스트 길이:', data.text.length);
    console.log('신뢰도:', data.confidence);

    const result: OCRResult = {
      fullText: data.text,
      confidence: data.confidence / 100, // Tesseract는 0-100 범위, 우리는 0-1 범위
    };

    return result;
  } catch (error) {
    console.error('Tesseract OCR 오류:', error);
    throw error;
  } finally {
    // Worker 종료
    if (worker) {
      await worker.terminate();
      console.log('Tesseract worker 종료');
    }
  }
};

/**
 * OCR 결과 텍스트를 줄 단위로 분리
 */
export const splitTextIntoLines = (text: string): string[] => {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};
