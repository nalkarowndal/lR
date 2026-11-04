import { z } from 'zod';

export const CreateProductSchema = z.object({
  title: z.string().min(1, '상품명을 입력해주세요'),
  type: z.enum(['RENT', 'BUY'], { errorMap: () => ({ message: '타입은 RENT 또는 BUY여야 합니다' }) }),
  price: z.number().positive('가격은 0원보다 커야 합니다'),
  brand: z.string().optional().default('LUXURY'),
  category: z.enum(['bag', 'clothing', 'shoes', 'jewelry', 'watch', 'wallet']).optional().default('bag'),
  tag: z.string().optional().nullable()
});

export const CreateSellRequestSchema = z.object({
  brandName: z.string().min(1, '판매할 브랜드명을 입력해주세요'),
  userName: z.string().optional().default('고객'),
  phone: z.string().optional().default('')
});

export const CreateRecruitRequestSchema = z.object({
  storeName: z.string().min(1, '매장명을 선택해주세요'),
  date: z.string().min(1, '근무 날짜를 선택해주세요'),
  section: z.string().min(1, '파트(섹션)를 선택해주세요'),
  time: z.string().min(1, '출퇴근 시간을 입력해주세요'),
  breakTime: z.string().min(1, '휴게 시간을 입력해주세요'),
  required: z.number().int().min(1, '필요 인원은 1명 이상이어야 합니다'),
  partner: z.string().optional().default('')
});

export const UpdateRecruitStatusSchema = z.object({
  status: z.enum(['채용중', '완료']).optional(),
  hired: z.number().int().min(0).optional()
});

export const CreateWorkerSchema = z.object({
  name: z.string().min(1, '근무자 이름을 입력해주세요'),
  phone: z.string().min(8, '올바른 연락처를 입력해주세요'),
  exp: z.string().min(1, '경력 사항을 입력해주세요')
});

export const CreateMessageSchema = z.object({
  sender: z.string().min(1, '발신자를 입력해주세요'),
  text: z.string().min(1, '메시지 내용을 입력해주세요'),
  isMine: z.boolean().optional().default(true)
});
