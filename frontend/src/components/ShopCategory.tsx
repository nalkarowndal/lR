import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MessageCircle, ShoppingCart, ChevronRight, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { BrandMonogram } from './ui/LuxuryIcons';
import { ProductImage } from './ui/ProductImage';
import { 
  BRAND_PRODUCTS_MAP, 
  CATEGORY_TOP_TILES,
  type CatalogProduct 
} from '../data/catalog';
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

  // 브랜드 가로 스크롤 및 좌우 이동 상태 관리
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);
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

  // 브랜드 탭 전환 시 서버 데이터베이스에서 실시간 조회 (관리자가 등록한 최신 상품 포함)
  useEffect(() => {
    if (mainTab === 'BRAND') {
      let isCurrent = true;
      setIsLoadingBrand(true);
      api.getProducts({ brand: activeBrand })
        .then(res => {
          if (isCurrent && res?.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped: CatalogProduct[] = res.data.map(item => ({
              id: item.id, // REAL DB integer ID
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
  };

  const handleSubCategoryClick = (sub: string) => {
    setSelectedSubCategory(sub);
    showToast(`${leftActive} > ${sub} 필터가 적용되었습니다.`, 'info');
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
    element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setTimeout(updateScrollButtons, 350);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. 상단 헤더 */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-white">
        <button 
          type="button"
          aria-label="메인 화면으로 뒤로가기"
          onClick={() => navigateTo('SHOP_MAIN')}
          className="p-1 -ml-1 text-gray-800 hover:text-black transition active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-extrabold text-gray-900 tracking-tight">카테고리</h1>
        <div className="flex gap-3 text-gray-800">
          <button 
            type="button" 
            aria-label="고객센터 및 실시간 문의" 
            onClick={() => setActiveOverlay('LOGIN')}
            className="p-1 hover:text-black transition"
          >
            <MessageCircle size={21} />
          </button>
          <button 
            type="button" 
            aria-label="장바구니" 
            onClick={() => setActiveOverlay('LOGIN')}
            className="p-1 hover:text-black transition"
          >
            <ShoppingCart size={21} />
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

              {/* 세부 카테고리 리스트 */}
              <div className="border-t border-gray-100">
                <div className="py-2.5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>{leftActive} 전체 세부 카테고리</span>
                  {selectedSubCategory !== '전체' && (
                    <span className="text-blue-600 font-extrabold normal-case">
                      선택: {selectedSubCategory}
                    </span>
                  )}
                </div>
                {currentSubCategories.map((sub, idx) => {
                  const isSelected = selectedSubCategory === sub;
                  return (
                    <div 
                      key={idx} 
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSubCategoryClick(sub)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSubCategoryClick(sub)}
                      className={`flex justify-between items-center py-3.5 border-b border-gray-50 px-2 rounded-lg cursor-pointer transition-colors group ${
                        isSelected ? 'bg-gray-100 text-black font-black' : 'hover:bg-gray-50/80 text-gray-800 font-semibold'
                      }`}
                    >
                      <span className={`text-[13px] transition-colors ${isSelected ? 'font-black text-black' : 'group-hover:text-black'}`}>
                        {sub}
                      </span>
                      <ChevronRight 
                        size={15} 
                        className={`transition-transform ${isSelected ? 'text-black translate-x-1' : 'text-gray-400 group-hover:translate-x-0.5'}`} 
                      />
                    </div>
                  );
                })}
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
                  onClick={() => showToast(`'${item.brand} ${item.title}' 렌탈 상세 페이지 준비 중입니다.`, 'info')}
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
    </div>
  );
};
