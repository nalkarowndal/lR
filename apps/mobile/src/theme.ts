export const colors = {
  bg:'#F3F4F6',surface:'#FFFFFF',ink:'#111827',sub:'#4B5563',
  accent:'#4F46E5',border:'#6B7280',divider:'#E5E7EB',
  rental:'#FDF2F8',store:'#EFF6FF',sell:'#F0FDF4',
  care:'#F8FAFC',error:'#B91C1C',success:'#166534',
} as const;
export const spacing = {xs:4,sm:8,md:12,lg:16,xl:20,xxl:24,section:32} as const;
export const radius = {sm:8,md:12,lg:16,xl:24,pill:999} as const;
export const formatKrw = (amount:number)=>amount.toLocaleString('ko-KR')+'원';
