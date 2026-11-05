import React, { useState } from 'react';
import {
  Search, ShoppingCart, Settings, Heart, User, Home, List, ChevronRight,
  ShieldCheck, Smartphone, Trash2, CheckCircle2, X, PackageCheck, ArrowRight
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
import { LegalTermsModal } from './ui/LegalTermsModal';
import { RENT_NEW_ARRIVALS } from '../data/catalog';
import { calculateRentalPriceDetails, parseNumericPrice, formatKRW } from '../utils/pricing';

// ==========================================
// 장바구니 아이템 타입 정의
// ==========================================
export interface CartItem {
  id: string | number;
  brand: string;
  title: string;
  price: string;
  days: number;
  image?: string;
  category?: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet' | string;
}

// ==========================================
// 고화질 정품 QR 코드 SVG
// ==========================================
const QrCodeSvg = ({ size = 96 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded">
    <rect width="100" height="100" fill="white" />
    {/* Detection Pattern Top-Left */}
    <rect x="8" y="8" width="26" height="26" rx="4" fill="#09090b" />
    <rect x="12" y="12" width="18" height="18" rx="2" fill="white" />
    <rect x="16" y="16" width="10" height="10" rx="1.5" fill="#4f46e5" />
    {/* Detection Pattern Top-Right */}
    <rect x="66" y="8" width="26" height="26" rx="4" fill="#09090b" />
    <rect x="70" y="12" width="18" height="18" rx="2" fill="white" />
    <rect x="74" y="16" width="10" height="10" rx="1.5" fill="#4f46e5" />
    {/* Detection Pattern Bottom-Left */}
    <rect x="8" y="66" width="26" height="26" rx="4" fill="#09090b" />
    <rect x="12" y="70" width="18" height="18" rx="2" fill="white" />
    <rect x="16" y="74" width="10" height="10" rx="1.5" fill="#4f46e5" />
    {/* Timing Patterns */}
    <rect x="38" y="10" width="4" height="4" fill="#09090b" />
    <rect x="46" y="10" width="4" height="4" fill="#09090b" />
    <rect x="54" y="10" width="4" height="4" fill="#09090b" />
    <rect x="10" y="38" width="4" height="4" fill="#09090b" />
    <rect x="10" y="46" width="4" height="4" fill="#09090b" />
    <rect x="10" y="54" width="4" height="4" fill="#09090b" />
    {/* Data Cells */}
    <rect x="38" y="22" width="8" height="8" rx="1.5" fill="#4f46e5" />
    <rect x="50" y="22" width="4" height="4" fill="#09090b" />
    <rect x="58" y="18" width="4" height="4" fill="#09090b" />
    <rect x="40" y="34" width="6" height="6" fill="#09090b" />
    <rect x="50" y="34" width="6" height="6" fill="#09090b" />
    <rect x="60" y="34" width="6" height="6" fill="#09090b" />
    <rect x="72" y="38" width="6" height="6" fill="#09090b" />
    <rect x="82" y="42" width="6" height="6" fill="#4f46e5" />
    <rect x="24" y="42" width="6" height="6" fill="#09090b" />
    <rect x="32" y="48" width="4" height="4" fill="#09090b" />
    <rect x="42" y="44" width="14" height="14" rx="2" fill="#09090b" />
    <rect x="62" y="48" width="6" height="6" fill="#09090b" />
    <rect x="72" y="52" width="6" height="6" fill="#09090b" />
    <rect x="40" y="64" width="6" height="6" fill="#09090b" />
    <rect x="52" y="64" width="6" height="6" fill="#4f46e5" />
    <rect x="62" y="64" width="8" height="8" rx="1" fill="#09090b" />
    <rect x="74" y="64" width="4" height="4" fill="#09090b" />
    <rect x="82" y="70" width="6" height="6" fill="#09090b" />
    <rect x="40" y="76" width="6" height="6" fill="#09090b" />
    <rect x="50" y="76" width="6" height="6" fill="#09090b" />
    <rect x="60" y="78" width="4" height="4" fill="#09090b" />
    <rect x="70" y="76" width="8" height="8" rx="1" fill="#09090b" />
    <rect x="82" y="82" width="6" height="6" fill="#09090b" />
    {/* Center LR Branding Badge */}
    <circle cx="50" cy="51" r="7.5" fill="#4f46e5" />
    <text x="50" y="54" fill="white" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">LR</text>
  </svg>
);

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

// 맞춤 추천 데이터 세트 (연령/성별 탭 연동 - 서버 DB 상품 ID 1:1 정합화)
const RECOMMENDATIONS_DATA: Record<string, Array<{
  id: number;
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
    { id: 1, brand: '생로랑', title: '블랙 페이던트 Le 5 A 7 호보...', price: '10,230원', original: '44,400원', discount: '77%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/saint_laurent_le5a7.jpg' },
    { id: 2, brand: '발렌시아가', title: '블랙 르 시티 모토 스몰 숄더백', price: '18,510원', original: '80,400원', discount: '77%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/balenciaga_le_city.jpg' },
    { id: 3, brand: '샤넬', title: '블랙 캐비어 호보 미니 토트백', price: '101,600원', original: '170,400원', discount: '41%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/chanel_caviar_hobo.jpg' },
    { id: 4, brand: '샤넬', title: '블랙 클래식 플랩 흑장 체인 숄...', price: '24,500원', original: '', discount: '72%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/chanel_classic_flap.jpg' }
  ],
  '20대 남성': [
    { id: 5, brand: '메종 마르지엘라', title: '남성 5AC 블랙 크로스백 미디엄', price: '14,200원', original: '48,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/maison_margiela_5ac.jpg' },
    { id: 6, brand: '프라다', title: '리나일론 삼각로고 남성 벨트백', price: '16,800원', original: '56,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/prada_renylon_belt.jpg' },
    { id: 7, brand: '보테가 베네타', title: '카세트 인트레치아토 크로스백', price: '19,500원', original: '65,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/bottega_cassette.jpg' },
    { id: 8, brand: '아미', title: '하트 로고 크루넥 남성 니트', price: '11,000원', original: '38,000원', discount: '71%', tag: '예약 마감', category: 'clothing', image: '/assets/products/clothing/ami_heart_knit.jpg' }
  ],
  '30대 여성': [
    { id: 9, brand: '샤넬', title: '샤넬 22 미니 퀼팅 숄더 핸드백', price: '45,000원', original: '150,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/chanel_22_mini.jpg' },
    { id: 10, brand: '에르메스', title: '에블린 TPM 미니 크로스 에토프', price: '42,000원', original: '120,000원', discount: '65%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/hermes_evelyne_tpm.jpg' },
    { id: 11, brand: '셀린느', title: '틴 트리옹프 샤이니 카프스킨', price: '29,000원', original: '98,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/celine_triomphe.jpg' },
    { id: 12, brand: '크리스찬 디올', title: '레이디 D-Joy 까나쥬 스몰백', price: '38,000원', original: '130,000원', discount: '71%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/dior_lady_djoy.jpg' }
  ],
  '30대 남성': [
    { id: 13, brand: '톰브라운', title: '삼선 그로그랭 페블 레더 클러치', price: '13,500원', original: '45,000원', discount: '70%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/thombrowne_clutch.jpg' },
    { id: 14, brand: '구찌', title: 'GG 수프림 캔버스 슬링 메신저백', price: '15,000원', original: '50,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/gucci_gg_supreme.jpg' },
    { id: 15, brand: '롤렉스', title: '오이스터 서브마리너 블랙 데이트', price: '85,000원', original: '250,000원', discount: '66%', tag: '예약 마감', category: 'watch', image: '/assets/products/watches/rolex_submariner.jpg' },
    { id: 16, brand: '생로랑', title: '시티 나일론 블랙 백팩 클래식', price: '16,000원', original: '55,000원', discount: '71%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/saint_laurent_backpack.jpg' }
  ],
  '40대 여성': [
    { id: 17, brand: '에르메스', title: '버킨 25 토고 골드 하드웨어', price: '115,000원', original: '350,000원', discount: '67%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/hermes_birkin_25.jpg' },
    { id: 18, brand: '루이비통', title: '카푸신 BB 블랙 토뤼옹 핸드백', price: '39,000원', original: '130,000원', discount: '70%', tag: '앱전용', category: 'bag', image: '/assets/products/bags/louisvuitton_capucines_bb.jpg' },
    { id: 19, brand: '샤넬', title: '클래식 미디엄 캐비어 금장 플랩', price: '58,000원', original: '190,000원', discount: '69%', tag: '예약 마감', category: 'bag', image: '/assets/products/bags/chanel_classic_medium.jpg' },
    { id: 20, brand: '반클리프 아펠', title: '빈티지 알함브라 펜던트 옐로골드', price: '28,000원', original: '85,000원', discount: '67%', tag: '예약 마감', category: 'jewelry', image: '/assets/products/jewelry/vancleef_alhambra.jpg' }
  ]
};

export const ShopMain = () => {
  const { setCurrentView, navigateTo, setActiveOverlay, user, logoutUser, favorites, toggleFavorite } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('20대 여성');
  const [serviceInfoModal, setServiceInfoModal] = useState<{ title: string; desc: string } | null>(null);
  const [activeLegalDoc, setActiveLegalDoc] = useState<'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | null>(null);

  // 장바구니 및 상세 모달 상태
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string | number;
    brand: string;
    title: string;
    price: string;
    original?: string;
    discount?: string;
    image?: string;
    category?: any;
  } | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [appDownloadModalOpen, setAppDownloadModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxury_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart & Mock Order state
  const [cartStep, setCartStep] = useState<'CART' | 'SHIPPING' | 'ORDER_COMPLETE'>('CART');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('010-8842-1920');
  const [shippingAddress, setShippingAddress] = useState('서울특별시 강남구 압구정로 142 럭셔리타워 5층');
  const [deliveryNote, setDeliveryNote] = useState('부재 시 문 앞 보관 후 문자 부탁드립니다.');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const calculateRentalPrice = (basePriceStr: string, days: number) => {
    return calculateRentalPriceDetails(basePriceStr, undefined, days).currentPrice;
  };

  const handleAddToCart = (product: NonNullable<typeof selectedProduct>, days: number) => {
    const details = calculateRentalPriceDetails(product.price, product.original, days);
    const newItem: CartItem = {
      id: product.id,
      brand: product.brand,
      title: product.title,
      price: details.formattedCurrentPrice,
      days,
      image: product.image,
      category: product.category
    };
    const updated = [...cartItems.filter(item => item.id !== product.id), newItem];
    setCartItems(updated);
    try {
      localStorage.setItem('luxury_cart', JSON.stringify(updated));
    } catch {}
    showToast(`'${product.brand} ${product.title}' 상품이 장바구니에 담겼습니다.`, 'success');
    setSelectedProduct(null);
  };

  const handleRentNow = (product: NonNullable<typeof selectedProduct>, days: number) => {
    const details = calculateRentalPriceDetails(product.price, product.original, days);
    const newItem: CartItem = {
      id: product.id,
      brand: product.brand,
      title: product.title,
      price: details.formattedCurrentPrice,
      days,
      image: product.image,
      category: product.category
    };
    const updated = [...cartItems.filter(item => item.id !== product.id), newItem];
    setCartItems(updated);
    try {
      localStorage.setItem('luxury_cart', JSON.stringify(updated));
    } catch {}
    setSelectedProduct(null);
    setCartStep('SHIPPING');
    if (user) {
      setRecipientName(user.name || '홍길동');
      if (user.phone) setRecipientPhone(user.phone);
    } else {
      setRecipientName('VIP 고객님');
    }
    setCartModalOpen(true);
  };

  const handleRemoveFromCart = (id: string | number) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    try {
      localStorage.setItem('luxury_cart', JSON.stringify(updated));
    } catch {}
    showToast('장바구니에서 상품이 삭제되었습니다.', 'info');
  };

  const handleOpenCart = () => {
    setCartStep('CART');
    if (user && !recipientName) {
      setRecipientName(user.name);
      if (user.phone) setRecipientPhone(user.phone);
    }
    setCartModalOpen(true);
  };

  const handleStartCheckout = () => {
    if (cartItems.length === 0) return;
    if (user && !recipientName) {
      setRecipientName(user.name);
      if (user.phone) setRecipientPhone(user.phone);
    } else if (!recipientName) {
      setRecipientName('VIP 고객님');
    }
    setCartStep('SHIPPING');
  };

  const handleCompleteOrder = () => {
    if (!recipientName.trim()) {
      showToast('수령인 성명을 입력해주세요.', 'info');
      return;
    }
    if (!recipientPhone.trim()) {
      showToast('수령인 연락처를 입력해주세요.', 'info');
      return;
    }
    if (!shippingAddress.trim()) {
      showToast('배송지 주소를 입력해주세요.', 'info');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `LR-${todayStr}-${randSuffix}`;
    const totalAmount = cartItems.reduce((acc, it) => acc + parseNumericPrice(it.price), 0);

    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      items: [...cartItems],
      totalAmount,
      formattedTotal: `${totalAmount.toLocaleString()}원`,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      deliveryNote: deliveryNote.trim(),
      status: '배송 준비중'
    };

    try {
      const existingStr = localStorage.getItem('luxury_orders');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('luxury_orders', JSON.stringify([newOrder, ...existing]));
      localStorage.removeItem('luxury_cart');
    } catch {}

    setCartItems([]);
    setCompletedOrder(newOrder);
    setCartStep('ORDER_COMPLETE');
    showToast(`렌탈 주문이 정상 접수되었습니다! 주문번호: ${orderId}`, 'success');
  };

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
      case '친구 초대': {
        const inviteCode = 'LUXURY-VIP-2026';
        const inviteText = `[LUXURYRENTAL] 프리미엄 명품 렌탈 초대장!\n가입 시 추천인 코드 [${inviteCode}]를 입력하시면 1만 포인트가 즉시 적립됩니다.\nhttps://luxuryrental.com/invite?code=${inviteCode}`;
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(inviteText)
            .then(() => {
              showToast('친구 초대 추천인 코드(LUXURY-VIP-2026)가 클립보드에 복사되었습니다!', 'success');
            })
            .catch(() => {
              showToast('추천인 코드: LUXURY-VIP-2026 (가입 시 1만P 적립)', 'info');
            });
        } else {
          showToast('추천인 코드: LUXURY-VIP-2026 (가입 시 1만P 적립)', 'info');
        }
        break;
      }
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
          <div 
            onClick={() => setAppDownloadModalOpen(true)}
            className="my-3 bg-white p-2.5 rounded-xl shadow-inner inline-block border border-gray-100 cursor-pointer hover:scale-105 transition-transform"
            title="QR 코드를 클릭하여 앱 다운로드 안내 보기"
          >
            <QrCodeSvg size={96} />
          </div>
          <p className="text-[10px] text-indigo-500 font-bold">카메라로 QR 스캔 또는 클릭</p>
        </div>
        <div className="flex justify-around text-[11px] font-bold text-gray-700">
          <button 
            type="button" 
            onClick={() => setAppDownloadModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer hover:text-black transition"
          >
            <Smartphone size={13} className="text-gray-600" /> Google Play
          </button>
          <button 
            type="button" 
            onClick={() => setAppDownloadModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer hover:text-black transition"
          >
            <Smartphone size={13} className="text-gray-600" /> App Store
          </button>
        </div>
      </aside>

      {/* 1. Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 px-4 py-3 flex justify-between items-center border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h1
          className="text-xl font-black tracking-tighter cursor-pointer select-none text-gray-950"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            navigateTo('SHOP_MAIN');
          }}
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
            aria-label={user ? `장바구니 열기 (${cartItems.length}개)` : '장바구니 및 로그인'}
            onClick={() => {
              if (!user) {
                showToast('장바구니를 확인하려면 먼저 로그인해주세요.', 'info');
                setActiveOverlay('LOGIN');
              } else {
                handleOpenCart();
              }
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition relative"
          >
            <ShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-scaleUp">
                {cartItems.length}
              </span>
            )}
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
              className="bg-[#FBF9F5] border border-[#EBE6DC] hover:border-[#B49A67]/50 hover:shadow-md active:scale-[0.98] p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div>
                <span className="text-[11px] bg-[#252525] text-[#DFCA9B] font-extrabold px-2.5 py-0.5 rounded-md inline-block mb-2 shadow-xs border border-[#B49A67]/30">
                  첫 렌트 70% 할인
                </span>
                <h4 className="font-extrabold text-gray-900 text-base group-hover:text-[#8C734B] transition-colors">렌트하기</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">특별한 날,<br />마음껏 렌트하기</p>
              </div>
              <div className="flex justify-end mt-3">
                <LuxuryDressIcon className="w-11 h-11 transition-transform group-hover:scale-105" />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('SHOP_CATEGORY')}
              onClick={() => navigateTo('SHOP_CATEGORY')}
              className="bg-[#F8F9FA] border border-[#E7E9ED] hover:border-gray-400 hover:shadow-md active:scale-[0.98] p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div>
                <span className="text-[11px] bg-[#252525] text-white font-extrabold px-2.5 py-0.5 rounded-md inline-block mb-2 shadow-xs">
                  정품 보증
                </span>
                <h4 className="font-extrabold text-gray-900 text-base group-hover:text-black transition-colors">구매하기</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">내 마음에 쏙,<br />지금 바로 구매하기</p>
              </div>
              <div className="flex justify-end mt-3">
                <LuxuryBagIcon className="w-11 h-11 transition-transform group-hover:scale-105" />
              </div>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('SHOP_SELL')}
            onClick={() => navigateTo('SHOP_SELL')}
            className="bg-[#FAF9F5] border border-[#EBE5D8] hover:border-[#B49A67]/50 hover:shadow-md active:scale-[0.99] p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all group"
          >
            <div>
              <span className="text-[11px] bg-[#8C734B] text-white font-extrabold px-2.5 py-0.5 rounded-md inline-block mb-1.5 shadow-xs">
                간편 위탁
              </span>
              <h4 className="font-extrabold text-gray-900 text-base group-hover:text-[#8C734B] transition-colors">판매하기</h4>
              <p className="text-[11px] text-gray-500">내 명품, 쉽고 빠르게 판매하기</p>
            </div>
            <div className="pr-1">
              <LuxuryHandshakeIcon className="w-12 h-12 transition-transform group-hover:scale-105" />
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

        {/* 8-Grid 프리미엄 각인 아이콘 메뉴 */}
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
              <div className="w-12 h-12 bg-[#FAF9F6] rounded-2xl flex items-center justify-center border border-[#EAE6DD] shadow-2xs group-hover:bg-[#F2EFE9] group-hover:border-[#B49A67]/50 group-hover:shadow-xs transition-all">
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
          {currentRecommendList.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <div 
                key={item.id} 
                data-testid="recommend-product-card"
                onClick={() => {
                  setSelectedProduct({
                    id: item.id,
                    brand: item.brand,
                    title: item.title,
                    price: item.price,
                    original: item.original,
                    discount: item.discount,
                    image: item.image,
                    category: item.category
                  });
                  setSelectedDays(3);
                }}
                className="flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-square bg-gray-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs">
                  <ProductImage src={item.image} alt={item.title} category={item.category} />
                  <button
                    type="button"
                    aria-label={`${item.title} 좋아요`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) {
                        showToast('좋아요를 저장하려면 먼저 로그인해주세요.', 'info');
                        setActiveOverlay('LOGIN');
                      } else {
                        try {
                          const isNowFav = await toggleFavorite(item.id);
                          showToast(isNowFav ? `'${item.title}' 관심 상품에 추가되었습니다.` : `'${item.title}' 관심 상품에서 해제되었습니다.`, 'info');
                        } catch (err: any) {
                          showToast('좋아요 저장 중 서버 오류가 발생했습니다. 다시 시도해주세요.', 'error');
                        }
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-white transition shadow-xs z-10"
                  >
                    <Heart 
                      size={16} 
                      fill={isFav ? '#EF4444' : 'none'}
                      className={isFav ? 'text-red-500' : 'text-gray-400'}
                    />
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
            );
          })}
        </div>
      </section>

      {/* 5. RENT NEW ARRIVALS */}
      <section className="p-5 bg-white mb-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h3 className="font-extrabold text-lg text-gray-900 uppercase tracking-tight">Rent New Arrivals</h3>
        <p className="text-xs text-gray-500 mb-4">매주 수요일 오전 11시 업데이트</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {RENT_NEW_ARRIVALS.map((arrival) => (
            <div 
              key={arrival.id}
              onClick={() => {
                setSelectedProduct({
                  id: arrival.id,
                  brand: arrival.brand,
                  title: arrival.title,
                  price: arrival.price,
                  image: arrival.imageUrl,
                  category: arrival.category
                });
                setSelectedDays(3);
              }}
              className="min-w-[150px] w-[150px] bg-gray-50/80 hover:bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-2xs flex flex-col cursor-pointer transition group"
            >
              <span className="font-extrabold text-xs w-full text-left mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                {arrival.brand}
              </span>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-gray-200/60 shadow-2xs mb-2 bg-white">
                <ProductImage 
                  src={arrival.imageUrl} 
                  alt={arrival.title} 
                  category={arrival.category}
                  productId={arrival.id}
                />
              </div>
              <span className="text-[11px] text-gray-600 truncate font-medium mb-1">
                {arrival.title}
              </span>
              <span className="text-pink-600 font-extrabold text-xs">
                일 {arrival.price}부터
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. 전체보기 버튼 & 푸터 */}
      <div className="bg-white p-5 pt-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <button
          type="button"
          onClick={() => navigateTo('SHOP_CATEGORY')}
          className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.99] py-3.5 rounded-xl text-sm font-bold text-gray-800 flex justify-center items-center gap-1 mb-10 transition-all shadow-2xs"
        >
          전체보기 <ChevronRight size={16} />
        </button>

        <footer className="text-xs text-gray-500 border-t border-gray-100 pt-6">
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 font-semibold">
            <span 
              onClick={() => setServiceInfoModal({
                title: 'LUXURYRENTAL 고객센터 안내',
                desc: '운영시간: 평일 10:00 - 18:00 (점심시간 12:30 - 13:30 / 주말 및 공휴일 휴무)\n전화 문의: 1544-0000\n이메일 문의: support@luxuryrental.com\n카카오톡 채널: @럭셔리렌탈'
              })}
              className="hover:text-black cursor-pointer"
            >
              고객센터
            </span>
            <span 
              onClick={() => setServiceInfoModal({
                title: 'LUXURYRENTAL 정책 안내',
                desc: '럭셔리렌탈은 100% 정품 인증 검수를 거친 정품만을 대여 및 판매하며, 가품 판정 시 200% 보상 제도를 운영하고 있습니다. 일상적인 경미 스크래치는 무상 케어 보증이 적용됩니다.'
              })}
              className="hover:text-black cursor-pointer"
            >
              정책안내
            </span>
            <span 
              onClick={() => setActiveLegalDoc('TERMS_OF_SERVICE')}
              className="hover:text-black cursor-pointer"
            >
              이용약관
            </span>
            <span 
              onClick={() => setActiveLegalDoc('PRIVACY_POLICY')}
              className="font-extrabold text-gray-800 hover:text-black cursor-pointer"
            >
              개인정보처리방침
            </span>
            <span 
              onClick={() => showToast('입점 제휴 문의는 support@luxuryrental.com 으로 사업자등록증과 브랜드 소개서를 보내주세요.', 'info')}
              className="hover:text-black cursor-pointer"
            >
              입점신청
            </span>
            <span 
              onClick={() => showToast('마케팅 및 파트너십 문의는 contact@luxuryrental.com 으로 접수해주세요.', 'info')}
              className="hover:text-black cursor-pointer"
            >
              제휴문의
            </span>
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

      {/* 8. 장바구니 및 모의 주문 결제 모달 */}
      <Modal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        title={
          cartStep === 'CART'
            ? `나의 렌탈 장바구니 (${cartItems.length})`
            : cartStep === 'SHIPPING'
            ? '렌탈 배송지 정보 입력'
            : '렌탈 주문 접수 완료'
        }
      >
        <div className="space-y-4">
          {cartStep === 'CART' && (
            <>
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-gray-500 space-y-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <ShoppingCart size={22} />
                  </div>
                  <p className="text-xs font-semibold">장바구니가 비어 있습니다.</p>
                  <p className="text-[11px] text-gray-400">원하시는 명품을 선택하여 장바구니에 담아보세요.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCartModalOpen(false);
                      navigateTo('SHOP_CATEGORY');
                    }}
                    className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition"
                  >
                    상품 둘러보기
                  </button>
                </div>
              ) : (
                <>
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 scrollbar-hide">
                    {cartItems.map((cItem) => (
                      <div key={cItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200/60 flex items-center justify-center">
                          <ProductImage src={cItem.image} alt={cItem.title} category={cItem.category} productId={cItem.id} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-indigo-600 block leading-tight">{cItem.brand}</span>
                          <h5 className="text-xs font-bold text-gray-900 truncate">{cItem.title}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold">{cItem.days}일 렌탈</span>
                            <span className="text-xs font-extrabold text-gray-950">{cItem.price}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="장바구니 항목 삭제"
                          onClick={() => handleRemoveFromCart(cItem.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Price summary */}
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600 text-[11px]">
                      <span>보증금</span>
                      <span className="font-bold text-indigo-600">0원 (VIP 무보증 프로모션)</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-[11px]">
                      <span>배송비</span>
                      <span className="font-bold text-gray-900">무료 (왕복 특송)</span>
                    </div>
                    <div className="border-t border-indigo-100 pt-2 flex justify-between font-black text-sm text-gray-950">
                      <span>총 예상 대여료</span>
                      <span className="text-indigo-600">
                        {cartItems.reduce((acc, it) => acc + parseNumericPrice(it.price), 0).toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleStartCheckout}
                      className="flex-1 py-3 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black active:scale-[0.98] transition shadow-md"
                    >
                      주문서 작성으로 이동
                    </button>
                    <button
                      type="button"
                      onClick={() => setCartModalOpen(false)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition"
                    >
                      계속 둘러보기
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {cartStep === 'SHIPPING' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>주문 품목 ({cartItems.length}건)</span>
                  <span className="font-black text-indigo-600 text-sm">
                    총 {cartItems.reduce((acc, it) => acc + parseNumericPrice(it.price), 0).toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    수령인 성명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="수령인 성함 입력"
                    className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    휴대폰 연락처 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    배송지 주소 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="도로명 주소 및 상세 주소"
                    className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    배송 시 요청사항
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="예: 부재 시 문 앞 보관"
                    className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-black transition"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold">VIP 특송 혜택:</span> 전문 보안 포장재 및 반납용 밀봉 테이프가 함께 동봉되며, 발송 및 반납 택배비는 100% 무료입니다.
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCartStep('CART')}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  className="flex-1 py-3 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black active:scale-[0.98] transition shadow-md"
                >
                  최종 결제 및 렌탈 예약 접수
                </button>
              </div>
            </div>
          )}

          {cartStep === 'ORDER_COMPLETE' && completedOrder && (
            <div className="space-y-4 text-center py-2 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                <PackageCheck size={28} />
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Order Confirmed</span>
                <h4 className="text-base font-black text-gray-950 mt-0.5">렌탈 주문이 완료되었습니다!</h4>
                <p className="text-xs text-gray-500 mt-1">
                  주문번호: <span className="font-bold text-gray-900">{completedOrder.orderId}</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>수령인</span>
                  <span className="font-bold text-gray-900">{completedOrder.recipientName} ({completedOrder.recipientPhone})</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>배송지</span>
                  <span className="font-bold text-gray-900 max-w-[200px] truncate text-right">{completedOrder.shippingAddress}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>결제 대여료</span>
                  <span className="font-black text-indigo-600">{completedOrder.formattedTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>배송 일정</span>
                  <span className="font-bold text-emerald-700">익일 오전 10시 특송 발송 예정</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCartModalOpen(false);
                    navigateTo('SHOP_MY_PAGE');
                  }}
                  className="flex-1 py-3 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black active:scale-[0.98] transition shadow-md"
                >
                  주문 내역 보기 (마이페이지)
                </button>
                <button
                  type="button"
                  onClick={() => setCartModalOpen(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition"
                >
                  쇼핑 계속하기
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 9. 상품 상세 안내 & 렌탈 신청 모달 */}
      <Modal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title="상품 상세 정보"
      >
        {selectedProduct && (() => {
          const pricing = calculateRentalPriceDetails(
            selectedProduct.price,
            selectedProduct.original,
            selectedDays
          );

          return (
            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                <ProductImage
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  category={selectedProduct.category}
                  productId={selectedProduct.id}
                />
                <div className="absolute top-2.5 right-2.5">
                  <button
                    type="button"
                    aria-label="관심 상품 저장"
                    onClick={async () => {
                      if (!user) {
                        showToast('좋아요를 저장하려면 먼저 로그인해주세요.', 'info');
                        setActiveOverlay('LOGIN');
                      } else {
                        const numId = typeof selectedProduct.id === 'number' ? selectedProduct.id : parseInt(String(selectedProduct.id).replace(/\D/g, '') || '1', 10);
                        const isNowFav = await toggleFavorite(numId);
                        showToast(isNowFav ? '관심 상품에 추가되었습니다.' : '관심 상품에서 해제되었습니다.', 'info');
                      }
                    }}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-xs hover:bg-white text-gray-400 hover:text-red-500 transition"
                  >
                    <Heart
                      size={18}
                      fill={favorites.includes(typeof selectedProduct.id === 'number' ? selectedProduct.id : parseInt(String(selectedProduct.id).replace(/\D/g, '') || '1', 10)) ? '#EF4444' : 'none'}
                      className={favorites.includes(typeof selectedProduct.id === 'number' ? selectedProduct.id : parseInt(String(selectedProduct.id).replace(/\D/g, '') || '1', 10)) ? 'text-red-500' : 'text-gray-400'}
                    />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">{selectedProduct.brand}</span>
                <h4 className="text-base font-black text-gray-950 mt-0.5 leading-snug">{selectedProduct.title}</h4>
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <span className="text-rose-500 font-extrabold text-base">{pricing.formattedDiscount}</span>
                  <span className="font-black text-lg text-gray-950">
                    {pricing.formattedCurrentPrice}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">/{selectedDays}일 기준</span>
                  <span className="text-xs text-gray-400 line-through ml-1">{pricing.formattedBasePrice}</span>
                  <span className="text-[11px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-md ml-auto">
                    1일 {pricing.formattedDailyRate}
                  </span>
                </div>
              </div>

              {/* 정품 인증 배지 */}
              <div className="flex items-center gap-2.5 p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl text-amber-900 text-xs font-bold">
                <ShieldCheck size={20} className="text-amber-600 shrink-0" />
                <div>
                  <p className="leading-tight">한국명품감정원 100% 정품 인증 완료</p>
                  <p className="text-[10px] text-amber-700/80 font-normal mt-0.5">정품 보증서 동봉 및 위조품 시 200% 책임 보상</p>
                </div>
              </div>

              {/* 렌탈 기간 선택 */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">렌탈 기간 선택</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 7, 15, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setSelectedDays(days)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        selectedDays === days
                          ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {days}일
                    </button>
                  ))}
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(selectedProduct, selectedDays)}
                  className="flex-1 py-3 bg-white border border-gray-900 text-gray-950 rounded-xl font-bold text-xs hover:bg-gray-50 active:scale-[0.98] transition"
                >
                  장바구니 담기
                </button>
                <button
                  type="button"
                  onClick={() => handleRentNow(selectedProduct, selectedDays)}
                  className="flex-1 py-3 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black active:scale-[0.98] transition shadow-md"
                >
                  바로 렌탈 신청
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    navigateTo('SHOP_CATEGORY');
                  }}
                  className="text-[11px] text-gray-500 underline hover:text-gray-800 transition"
                >
                  카테고리에서 다른 명품 둘러보기
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* 10. 앱 다운로드 안내 모달 */}
      <Modal
        isOpen={appDownloadModalOpen}
        onClose={() => setAppDownloadModalOpen(false)}
        title="LUXURYRENTAL 모바일 전용 앱"
      >
        <div className="space-y-4 text-center">
          <div className="p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl border border-indigo-100 flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 mb-3">
              <QrCodeSvg size={120} />
            </div>
            <p className="text-xs font-extrabold text-indigo-950">스마트폰 카메라로 QR 코드를 비춰주세요</p>
            <p className="text-[11px] text-gray-600 mt-1">
              별도의 스토어 검색 없이 즉시 모바일 앱 또는 홈 화면 바로가기를 설치할 수 있습니다.
            </p>
          </div>

          <div className="space-y-2 text-left bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs text-gray-700">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>모바일 웹 & 앱 100% 기능 동일 지원</span>
            </div>
            <p className="text-[11px] text-gray-500 pl-6 leading-relaxed">
              현재 웹 브라우저에서도 주문, 결제, 찜, 판매 신청 등 모든 기능이 완벽하게 동작합니다.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                showToast('Google Play 공식 릴리즈 사전 예약이 완료되었습니다.', 'success');
                setAppDownloadModalOpen(false);
              }}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition flex items-center justify-center gap-1.5"
            >
              <Smartphone size={14} /> Google Play
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('App Store 공식 릴리즈 사전 예약이 완료되었습니다.', 'success');
                setAppDownloadModalOpen(false);
              }}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition flex items-center justify-center gap-1.5"
            >
              <Smartphone size={14} /> App Store
            </button>
          </div>
        </div>
      </Modal>

      {/* 11. 서비스 상세 안내 모달 */}
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

      {/* 12. 이용약관 및 개인정보처리방침 공통 모달 */}
      <LegalTermsModal
        isOpen={!!activeLegalDoc}
        docType={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
      />
    </div>
  );
};
