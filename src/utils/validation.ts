// 유효성 검사 결과 인터페이스
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 이메일 유효성 검사
 * RFC 5322 표준 기반의 간소화된 정규식 사용
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: '이메일을 입력해주세요.',
    };
  }

  // 기본적인 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: '올바른 이메일 형식이 아닙니다.',
    };
  }

  return { isValid: true };
};

/**
 * 비밀번호 유효성 검사
 * - 최소 8자
 * - 영문과 숫자 조합 필수
 * - 특수문자 선택사항 (권장)
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      error: '비밀번호를 입력해주세요.',
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: '비밀번호는 최소 8자 이상이어야 합니다.',
    };
  }

  // 영문 포함 확인
  const hasLetter = /[a-zA-Z]/.test(password);
  // 숫자 포함 확인
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      error: '비밀번호는 영문과 숫자를 모두 포함해야 합니다.',
    };
  }

  return { isValid: true };
};

/**
 * 비밀번호 확인 일치 검사
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return {
      isValid: false,
      error: '비밀번호 확인을 입력해주세요.',
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: '비밀번호가 일치하지 않습니다.',
    };
  }

  return { isValid: true };
};

/**
 * 비밀번호 강도 계산 (선택적 사용)
 * @returns 'weak' | 'medium' | 'strong'
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password) return 'weak';

  let strength = 0;

  // 길이 체크
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 영문 소문자
  if (/[a-z]/.test(password)) strength++;

  // 영문 대문자
  if (/[A-Z]/.test(password)) strength++;

  // 숫자
  if (/[0-9]/.test(password)) strength++;

  // 특수문자
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};
