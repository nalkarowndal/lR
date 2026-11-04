import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  name: z.string().min(1, '이름(또는 닉네임)을 입력해주세요.'),
  phone: z.string().optional().default(''),
  termsAgreed: z.boolean().refine(val => val === true, {
    message: '필수 이용약관 및 개인정보 수집에 동의해주세요.'
  }),
  marketingConsent: z.boolean().optional().default(false)
});

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, '유효한 재설정 토큰이 필요합니다.'),
  newPassword: z.string().min(6, '새 비밀번호는 최소 6자 이상이어야 합니다.')
});

