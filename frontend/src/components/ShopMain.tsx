import React, { useState } from 'react';
import {
  Search, ShoppingCart, Settings, Heart, User, Home, List, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './ui/Modal';
import {
  LuxuryDressIcon, LuxuryBagIcon, LuxuryHandshakeIcon, LuxuryGiftIcon,
  MenuHangerIcon, MenuTagIcon, MenuClockIcon, MenuMembershipIcon,
  MenuCareIcon, MenuVipIcon, MenuBuybackIcon, MenuInviteIcon,
  LuxuryLuggageIcon, LuxuryJewelryIcon
} from './ui/LuxuryIcons';
import { ProductImage } from './ui/ProductImage';

// ==========================================
// 커스텀 SVG 아이콘 (lucide-react 에러 대체용)
// ==========================================
const ShoppingBagIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const InstagramIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

// 맞춤 추천 데이터 세트 (연령/성별 탭 연동)
const RECOMMENDATIONS_DATA: Record<string, Array<{
  brand: string;
  title: string;
  price: string;
  original: string;
  discount: string;
  tag: string;
  category: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
  image?: string;
}>> = {
  '20대 여성': [
    { brand: '생로랑', title: '블랙 페이던트 Le 5 A 7 호보...', price: '10,230원', original: '44,400원', discount: '77%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/saint_laurent_le5a7.jpg' },
    { brand: '발렌시아가', title: '블랙 르 시티 모토 스몰 숄더백', price: '18,510원', original: '80,400원', discount: '77%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/balenciaga_le_city.jpg' },
    { brand: '샤넬', title: '블랙 캐비어 호보 미니 토트백', price: '101,600원', original: '170,400원', discount: '41%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/chanel_caviar_hobo.jpg' },
    { brand: '샤넬', title: '블랙 클래식 플랩 흑장 체인 숄...', price: '24,500원', original: '', discount: '72%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/chanel_classic_flap.jpg' }
  ],
  '20대 남성': [
    { brand: '메종 마르지엘라', title: '남성 5AC 블랙 크로스백 미디엄', price: '14,200원', original: '48,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/maison_margiela_5ac.jpg' },
    { brand: '프라다', title: '리나일론 삼각로고 남성 벨트백', price: '16,800원', original: '56,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/prada_renylon_belt.jpg' },
    { brand: '보테가 베네타', title: '카세트 인트레치아토 크로스백', price: '19,500원', original: '65,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/bottega_cassette.jpg' },
    { brand: '아미', title: '하트 로고 크루넥 남성 니트', price: '11,000원', original: '38,000원', discount: '71%', tag: '예약 마감', category: 'clothing', image: '/assets/products/clothing/ami_heart_knit.jpg' }
  ],
  '30대 여성': [
    { brand: '샤넬', title: '샤넬 22 미니 퀼팅 숄더 핸드백', price: '45,000원', original: '150,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/chanel_22_mini.jpg' },
    { brand: '에르메스', title: '에블린 TPM 미니 크로스 에토프', price: '42,000원', original: '120,000원', discount: '65%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/hermes_evelyne_tpm.jpg' },
    { brand: '셀린느', title: '틴 트리옹프 샤이니 카프스킨', price: '29,000원', original: '98,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/celine_triomphe.jpg' },
    { brand: '크리스찬 디올', title: '레이디 D-Joy 까나쥬 스몰백', price: '38,000원', original: '130,000원', discount: '71%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/dior_lady_djoy.jpg' }
  ],
  '30대 남성': [
    { brand: '톰브라운', title: '삼선 그로그랭 페블 레더 클러치', price: '13,500원', original: '45,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/thombrowne_clutch.jpg' },
    { brand: '구찌', title: 'GG 수프림 캔버스 슬링 메신저백', price: '15,000원', original: '50,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/gucci_gg_supreme.jpg' },
    { brand: '롤렉스', title: '오이스터 서브마리너 블랙 데이트', price: '85,000원', original: '250,000원', discount: '66%', tag: '예약 마감', category: 'watch', image: '/assets/products/watches/rolex_submariner.jpg' },
    { brand: '생로랑', title: '시티 나일론 블랙 백팩 클래식', price: '16,000원', original: '55,000원', discount: '71%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/saint_laurent_backpack.jpg' }
  ],
  '40대 여성': [
    { brand: '에르메스', title: '버킨 25 토고 골드 하드웨어', price: '115,000원', original: '350,000원', discount: '67%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/hermes_birkin_25.jpg' },
    { brand: '루이비통', title: '카푸신 BB 블랙 토뤼옹 핸드백', price: '39,000원', original: '130,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/louisvuitton_capucines_bb.jpg' },
    { brand: '샤넬', title: '클래식 미디엄 캐비어 금장 플랩', price: '58,000원', original: '190,000원', discount: '69%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/chanel_classic_medium.jpg' },
    { brand: '반클리프 아펠', title: '빈티지 알함브라 펜던트 옐로골드', price: '28,000원', original: '85,000원', discount: '67%', tag: '예약 마감', category: 'jewelry', image: '/assets/products/jewelry/vancleef_alhambra.jpg' }
  ]
};

export const ShopMain = () => {
  const { setCurrentView, navigateTo, setActiveOverlay, user, logoutUser } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('20대 여성');
  const [serviceInfoModal, setServiceInfoModal] = useState<{ title: string; desc: string } | null>(null);

  const currentRecommendList = RECOMMENDATIONS_DATA[activeTab] || RECOMMENDATIONS_DATA['20대 여성'];

  const handleMenuClick = (title: string) => {
    switch (title) {
      case '렌트 소개':
        setServiceInfoModal({
          title: 'LUXURYRENTAL 렌트 서비스 소개',
          desc: '원하는 명품을 1일 단위부터 자유롭게 렌탈할 수 있는 프리미엄 커머스 서비스입니다. 반납 시 무료 수거와 100% 전문 감정 정품 보증을 기본 제공합니다.'
        });
        break;
      case '70% 할인':
      case '오늘신규입고':
        navigateTo('SHOP_CATEGORY');
        break;
      case '베이직멤버십':
        setServiceInfoModal({
          title: '베이직 멤버십 혜택',
          desc: '매월 1회 무료 배송 쿠폰과 렌탈료 5% 추가 할인 적립 혜택을 드립니다. 마이페이지에서 간편하게 등록하실 수 있습니다.'
        });
        break;
      case '렌트잇 케어':
        setServiceInfoModal({
          title: '렌트잇 케어 안심 보험',
          desc: '렌탈 이용 중 발생하는 생활 스크래치, 미세 오염을 무상으로 복원해 드리는 안심 케어 서비스입니다.'
        });
        break;
      case 'VIP':
        setServiceInfoModal({
          title: 'VIP 컨시어지 서비스',
          desc: '하이엔드 명품 전담 큐레이터 1:1 매칭 및 희귀 에디션 우선 예약 혜택을 제공합니다.'
        });
        break;
      case '바이백':
        navigateTo('SHOP_SELL');
        break;
      case '친구 초대':
        showToast('친구 초대 추천인 코드가 클립보드에 복사되었습니다! (가입 시 1만P 적립)', 'success');
        break;
      default:
        navigateTo('SHOP_CATEGORY');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-28 overflow-y-auto scrollbar-hide w-full">

      {/* 🌟 PC 화면 좌측에 정밀하게 고정되는 앱 다운로드 & QR 배너 */}
      <aside
        aria-label="앱 다운로드 배너"
        className="hidden lg:flex flex-col fixed right-[calc(50%+244px)] top-1/2 -translate-y-1/2 bg-white border border-gray-200/90 p-5 rounded-2xl shadow-xl w-64 z-40 transition-all"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">LR</div>
          <div>
            <h5 className="font-extrabold text-xs text-gray-900 leading-tight">명품 구매, 렌트, 판매까지</h5>
            <p className="font-black text-sm text-gray-900">럭셔리 (LUXURYRENTAL)</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-purple-50/40 border border-indigo-100 p-4 rounded-xl mb-4 text-center">
          <p className="text-[11px] text-gray-600 font-bold mb-1">럭셔리앱 다운로드하면</p>
          <p className="text-sm font-black text-indigo-600 tracking-tight">최대 10만원 더블 할인!</p>
          <div className="my-3 bg-white p-2.5 rounded-lg shadow-inner inline-block border border-gray-100">
            <div className="w-24 h-24 bg-gray-950 text-white rounded flex flex-col items-center justify-center text-[11px] font-bold tracking-widest">
              <span className="text-[9px] text-gray-400 font-mono mb-0.5">SCAN ME</span>
              <span>QR CODE</span>
            </div>
          </div>
        </div>
        <div className="flex justify-around text-[11px] font-bold text-gray-700">
          <span className="flex items-center gap-1 cursor-pointer hover:text-black transition"><i className="fa-brands fa-google-play text-gray-600"></i> Google Play</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-black transition"><i className="fa-brands fa-app-store text-gray-600"></i> App Store</span>
        </div>
      </aside>

      {/* 1. Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 px-4 py-3 flex justify-between items-center border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h1
          className="text-xl font-black tracking-tighter cursor-pointer select-none text-gray-950"
          onClick={() => setCurrentView('SHOP_MAIN')}
        >
          LUXURYRENTAL
        </h1>
        <div className="flex items-center gap-3 text-gray-800">
          <button
            type="button"
            aria-label="상품 검색 열기"
            onClick={() => setActiveOverlay('SEARCH')}
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <Search size={22} />
          </button>

          <button
            type="button"
            aria-label="장바구니 및 로그인"
            onClick={() => setActiveOverlay('LOGIN')}
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <ShoppingCart size={22} />
          </button>

          <button
            type="button"
            aria-label="설정 센터로 이동"
            onClick={() => navigateTo('SHOP_SETTINGS')}
            className="text-gray-700 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 active:scale-95 transition shadow-sm"
          >
            <Settings size={21} />
          </button>
        </div>
      </header>

      {/* 2. 상단 로그인 인사말 & 간편 로그인 */}
      <section className="p-5 bg-white mb-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {user ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md tracking-tight">
                {user.role === 'ADMIN' ? '👑 최고관리자' : '일반 회원'}
              </span>
              <button
                type="button"
                onClick={logoutUser}
                className="text-xs font-bold text-gray-500 hover:text-black border border-gray-200 px-2.5 py-1 rounded-lg transition"
              >
                로그아웃
              </button>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-snug tracking-tight">
              반갑습니다, <span className="text-indigo-600 font-black">{user.name}</span>님!<br />
              오늘도 특별한 명품을 만나보세요
            </h2>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-4 tracking-tight">
              어서오세요, <span className="text-orange-500 font-black">로그인</span> 후<br />리본즈를 이용해보세요
            </h2>
            <button
              type="button"
              onClick={() => setActiveOverlay('LOGIN')}
              className="w-full bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-bold py-3.5 rounded-xl mb-6 shadow-sm transition-all"
            >
              간편 로그인하기
            </button>
          </div>
        )}

        {/* 렌트하기 / 구매하기 / 판매하기 액션 카드 */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('SHOP_CATEGORY')}
              onClick={() => navigateTo('SHOP_CATEGORY')}
              className="bg-pink-50/70 border border-pink-100 hover:border-pink-200 hover:shadow-md active:scale-[0.98] p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div>
                <span className="text-[11px] bg-pink-500 text-white font-extrabold px-2 py-0.5 rounded-md inline-block mb-2 shadow-xs">
                  첫 렌트 70% 할인
                </span>
                <h4 className="font-extrabold text-gray-900 text-base group-hover:text-pink-600 transition-colors">렌트하기</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">특별한 날,<br />마음껏 렌트하기</p>
              </div>
              <div className="flex justify-end mt-3">
                <LuxuryDressIcon className="w-10 h-10 text-pink-500 transition-transform group-hover:scale-110" />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('SHOP_CATEGORY')}
              onClick={() => navigateTo('SHOP_CATEGORY')}
              className="bg-blue-50/70 border border-blue-100 hover:border-blue-200 hover:shadow-md active:scale-[0.98] p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div>
                <span className="text-[11px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-md inline-block mb-2 shadow-xs">
                  정품 보증
                </span>
                <h4 className="font-extrabold text-gray-900 text-base group-hover:text-blue-600 transition-colors">구매하기</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">내 마 음에 쏙,<br />지금 바로 구매하기</p>
              </div>
              <div className="flex justify-end mt-3">
                <LuxuryBagIcon className="w-10 h-10 text-blue-500 transition-transform group-hover:scale-110" />
              </div>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('SHOP_SELL')}
            onClick={() => navigateTo('SHOP_SELL')}
            className="bg-emerald-50/70 border border-emerald-100 hover:border-emerald-200 hover:shadow-md active:scale-[0.99] p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all group"
          >
            <div>
              <span className="text-[11px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-md inline-block mb-1.5 shadow-xs">
                간편 위탁
              </span>
              <h4 className="font-extrabold text-gray-900 text-base group-hover:text-emerald-700 transition-colors">판매하기</h4>
              <p className="text-[11px] text-gray-500">내 명품, 쉽고 빠르게 판매하기</p>
            </div>
            <div className="pr-1">
              <LuxuryHandshakeIcon className="w-11 h-11 text-emerald-600 transition-transform group-hover:scale-110" />
            </div>
          </div>
        </div>

        {/* 회원가입 이벤트 배너 카드 */}
        <div
          onClick={() => setActiveOverlay('REGISTER')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveOverlay('REGISTER')}
          className="bg-gradient-to-r from-gray-900 via-zinc-900 to-indigo-950 text-white p-5 rounded-2xl flex justify-between items-center shadow-md mb-6 relative overflow-hidden cursor-pointer hover:opacity-95 active:scale-[0.99] transition"
        >
          <div className="relative z-10">
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold tracking-wider">EVENT</span>
            <h4 className="font-extrabold text-lg mt-1 tracking-tight">회원가입 이벤트</h4>
            <p className="text-xs text-gray-300 mt-0.5">간단하게 가입하고 가볍게 쇼핑!</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shadow-inner relative z-10">
            <LuxuryGiftIcon className="w-7 h-7 text-amber-300" />
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 리본즈만의 서비스 */}
        <h3 className="font-extrabold text-lg mb-3 text-gray-900 tracking-tight">리본즈만의 서비스</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div 
            onClick={() => handleMenuClick('렌트 소개')}
            className="bg-gray-50 border border-gray-100 p-4 rounded-xl hover:bg-gray-100/80 active:scale-[0.99] transition-all cursor-pointer"
          >
            <h4 className="font-bold text-gray-900 text-sm">명품 구독하기</h4>
            <p className="text-[10px] text-gray-500 mt-1">1달 구독료로 무제한 사용</p>
          </div>
          <div 
            onClick={() => navigateTo('SHOP_CATEGORY')}
            className="bg-gray-50 border border-gray-100 p-4 rounded-xl hover:bg-gray-100/80 active:scale-[0.99] transition-all cursor-pointer"
          >
            <h4 className="font-bold text-gray-900 text-sm">중고명품 구매</h4>
            <p className="text-[10px] text-gray-500 mt-1">합리적인 명품 소비의 시작</p>
          </div>
        </div>

        {/* 8-Grid 프리미엄 아이콘 메뉴 */}
        <div className="grid grid-cols-4 gap-y-6 gap-x-2 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {[
            { icon: <MenuHangerIcon />, title: '렌트 소개' },
            { icon: <MenuTagIcon />, title: '70% 할인' },
            { icon: <MenuClockIcon />, title: '오늘신규입고' },
            { icon: <MenuMembershipIcon />, title: '베이직멤버십' },
            { icon: <MenuCareIcon />, title: '렌트잇 케어' },
            { icon: <MenuVipIcon />, title: 'VIP' },
            { icon: <MenuBuybackIcon />, title: '바이백' },
            { icon: <MenuInviteIcon />, title: '친구 초대' }
          ].map((menu, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => handleMenuClick(menu.title)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMenuClick(menu.title)}
              className="flex flex-col items-center gap-2 cursor-pointer group active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-2xs group-hover:bg-gray-100 group-hover:border-gray-200 transition-colors">
                {menu.icon}
              </div>
              <span className="text-[11px] font-bold text-gray-800 group-hover:text-black transition-colors">{menu.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 가이드 한눈에 */}
      <section className="p-5 bg-white mb-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h3 className="font-extrabold text-lg mb-3 text-gray-900 tracking-tight">가이드 한눈에</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-xs cursor-pointer hover:shadow-sm transition-all group">
            <div>
              <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">렌트 이용 가이드</h4>
              <p className="text-[10px] text-gray-500 mt-1">예약부터 반납까지<br />30초 만에 알아보기</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex-1 bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-xs cursor-pointer hover:shadow-sm transition-all group">
            <div>
              <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">구독 가이드</h4>
              <p className="text-[10px] text-gray-500 mt-1">명품 무제한 교환<br />30초 만에 알아보기</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </section>

      {/* 4. 맞춤 추천 상품 */}
      <section className="p-5 bg-white mb-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h3 className="font-extrabold text-lg mb-3 text-gray-900 tracking-tight">회원님이 좋아하실 것 같은 상품</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
          {['20대 여성', '20대 남성', '30대 여성', '30대 남성', '40대 여성'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeTab === tab
                  ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {currentRecommendList.map((item, i) => (
            <div key={i} className="flex flex-col group cursor-pointer">
              <div className="relative aspect-square bg-gray-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs">
                <ProductImage src={item.image} alt={item.title} category={item.category} />
                <button
                  type="button"
                  aria-label={`${item.title} 좋아요`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveOverlay('LOGIN');
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/70 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-white transition shadow-xs z-10"
                >
                  <Heart size={16} />
                </button>
                {item.tag === '예약 마감' && (
                  <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-xs text-white text-center text-[10px] py-1 font-bold z-10 tracking-wider">
                    예약 마감
                  </div>
                )}
                {item.tag === '앱전용' && (
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm z-10 tracking-wider shadow-xs">
                    앱전용
                  </div>
                )}
              </div>
              <span className="font-extrabold text-xs text-gray-900 group-hover:text-indigo-600 transition-colors">{item.brand}</span>
              <span className="text-[11px] text-gray-600 truncate">{item.title}</span>
              <div className="mt-1 flex items-baseline gap-1">
                {item.discount && <span className="text-red-500 font-extrabold text-sm">{item.discount}</span>}
                <span className="font-extrabold text-sm text-gray-950">{item.price}</span>
                <span className="text-[10px] text-gray-400">/3일</span>
              </div>
              {item.original && <span className="text-[10px] text-gray-400 line-through">{item.original}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* 5. RENT NEW ARRIVALS */}
      <section className="p-5 bg-white mb-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h3 className="font-extrabold text-lg text-gray-900 uppercase tracking-tight">Rent New Arrivals</h3>
        <p className="text-xs text-gray-500 mb-4">매주 수요일 오전 11시 업데이트</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <div className="min-w-[140px] bg-gray-50/80 hover:bg-gray-50 p-3.5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col items-center cursor-pointer transition group">
            <span className="font-extrabold text-xs w-full text-left mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">발렌시아가</span>
            <div className="my-3 flex items-center justify-center">
              <LuxuryLuggageIcon className="w-12 h-12 text-neutral-700 transition-transform group-hover:scale-105" />
            </div>
            <span className="text-pink-600 font-bold text-xs mt-1">일 40,600원부터</span>
          </div>
          <div className="min-w-[140px] bg-gray-50/80 hover:bg-gray-50 p-3.5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col items-center cursor-pointer transition group">
            <span className="font-extrabold text-xs w-full text-left mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">크리스찬 디올</span>
            <div className="my-3 flex items-center justify-center">
              <LuxuryJewelryIcon className="w-12 h-12 text-amber-500 transition-transform group-hover:scale-105" />
            </div>
            <span className="text-pink-600 font-bold text-xs mt-1">일 11,100원부터</span>
          </div>
        </div>
      </section>

      {/* 6. 전체보기 버튼 & 푸터 */}
      <div className="bg-white p-5 pt-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <button
          type="button"
          onClick={() => setCurrentView('SHOP_CATEGORY')}
          className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.99] py-3.5 rounded-xl text-sm font-bold text-gray-800 flex justify-center items-center gap-1 mb-10 transition-all shadow-2xs"
        >
          전체보기 <ChevronRight size={16} />
        </button>

        <footer className="text-xs text-gray-500 border-t border-gray-100 pt-6">
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 font-semibold">
            <span className="hover:text-black cursor-pointer">고객센터</span>
            <span className="hover:text-black cursor-pointer">정책안내</span>
            <span className="hover:text-black cursor-pointer">이용약관</span>
            <span className="font-extrabold text-gray-800 hover:text-black cursor-pointer">개인정보처리방침</span>
            <span className="hover:text-black cursor-pointer">입점신청</span>
            <span className="hover:text-black cursor-pointer">제휴문의</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <button type="button" className="flex items-center gap-1 font-bold border border-gray-200 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              (주)럭셔리 렌탈 <ChevronRight size={14} className="rotate-90" />
            </button>
            <div className="flex gap-2">
              <div className="w-8 h-8 border border-gray-200 rounded-lg flex justify-center items-center text-gray-600 hover:text-black hover:border-gray-400 cursor-pointer transition">
                <InstagramIcon size={16} />
              </div>
              <div className="w-8 h-8 border border-gray-200 rounded-lg flex justify-center items-center text-gray-600 hover:text-black hover:border-gray-400 cursor-pointer transition">
                <YoutubeIcon size={16} />
              </div>
              <div className="w-8 h-8 border border-gray-200 rounded-lg flex justify-center items-center font-bold text-[10px] text-gray-600 hover:text-black hover:border-gray-400 cursor-pointer transition">
                APP
              </div>
            </div>
          </div>

          <div className="space-y-1 mb-4 text-[10px] leading-relaxed text-gray-500">
            <p className="font-bold text-gray-700">토스페이먼츠 매매보호(에스크로)서비스</p>
            <p>럭셔리렌탈은 고객님이 현금 결제한 금액에 대해 토스페이먼츠와 매매보호 계약을 체결하여 안전거래를 보장하고 있습니다.</p>
            <p className="flex items-center gap-1 text-gray-600 mt-1 cursor-pointer hover:underline">
              서비스 가입 확인 <ChevronRight size={10} />
            </p>
          </div>

          <p className="text-[10px] text-gray-400">© 2011-2026 Luxury CO.,LTD ALL RIGHTS RESERVED.</p>
        </footer>
      </div>

      {/* 7. 플로팅 바텀 네비게이션 (Pill Style) */}
      <nav
        aria-label="하단 네비게이션"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex justify-between items-center px-4 py-2 z-50 select-none"
      >
        <button
          type="button"
          onClick={() => navigateTo('SHOP_CATEGORY')}
          className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
        >
          <List size={22} className="text-gray-800" />
          <span className="text-[10px] text-gray-800 font-bold">카테고리</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo('SHOP_SELL')}
          className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
        >
          <ShoppingBagIcon size={22} />
          <span className="text-[10px] text-gray-800 font-bold">내 상품 판매</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo('SHOP_MAIN')}
          className="flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200/80 rounded-full w-20 h-14 active:scale-95 transition"
        >
          <Home size={22} className="text-black mb-0.5" />
          <span className="text-[10px] text-black font-black">홈</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!user) setActiveOverlay('LOGIN');
            else navigateTo('SHOP_MY_PAGE');
          }}
          className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
        >
          <Heart size={22} className="text-gray-800" />
          <span className="text-[10px] text-gray-800 font-bold">좋아요</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!user) setActiveOverlay('LOGIN');
            else navigateTo('SHOP_MY_PAGE');
          }}
          className="flex flex-col items-center gap-1 cursor-pointer w-16 text-gray-700 hover:text-black transition active:scale-95"
        >
          <User size={22} className="text-gray-800" />
          <span className="text-[10px] text-gray-800 font-bold">마이페이지</span>
        </button>
      </nav>

      {/* 8. 서비스 상세 안내 모달 */}
      <Modal
        isOpen={Boolean(serviceInfoModal)}
        onClose={() => setServiceInfoModal(null)}
        title={serviceInfoModal?.title || '서비스 안내'}
      >
        <div className="space-y-4 text-xs leading-relaxed text-gray-600">
          <p className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800 font-medium">
            {serviceInfoModal?.desc}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setServiceInfoModal(null);
                navigateTo('SHOP_CATEGORY');
              }}
              className="flex-1 py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition"
            >
              상품 둘러보기
            </button>
            <button
              type="button"
              onClick={() => setServiceInfoModal(null)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition"
            >
              닫기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
