import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronLeft, MessageCircle, ShoppingCart, ChevronRight, Heart, 
  ShieldCheck, PackageCheck, Trash2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { BrandMonogram } from './ui/LuxuryIcons';
import { ProductImage } from './ui/ProductImage';
import { Modal } from './ui/Modal';
import { 
  BRAND_PRODUCTS_MAP, 
  CATEGORY_TOP_TILES,
  getAllCatalogProducts,
  type CatalogProduct 
} from '../data/catalog';
import { calculateRentalPriceDetails } from '../utils/pricing';
import { api } from '../services/api';

// 카테고리별 세부 서브카테고리 매핑
const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  '가방/핸드백': ['전체', '토트백', '숄더백/호보백', '크로스/메신저백', '버킷백', '클러치/파우치', '백팩', '벨트백/힙색', '서류가방', '여행가방'],
  '의류': ['전체', '자켓/블레이저', '코트/트렌치', '원피스/드레스', '니트/가디건', '탑/셔츠', '팬츠', '스커트', '패딩/다운'],
  '슈즈': ['전체', '스니커즈/운동화', '펌프스/힐', '플랫/로퍼', '부츠/워커', '뮬/샌들', '슬리퍼/슬라이드'],
  '지갑': ['전체', '장지갑', '중지갑/반지갑', '카드지갑', '동전/키지갑', '머니클립'],
  '패션잡화': ['전체', '머플러/스카프', '벨트', '모자', '선글라스/안경', '장갑', '키링/스트랩'],
  '시계/액세서리': ['전체', '명품시계', '목걸이/펜던트', '귀걸이', '팔찌/뱅글', '반지', '헤어액세서리'],
  '골프': ['전체', '골프웨어', '골프백/파우치', '골프화', '골프모자/장갑', '골프 액세서리'],
  '화장품/향수': ['전체', '럭셔리 향수', '스킨케어', '메이크업', '바디/헤어케어', '캔들/디퓨저']
};

// 카테고리 LNB와 카탈로그 카테고리 코드 매핑
const CATEGORY_MAP: Record<string, string[]> = {
  '가방/핸드백': ['bag'],
  '의류': ['clothing'],
  '슈즈': ['shoes'],
  '지갑': ['wallet'],
  '패션잡화': ['bag', 'clothing', 'wallet'],
  '시계/액세서리': ['watch', 'jewelry'],
  '골프': ['clothing', 'bag'],
  '화장품/향수': ['jewelry']
};

// 서브카테고리 키워드 매핑
const SUBCATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  '토트백': ['토트'],
  '숄더백/호보백': ['숄더', '호보'],
  '크로스/메신저백': ['크로스', '메신저', '플랩', '카세트'],
  '버킷백': ['버킷'],
  '클러치/파우치': ['클러치', '파우치'],
  '백팩': ['백팩'],
  '벨트백/힙색': ['벨트백', '힙색', '웨이스트', '벨트'],
  '서류가방': ['서류', '브리프'],
  '여행가방': ['여행', '트래블', '스피디', '보스턴'],
  '자켓/블레이저': ['자켓', '재킷', '블레이저'],
  '코트/트렌치': ['코트', '트렌치'],
  '원피스/드레스': ['원피스', '드레스'],
  '니트/가디건': ['니트', '가디건', '스웨터', '크루넥'],
  '탑/셔츠': ['셔츠', '탑', '티셔츠'],
  '팬츠': ['팬츠', '바지', '슬랙스', '데님'],
  '스커트': ['스커트', '치마'],
  '패딩/다운': ['패딩', '다운', '파카'],
  '스니커즈/운동화': ['스니커즈', '운동화', '러너', '트랙'],
  '펌프스/힐': ['펌프스', '힐', '슬링백'],
  '플랫/로퍼': ['플랫', '로퍼', '더비', '블로퍼'],
  '부츠/워커': ['부츠', '워커', '첼시', '앵클'],
  '뮬/샌들': ['뮬', '샌들'],
  '슬리퍼/슬라이드': ['슬리퍼', '슬라이드'],
  '장지갑': ['장지갑', '월렛'],
  '중지갑/반지갑': ['반지갑', '중지갑', '폴더'],
  '카드지갑': ['카드', '카드홀더'],
  '동전/키지갑': ['동전', '키', '코인'],
  '머플러/스카프': ['머플러', '스카프', '숄'],
  '벨트': ['벨트'],
  '모자': ['모자', '캡', '버킷', '비니'],
  '선글라스/안경': ['선글라스', '안경', '아이웨어'],
  '장갑': ['장갑', '글러브'],
  '키링/스트랩': ['키링', '스트랩', '참'],
  '명품시계': ['시계', '서브마리너', '데이토나', '탱크', '산토스'],
  '목걸이/펜던트': ['목걸이', '펜던트', '네크리스', '알함브라'],
  '귀걸이': ['귀걸이', '이어링'],
  '팔찌/뱅글': ['팔찌', '뱅글', '브레이슬릿'],
  '반지': ['반지', '링'],
  '헤어액세서리': ['헤어', '집게', '슈슈', '밴드'],
  '골프웨어': ['골프', '웨어', '니트'],
  '골프백/파우치': ['골프백', '파우치', '캐디'],
  '골프화': ['골프화', '슈즈'],
  '럭셔리 향수': ['향수', '퍼퓸', '오드'],
  '스킨케어': ['스킨', '세럼', '크림'],
  '메이크업': ['립스틱', '쿠션', '파운데이션']
};

