import { Request, Response, NextFunction } from 'express';

function getContextualErrorMessage(path: string): string {
  const normalized = path.toLowerCase();
  if (normalized.includes('/auth/login')) {
    return '로그인 처리 중 일시적인 연결 지연이 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  if (normalized.includes('/auth/register')) {
    return '회원가입 처리 중 일시적인 지연이 발생했습니다. 입력 정보를 확인 후 다시 시도해주세요.';
  }
  if (normalized.includes('/auth/forgot-password')) {
    return '인증 번호 발송 요청 중 일시적인 지연이 발생했습니다. 이메일 주소를 확인 후 다시 시도해주세요.';
  }
  if (normalized.includes('/auth/reset-password')) {
    return '비밀번호 변경 처리 중 오류가 발생했습니다. 발송된 인증 번호를 확인 후 다시 시도해주세요.';
  }
  if (normalized.includes('/auth/kakao') || normalized.includes('/auth/google')) {
    return '소셜 간편 로그인 연결 중 일시적인 지연이 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  if (normalized.includes('/favorites')) {
    return '관심 상품 변경 처리 중 일시적인 지연이 발생했습니다. 다시 시도해주세요.';
  }
  if (normalized.includes('/user/profile') || normalized.includes('/user/settings')) {
    return '회원 정보 저장 중 일시적인 지연이 발생했습니다. 다시 시도해주세요.';
  }
  if (normalized.includes('/user/password')) {
    return '비밀번호 변경 처리 중 오류가 발생했습니다. 현재 비밀번호를 확인 후 다시 시도해주세요.';
  }
  if (normalized.includes('/sell')) {
    return '위탁 판매 신청 접수 중 일시적인 지연이 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  if (normalized.includes('/admin/products') || normalized.includes('/products')) {
    return '상품 정보 처리 중 일시적인 지연이 발생했습니다. 다시 시도해주세요.';
  }
  if (normalized.includes('/admin/requests') || normalized.includes('/recruit')) {
    return '구인 요청 처리 중 일시적인 지연이 발생했습니다. 다시 시도해주세요.';
  }
  if (normalized.includes('/admin/messages')) {
    return '메시지 전송 처리 중 일시적인 지연이 발생했습니다. 다시 시도해주세요.';
  }
  return '요청을 처리하는 중 일시적인 지연이 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error('[ServerError]', err);

  const status = typeof err.status === 'number' ? err.status : 500;
  let message = err.message;

  // Security hardening: Mask internal SQL/driver details or unhandled 500 exceptions with contextual user-friendly messages
  if (status >= 500 || !message || /sql|sqlite|syntax error|constraint|foreign_key/i.test(message)) {
    message = getContextualErrorMessage(req.originalUrl || req.path || '');
  }

  res.status(status).json({
    success: false,
    error: message,
    status
  });
}
