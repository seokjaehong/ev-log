/**
 * Supabase Auth 에러를 한국어 메시지로 변환
 * Supabase Auth 에러 코드 및 메시지 매핑
 */
export const getAuthErrorMessage = (error: any): string => {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다.';
  }

  // error.code 또는 error.message에서 에러 타입 파악
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  // 이메일 관련 에러
  if (errorCode === 'email_exists' || errorMessage.includes('already registered')) {
    return '이미 등록된 이메일입니다.';
  }

  if (errorCode === 'invalid_email' || errorMessage.toLowerCase().includes('invalid')) {
    // Supabase 설정 문제일 수 있으므로 더 자세한 메시지 제공
    return '이메일 주소를 확인해주세요. 일부 이메일 도메인은 사용할 수 없을 수 있습니다.';
  }

  if (errorMessage.includes('email not confirmed')) {
    return '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
  }

  // 비밀번호 관련 에러
  if (errorCode === 'weak_password' || errorMessage.includes('password') && errorMessage.includes('weak')) {
    return '비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용하세요.';
  }

  if (errorCode === 'invalid_credentials' || errorMessage.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }

  if (errorMessage.includes('Password should be at least')) {
    return '비밀번호는 최소 6자 이상이어야 합니다.';
  }

  // 사용자 관련 에러
  if (errorCode === 'user_not_found' || errorMessage.includes('User not found')) {
    return '등록되지 않은 사용자입니다.';
  }

  if (errorCode === 'user_already_exists' || errorMessage.includes('User already registered')) {
    return '이미 가입된 사용자입니다.';
  }

  // 네트워크 에러
  if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
    return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
  }

  // Rate limit 에러
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 세션 관련 에러
  if (errorMessage.includes('session') || errorMessage.includes('token')) {
    return '세션이 만료되었습니다. 다시 로그인해주세요.';
  }

  // 이메일 전송 관련
  if (errorMessage.includes('email') && errorMessage.includes('send')) {
    return '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 기타 알려진 Supabase 에러
  if (errorMessage.includes('Signup requires a valid password')) {
    return '유효한 비밀번호를 입력해주세요.';
  }

  if (errorMessage.includes('signups not allowed')) {
    return '현재 회원가입이 비활성화되어 있습니다.';
  }

  if (errorCode === 'email_provider_disabled' || errorMessage.includes('email_provider_disabled')) {
    return '이메일 인증이 비활성화되어 있습니다. 관리자에게 문의하세요.';
  }

  if (errorMessage.includes('Email rate limit exceeded')) {
    return '이메일 전송 제한을 초과했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 기본 에러 메시지
  console.error('[AuthError]', error);
  return '오류가 발생했습니다. 다시 시도해주세요.';
};