interface CartItem {
  id: string | number;
  brand: string;
  title: string;
  price: string;
  days: number;
  image: string;
  category: string;
}

export const ShopCategory = () => {
  const { goBack, navigateTo, setActiveOverlay, user, favorites, toggleFavorite } = useApp();
  const { showToast } = useToast();
  const [mainTab, setMainTab] = useState<'CATEGORY' | 'BRAND'>('CATEGORY');
  const [subTab, setSubTab] = useState('여성');
  const [leftActive, setLeftActive] = useState('가방/핸드백');
  const [activeBrand, setActiveBrand] = useState('루이비통');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('전체');

  const [serverBrandProducts, setServerBrandProducts] = useState<CatalogProduct[]>([]);
  const [isLoadingBrand, setIsLoadingBrand] = useState(false);

  // 상품 상세 모달 및 렌탈 기간 상태
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(3);

  // 장바구니 및 고객센터 모달 상태
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [cartStep, setCartStep] = useState<'CART' | 'SHIPPING' | 'ORDER_COMPLETE'>('CART');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('010-8842-1920');
  const [shippingAddress, setShippingAddress] = useState('서울특별시 강남구 압구정로 142 럭셔리타워 5층');
  const [deliveryNote, setDeliveryNote] = useState('부재 시 문 앞 보관 후 문자 부탁드립니다.');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxury_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 브랜드 가로 스크롤 및 좌우 이동 상태 관리
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrollActive] = useState(true);
  const isHoveredRef = useRef(false);
  const autoScrollDirection = useRef<'right' | 'left'>('right');

  // 마우스 드래그로 좌우 이동 처리
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const leftCategories = ['가방/핸드백', '의류', '슈즈', '지갑', '패션잡화', '시계/액세서리', '골프', '화장품/향수'];
  const currentSubCategories = SUBCATEGORIES_BY_CATEGORY[leftActive] || SUBCATEGORIES_BY_CATEGORY['가방/핸드백'];

  const brands = [
    { name: '루이비통' }, 
    { name: '스톤 아일랜드' },
    { name: '구찌' }, 
    { name: '샤넬' },
    { name: 'CP 컴퍼니' }, 
    { name: '셀린느' },
    { name: '프라다' },
    { name: '디올' },
    { name: '에르메스' },
    { name: '보테가 베네타' },
    { name: '생로랑' },
    { name: '발렌시아가' },
    { name: '롤렉스' },
    { name: '까르띠에' }
  ];

  // 카탈로그 전체 상품 데이터 로드 및 카테고리 필터링
  const allCatalog = useMemo(() => getAllCatalogProducts(), []);

  const displayedCategoryProducts = useMemo(() => {
    const targetCategories = CATEGORY_MAP[leftActive] || ['bag'];
    const matchedCategoryItems = allCatalog.filter(item => targetCategories.includes(item.category));

    if (selectedSubCategory === '전체') {
      return matchedCategoryItems.length > 0 ? matchedCategoryItems : allCatalog.slice(0, 8);
    }

    const keywords = SUBCATEGORY_KEYWORD_MAP[selectedSubCategory] || [selectedSubCategory];
    const filteredBySub = matchedCategoryItems.filter(item => 
      keywords.some(kw => item.title.includes(kw) || item.brand.includes(kw))
    );

    // 키워드 일치 상품이 있을 경우 반환, 없을 경우 해당 대분류 상품들을 폴백으로 제공하여 공백 방지
    return filteredBySub.length > 0 ? filteredBySub : matchedCategoryItems;
  }, [allCatalog, leftActive, selectedSubCategory]);

  // 브랜드 탭 전환 시 서버 데이터베이스에서 실시간 조회 (관리자가 등록한 최신 상품 포함)
  useEffect(() => {
    if (mainTab === 'BRAND') {
      let isCurrent = true;
      setIsLoadingBrand(true);
      api.getProducts({ brand: activeBrand })
        .then(res => {
          if (isCurrent && res?.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped: CatalogProduct[] = res.data.map(item => ({
              id: item.id,
              brand: item.brand,
              title: item.title,
              price: typeof item.price === 'number' ? `${item.price.toLocaleString()}원` : String(item.price),
              discount: item.discount_rate || '',
              unit: item.unit || '/1일',
              tag: item.tag || '',
              isExcellent: item.price >= 800000 || item.tag === '프리미엄' || item.tag === '인기상품',
              category: item.category || 'bag',
              imageUrl: item.image_url || undefined,
              imageStatus: 'READY'
            }));
            setServerBrandProducts(mapped);
          } else if (isCurrent) {
            setServerBrandProducts([]);
          }
        })
        .catch(() => {
          if (isCurrent) setServerBrandProducts([]);
        })
        .finally(() => {
          if (isCurrent) setIsLoadingBrand(false);
        });

      return () => { isCurrent = false; };
    }
  }, [mainTab, activeBrand]);

  const baseBrandProducts = BRAND_PRODUCTS_MAP[activeBrand] || BRAND_PRODUCTS_MAP['루이비통'] || [];
  const adminNewProducts = serverBrandProducts.filter(sp => 
    !baseBrandProducts.some(bp => bp.title === sp.title) && sp.imageUrl
  );
  const currentBrandProducts: CatalogProduct[] = [...baseBrandProducts, ...adminNewProducts];

  const handleTileClick = (targetCategory: string, tileTitle: string) => {
    setLeftActive(targetCategory);
    setSelectedSubCategory('전체');
    showToast(`'${tileTitle}' 카테고리(${targetCategory})로 이동했습니다.`, 'info');
    setTimeout(() => {
      if (productGridRef.current) {
        const container = productGridRef.current.closest('.overflow-y-auto') as HTMLElement | null;
        if (container) {
          container.scrollTo({ top: productGridRef.current.offsetTop - 12, behavior: 'smooth' });
        }
      }
    }, 150);
  };

  const handleSubCategoryClick = (sub: string) => {
    setSelectedSubCategory(sub);
    showToast(`${leftActive} > ${sub} 상품을 불러왔습니다.`, 'info');
    setTimeout(() => {
      if (productGridRef.current) {
        const container = productGridRef.current.closest('.overflow-y-auto') as HTMLElement | null;
        if (container) {
          container.scrollTo({ top: productGridRef.current.offsetTop - 12, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const handleProductClick = (item: CatalogProduct) => {
    setSelectedProduct(item);
  };

  const handleAddToCart = (product: CatalogProduct, days: number) => {
    const details = calculateRentalPriceDetails(product.price, product.originalPrice, days);
    const newItem: CartItem = {
      id: product.id,
      brand: product.brand,
      title: product.title,
      price: details.formattedCurrentPrice,
      days,
      image: product.imageUrl,
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

  const handleRentNow = (product: CatalogProduct, days: number) => {
    const details = calculateRentalPriceDetails(product.price, product.originalPrice, days);
    const newItem: CartItem = {
      id: product.id,
      brand: product.brand,
      title: product.title,
      price: details.formattedCurrentPrice,
      days,
      image: product.imageUrl,
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

  const handleCompleteOrder = () => {
    if (!shippingAddress.trim()) {
      showToast('배송지 주소를 입력해주세요.', 'error');
      return;
    }
    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = cartItems.reduce((acc, cur) => {
      const num = parseInt(cur.price.replace(/[^0-9]/g, ''), 10) || 0;
      return acc + num;
    }, 0);

    const orderData = {
      orderId,
      items: [...cartItems],
      recipientName: recipientName.trim() || '고객님',
      recipientPhone: recipientPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      deliveryNote: deliveryNote.trim(),
      totalAmount,
      formattedTotal: `${totalAmount.toLocaleString('ko-KR')}원`,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = localStorage.getItem('luxury_orders');
      const orderList = existing ? JSON.parse(existing) : [];
      localStorage.setItem('luxury_orders', JSON.stringify([orderData, ...orderList]));
      localStorage.removeItem('luxury_cart');
    } catch {}

    setCartItems([]);
    setCompletedOrder(orderData);
    setCartStep('ORDER_COMPLETE');
    showToast('렌탈 주문 접수가 성공적으로 완료되었습니다!', 'success');
  };

  // 좌우 스크롤 가능 여부 실시간 업데이트
  const updateScrollButtons = () => {
    if (!brandScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = brandScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    if (mainTab !== 'BRAND') return;
    const el = brandScrollRef.current;
    if (!el) return;
    
    const timer = setTimeout(updateScrollButtons, 100);
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [mainTab, brands.length]);

  // 좌우 화살표 버튼 클릭 시 부드러운 스크롤 이동
  const handleBrandScroll = (direction: 'left' | 'right') => {
    if (!brandScrollRef.current) return;
    const offset = direction === 'left' ? -220 : 220;
    brandScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 350);
  };

  // 마우스 드래그로 좌우 스크롤
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!brandScrollRef.current) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - brandScrollRef.current.offsetLeft;
    scrollLeftRef.current = brandScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !brandScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - brandScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    brandScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    updateScrollButtons();
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => { hasDraggedRef.current = false; }, 60);
  };

  // 부드러운 자동 좌우 롤링/이동 (사용자가 마우스 호버 또는 드래그 중일 때는 정지)
  useEffect(() => {
    if (mainTab !== 'BRAND' || !isAutoScrollActive) return;

    const interval = setInterval(() => {
      if (isHoveredRef.current || isMouseDownRef.current || !brandScrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = brandScrollRef.current;
      
      if (autoScrollDirection.current === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          autoScrollDirection.current = 'left';
          brandScrollRef.current.scrollBy({ left: -140, behavior: 'smooth' });
        } else {
          brandScrollRef.current.scrollBy({ left: 140, behavior: 'smooth' });
        }
      } else {
        if (scrollLeft <= 15) {
          autoScrollDirection.current = 'right';
          brandScrollRef.current.scrollBy({ left: 140, behavior: 'smooth' });
        } else {
          brandScrollRef.current.scrollBy({ left: -140, behavior: 'smooth' });
        }
      }
      setTimeout(updateScrollButtons, 400);
    }, 3200);

    return () => clearInterval(interval);
  }, [mainTab, isAutoScrollActive]);

  const handleBrandSelect = (brandName: string, element: HTMLElement) => {
    if (hasDraggedRef.current) return;
    setActiveBrand(brandName);

    // native scrollIntoView 대신 brandScrollRef 컨테이너 내부만 정밀 스크롤하여
    // 상위 부모 컨테이너(max-w-md 등)의 수평 밀림(173px 하얀 공백) 결함을 100% 원천 차단
    if (brandScrollRef.current) {
      const container = brandScrollRef.current;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      const containerWidth = container.clientWidth;
      const maxScroll = container.scrollWidth - containerWidth;

      const targetScroll = Math.max(0, Math.min(elementLeft - (containerWidth / 2) + (elementWidth / 2), maxScroll));
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }

    // 부모 컨테이너 수평 밀림 방지 안전 가드
    const mainContainer = element.closest('.max-w-md') as HTMLElement | null;
    if (mainContainer && mainContainer.scrollLeft !== 0) {
      mainContainer.scrollLeft = 0;
    }

    setTimeout(updateScrollButtons, 350);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. 상단 헤더 */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-white">
        <button 
          type="button"
          aria-label="메인 화면으로 뒤로가기"
          onClick={() => goBack('SHOP_MAIN')}
          className="p-1 -ml-1 text-gray-800 hover:text-black transition active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-extrabold text-gray-900 tracking-tight">카테고리</h1>
        <div className="flex gap-3 text-gray-800">
          <button 
            type="button" 
            aria-label="고객센터 및 실시간 문의" 
            onClick={() => setCustomerModalOpen(true)}
            className="p-1 hover:text-black transition active:scale-95"
          >
            <MessageCircle size={21} />
          </button>
          <button 
            type="button" 
            aria-label="장바구니" 
            onClick={() => {
              if (!user) {
                setActiveOverlay('LOGIN');
              } else {
                setCartStep('CART');
                setCartModalOpen(true);
              }
            }}
            className="p-1 hover:text-black transition relative active:scale-95"
          >
            <ShoppingCart size={21} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. 메인 탭 (카테고리 / 브랜드) */}
      <nav aria-label="카테고리 메인 탭" className="flex border-b border-gray-200 px-4 bg-white">
        <button 
          type="button"
          onClick={() => setMainTab('CATEGORY')}
          className={`flex-1 py-3 text-[15px] font-extrabold text-center border-b-2 transition-all ${
            mainTab === 'CATEGORY' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          카테고리
        </button>
        <button 
          type="button"
          onClick={() => setMainTab('BRAND')}
          className={`flex-1 py-3 text-[15px] font-extrabold text-center border-b-2 transition-all ${
            mainTab === 'BRAND' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          브랜드
        </button>
      </nav>

      {/* 3-A. 카테고리 뷰 */}
      {mainTab === 'CATEGORY' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 서브 탭: 여성 / 남성 / 아동 */}
          <div className="flex px-4 border-b border-gray-100 bg-white">
            {['여성', '남성', '아동'].map(tab => (
              <button 
                key={tab} 
                type="button"
                onClick={() => setSubTab(tab)}
                className={`py-3 mr-6 text-sm font-extrabold border-b-2 transition-all ${
                  subTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* 좌측 LNB 대분류 목록 */}
            <div className="w-[104px] bg-gray-50 border-r border-gray-100 overflow-y-auto scrollbar-hide py-2">
              {leftCategories.map(cat => (
                <button
                  key={cat} 
                  type="button"
                  onClick={() => {
                    setLeftActive(cat);
                    setSelectedSubCategory('전체');
                  }}
                  className={`w-full text-left px-4 py-3.5 text-[13px] transition-all flex items-center justify-between ${
                    leftActive === cat 
                      ? 'bg-white font-black text-black shadow-2xs border-l-3 border-black' 
                      : 'text-gray-600 hover:text-black hover:bg-gray-100/60 font-medium'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>

            {/* 우측 세부 콘텐츠 */}
            <div className="flex-1 bg-white overflow-y-auto scrollbar-hide p-4 sm:p-5">
              {/* 상단 추천 3개 카드: 실사 패션 스튜디오 에셋 적용 */}
              <div className="flex justify-between gap-2.5 mb-6">
                {CATEGORY_TOP_TILES.map((tile) => {
                  const isActive = leftActive === tile.targetCategory;
                  return (
                    <div 
                      key={tile.id}
                      onClick={() => handleTileClick(tile.targetCategory, tile.title)}
                      className={`flex flex-col items-center gap-1.5 w-1/3 p-1.5 rounded-xl transition cursor-pointer group ${
                        isActive ? 'bg-gray-100/80 ring-1 ring-black/10' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-gray-200/80 shadow-2xs group-hover:shadow-xs transition-all bg-gray-100">
                        <img 
                          src={tile.imageUrl} 
                          alt={tile.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                        )}
                      </div>
                      <span className="text-[11px] text-center font-bold text-gray-800 break-keep leading-tight group-hover:text-black">
                        {subTab} {tile.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 세부 카테고리 리스트 (그리드 버튼 형태로 오른편 배치) */}
              <div className="border-t border-gray-100 pt-3">
                <div className="pb-2.5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>{leftActive} 세부 카테고리</span>
                  {selectedSubCategory !== '전체' && (
                    <span className="text-indigo-600 font-extrabold normal-case">
                      선택: {selectedSubCategory}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-6">
                  {currentSubCategories.map((sub, idx) => {
                    const isSelected = selectedSubCategory === sub;
                    return (
                      <div 
                        key={idx} 
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSubCategoryClick(sub)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSubCategoryClick(sub)}
                        className={`flex justify-between items-center py-2.5 px-3 rounded-lg cursor-pointer transition-all group ${
                          isSelected 
                            ? 'bg-gray-950 text-white font-black shadow-xs' 
                            : 'bg-gray-50 hover:bg-gray-100/90 text-gray-800 font-semibold border border-gray-100/80'
                        }`}
                      >
                        <span className={`text-[12px] truncate ${isSelected ? 'font-black text-white' : 'group-hover:text-black'}`}>
                          {sub}
                        </span>
                        <ChevronRight 
                          size={13} 
                          className={`shrink-0 ml-1 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-gray-400 group-hover:translate-x-0.5'}`} 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 🌟 선택된 카테고리 & 서브카테고리 상품 그리드 (화면 공백 버그 원천 해결) */}
              <div ref={productGridRef} className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-[13px] text-gray-950 tracking-tight flex items-center gap-1.5">
                    <span>{leftActive}</span>
                    {selectedSubCategory !== '전체' && (
                      <span className="text-indigo-600 font-bold">&gt; {selectedSubCategory}</span>
                    )}
                    <span className="text-xs text-gray-400 font-bold">({displayedCategoryProducts.length})</span>
                  </h3>
                  {selectedSubCategory !== '전체' && (
                    <button 
                      type="button" 
                      onClick={() => setSelectedSubCategory('전체')}
                      className="text-[11px] text-gray-400 hover:text-black underline font-semibold"
                    >
                      전체보기
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 mb-8">
                  {displayedCategoryProducts.map((item) => {
                    const numericId = typeof item.id === 'number'
                      ? item.id
                      : (parseInt(String(item.id).replace(/\D/g, ''), 10) || 1);
                    const isFav = favorites.includes(numericId);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleProductClick(item)}
                        className="flex flex-col group cursor-pointer"
                      >
                        <div className="relative aspect-square bg-gray-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs">
                          <ProductImage 
                            src={item.imageUrl} 
                            alt={item.title} 
                            category={item.category}
                            productId={item.id}
                          />
                          <button 
                            type="button"
                            aria-label={`${item.title} 좋아요`}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!user) {
                                showToast('좋아요를 저장하려면 로그인이 필요합니다.', 'info');
                                setActiveOverlay('LOGIN');
                              } else {
                                try {
                                  const isNowFav = await toggleFavorite(numericId);
                                  showToast(isNowFav ? `'${item.title}' 관심 상품에 추가되었습니다.` : `'${item.title}' 관심 상품에서 해제되었습니다.`, 'info');
                                } catch (err: any) {
                                  showToast('좋아요 저장 중 서버 오류가 발생했습니다. 다시 시도해주세요.', 'error');
                                }
                              }
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-white transition shadow-xs z-10"
                          >
                            <Heart 
                              size={15}
                              fill={isFav ? '#EF4444' : 'none'}
                              className={isFav ? 'text-red-500' : 'text-gray-400'}
                            />
                          </button>
                          {item.tag === 'N' && (
                            <div className="absolute bottom-2 left-2 bg-black text-white text-[9px] font-black w-4 h-4 flex justify-center items-center rounded-xs z-10 shadow-xs">
                              N
                            </div>
                          )}
                          {item.isExcellent && (
                            <div className="absolute top-2 left-2 bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs z-10 shadow-2xs">
                              EXCELLENT
                            </div>
                          )}
                        </div>
                        <span className="font-black text-xs text-gray-900 group-hover:text-[#B49A67] transition-colors truncate">{item.brand}</span>
                        <span className="text-[11px] text-gray-600 truncate">{item.title}</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          {item.discount && <span className="text-teal-600 font-extrabold text-xs">{item.discount}</span>}
                          <span className="font-extrabold text-xs text-gray-950">{item.price}</span>
                          <span className="text-[9px] text-gray-400">/일</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  type="button"
                  onClick={() => setMainTab('BRAND')}
                  className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.99] py-3 rounded-xl text-xs font-bold text-gray-800 flex justify-center items-center gap-1 mb-8 transition-all shadow-2xs"
                >
                  명품 브랜드관으로 이동하기 <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-B. 브랜드 뷰 */}
      {mainTab === 'BRAND' && (
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {/* 상단 타이틀 */}
          <div className="mb-3">
            <h2 className="font-black text-lg text-gray-950 tracking-tight">인기 브랜드 ({brands.length})</h2>
          </div>
          
          {/* 인기 브랜드 모노그램 칩 가로 스크롤 & 좌우 이동 슬라이더 */}
          <div 
            className="relative group mb-6"
            onMouseEnter={() => { isHoveredRef.current = true; }}
            onMouseLeave={() => { isHoveredRef.current = false; handleMouseUp(); }}
            onTouchStart={() => { isHoveredRef.current = true; }}
            onTouchEnd={() => { isHoveredRef.current = false; }}
          >
            {/* 좌측 플로팅 이동 버튼 */}
            {canScrollLeft && (
              <button
                type="button"
                aria-label="브랜드 왼쪽으로 이동"
                onClick={() => handleBrandScroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-gray-800 hover:text-black hover:scale-110 active:scale-95 transition"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* 우측 플로팅 이동 버튼 */}
            {canScrollRight && (
              <button
                type="button"
                aria-label="브랜드 오른쪽으로 이동"
                onClick={() => handleBrandScroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-gray-800 hover:text-black hover:scale-110 active:scale-95 transition"
              >
                <ChevronRight size={16} />
              </button>
            )}

            {/* 좌우 페이드 그라디언트 오버레이 */}
            <div className={`absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

            {/* 브랜드 모노그램 칩 가로 스크롤 컨테이너 */}
            <div 
              ref={brandScrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 pt-1 scroll-smooth select-none cursor-grab active:cursor-grabbing px-1"
            >
              {brands.map((brand, i) => (
                <div 
                  key={i} 
                  onClick={(e) => handleBrandSelect(brand.name, e.currentTarget)} 
                  className="flex flex-col items-center gap-2 cursor-pointer min-w-[62px] active:scale-95 transition-transform shrink-0"
                >
                  <BrandMonogram name={brand.name} active={activeBrand === brand.name} />
                  <span className={`text-[11px] whitespace-nowrap transition-colors ${
                    activeBrand === brand.name ? 'text-[#252525] font-black' : 'text-gray-600 font-bold'
                  }`}>
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 선택된 브랜드 상품 그리드 (2열) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 mb-6">
            {currentBrandProducts.map((item) => {
              const numericId = typeof item.id === 'number'
                ? item.id
                : (parseInt(String(item.id).replace(/\D/g, ''), 10) || 1);
              const isFav = favorites.includes(numericId);
              return (
                <div 
                  key={item.id} 
                  onClick={() => handleProductClick(item)}
                  className="flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-square bg-gray-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs">
                    <ProductImage 
                      src={item.imageUrl} 
                      alt={item.title} 
                      category={item.category}
                      productId={item.id}
                    />
                    <button 
                      type="button"
                      aria-label={`${item.title} 좋아요`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) {
                          showToast('좋아요를 저장하려면 로그인이 필요합니다.', 'info');
                          setActiveOverlay('LOGIN');
                        } else {
                          try {
                            const isNowFav = await toggleFavorite(numericId);
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
                    {item.tag === 'N' && (
                      <div className="absolute bottom-2 left-2 bg-black text-white text-[9px] font-black w-4 h-4 flex justify-center items-center rounded-xs z-10 shadow-xs">
                        N
                      </div>
                    )}
                    {item.isExcellent && (
                      <div className="absolute top-2 left-2 bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs z-10 shadow-2xs">
                        EXCELLENT
                      </div>
                    )}
                  </div>
                  <span className="font-black text-xs text-gray-900 group-hover:text-[#B49A67] transition-colors">{activeBrand}</span>
                  <span className="text-[11px] text-gray-600 truncate">{item.title}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    {item.discount && <span className="text-teal-600 font-extrabold text-sm">{item.discount}</span>}
                    <span className="font-extrabold text-sm text-gray-950">{item.price}</span>
                    <span className="text-[10px] text-gray-400">/일</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            type="button"
            onClick={() => showToast(`${activeBrand} 전용 기획전 페이지 준비 중입니다.`, 'info')}
            className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.99] py-3.5 rounded-xl text-sm font-bold text-gray-800 flex justify-center items-center gap-1 mb-8 transition-all shadow-2xs"
          >
            {activeBrand} 상품 더보기 ({currentBrandProducts.length}개 상품) <ChevronRight size={16}/>
          </button>
        </div>
      )}

      {/* 🌟 4. 상품 상세 모달 */}
      <Modal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title="상품 상세 정보"
      >
        {selectedProduct && (() => {
          const pricing = calculateRentalPriceDetails(
            selectedProduct.price,
            selectedProduct.originalPrice,
            selectedDays
          );

          return (
            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                <ProductImage
                  src={selectedProduct.imageUrl}
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
                        const numId = typeof selectedProduct.id === 'number' 
                          ? selectedProduct.id 
                          : parseInt(String(selectedProduct.id).replace(/\D/g, '') || '1', 10);
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
                          ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {days}일
                    </button>
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(selectedProduct, selectedDays)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-xs text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition"
                >
                  장바구니 담기
                </button>
                <button
                  type="button"
                  onClick={() => handleRentNow(selectedProduct, selectedDays)}
                  className="flex-1 py-3 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black active:scale-[0.98] transition shadow-md"
                >
                  바로 렌탈하기
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* 🌟 5. 장바구니 & 모의 주문 결제 모달 */}
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
                  <ShoppingCart size={40} className="mx-auto text-gray-300 stroke-1" />
                  <p className="text-xs">장바구니가 비어 있습니다.</p>
                  <button
                    type="button"
                    onClick={() => setCartModalOpen(false)}
                    className="px-4 py-2 bg-gray-950 text-white rounded-xl text-xs font-bold hover:bg-black transition"
                  >
                    상품 둘러보기
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 relative group"
                      >
                        <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-200/80 flex items-center justify-center">
                          <ProductImage
                            src={item.image}
                            alt={item.title}
                            category={item.category}
                            productId={item.id}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{item.brand}</span>
                          <h5 className="text-xs font-bold text-gray-900 truncate">{item.title}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-gray-950">{item.price}</span>
                            <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-semibold">
                              {item.days}일 렌탈
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="장바구니 항목 삭제"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-600">총 결제 예정 대여료</span>
                    <span className="text-sm font-black text-indigo-600">
                      {cartItems
                        .reduce((acc, cur) => acc + (parseInt(cur.price.replace(/[^0-9]/g, ''), 10) || 0), 0)
                        .toLocaleString('ko-KR')}원
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCartModalOpen(false)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition"
                    >
                      계속 쇼핑
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCartStep('SHIPPING');
                        if (user) {
                          setRecipientName(user.name || '홍길동');
                          if (user.phone) setRecipientPhone(user.phone);
                        } else {
                          setRecipientName('VIP 고객님');
                        }
                      }}
                      className="flex-1 py-3 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black active:scale-[0.98] transition shadow-md"
                    >
                      주문서 작성하기
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {cartStep === 'SHIPPING' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    수령인 이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="수령인 성명"
                    className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    연락처 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
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

      {/* 🌟 6. 고객센터 안내 모달 */}
      <Modal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        title="LUXURYRENTAL 고객센터 안내"
      >
        <div className="space-y-4 text-xs text-gray-700">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <p className="font-bold text-gray-900 text-sm">전문 상담원 1:1 상담 안내</p>
            <p className="text-gray-600 leading-relaxed">
              • 운영 시간: 평일 10:00 - 18:00 (점심시간 12:30 - 13:30 / 주말 및 공휴일 휴무)<br />
              • 대표 전화: <span className="font-bold text-gray-950">1544-0000</span><br />
              • 이메일 문의: <span className="font-bold text-gray-950">support@luxuryrental.com</span><br />
              • 카카오톡 플러스친구: <span className="font-bold text-gray-950">@럭셔리렌탈</span>
            </p>
          </div>
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-indigo-950">
            <span className="font-bold">빠른 상담 TIP:</span> 렌탈 예약 번호 또는 상품명을 함께 남겨주시면 더욱 신속하게 안내받으실 수 있습니다.
          </div>
          <button
            type="button"
            onClick={() => setCustomerModalOpen(false)}
            className="w-full py-3 bg-gray-950 text-white rounded-xl font-bold text-xs hover:bg-black transition"
          >
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
};
