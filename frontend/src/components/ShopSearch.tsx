import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Search as SearchIcon, X, ArrowUp, ArrowDown, Heart, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './ui/Modal';
import { ProductImage } from './ui/ProductImage';
import { SEARCH_CATALOG, type CatalogProduct } from '../data/catalog';
import { calculateRentalPriceDetails, formatProductPrice, getStatusBadgeConfig } from '../utils/pricing';
import { api } from '../services/api';

export const ShopSearch = () => {
  const { activeOverlay, setActiveOverlay, user, favorites, toggleFavorite } = useApp();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 'SEARCH' 상태일 때만 열림
  const isOpen = activeOverlay === 'SEARCH';

  // 상품 상세 모달 상태
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(3);

  useEffect(() => {
    if (isOpen) {
      // 300ms 슬라이드 전환이 완전히 완료된 후(320ms) preventScroll: true로 초점 이동
      // 데스크톱(1440px) 뷰포트에서 조기 focus로 인한 130px 가로 스크롤 밀림 현상 원천 방지
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
        window.scrollTo({ left: 0 });
      }, 320);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setActiveOverlay(null);
        }

        // W3C WAI-ARIA Modal Dialog Pattern: Focus Trap
        if (e.key === 'Tab' && dialogRef.current) {
          const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setSearchQuery('');
    }
  }, [isOpen, setActiveOverlay]);

  const recommended = ['Supreme', 'Matin', 'Chrome', '불가리', 'Essentials', '목걸이', '까르띠에', '시계', '르메르', 'BAPE', 'The'];
  
  const trendingLeft = [
    { rank: 1, name: '샤넬', status: null }, 
    { rank: 2, name: '셀린느', status: null },
    { rank: 3, name: '발렌시아가', status: { type: 'new', text: 'new' } },
    { rank: 4, name: '디올', status: { type: 'up', text: '1' } },
    { rank: 5, name: '프라다', status: { type: 'down', text: '1' } },
  ];
  
  const trendingRight = [
    { rank: 6, name: '루이비통', status: { type: 'down', text: '3' } },
    { rank: 7, name: '에르메스', status: { type: 'up', text: '1' } },
    { rank: 8, name: '더로우', status: { type: 'new', text: 'new' } },
    { rank: 9, name: '고야드', status: { type: 'new', text: 'new' } },
    { rank: 10, name: '구찌', status: { type: 'new', text: 'new' } },
  ];

  // 서버 실시간 상품 DB 검색 (관리자 등록 상품 포함) 및 오프라인 폴백
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'bag' | 'clothing' | 'shoes' | 'jewelry_watch'>('ALL');

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.search(q);
        const lowerQ = q.toLowerCase();
        const localMatches = SEARCH_CATALOG.filter((item: CatalogProduct) => 
          item.brand.toLowerCase().includes(lowerQ) || 
          item.title.toLowerCase().includes(lowerQ)
        );

        if (isCurrent && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const validServerItems = res.data.filter((item: any) => item.image_url);
          const mapped: CatalogProduct[] = validServerItems.map((item: any) => {
            const isBuy = item.type === 'BUY';
            const formattedPrice = formatProductPrice(item.price, item.type, item.unit);
            return {
              id: item.id,
              brand: item.brand,
              title: item.title,
              price: formattedPrice,
              category: item.category || 'bag',
              imageUrl: item.image_url || undefined,
              tag: item.tag || (isBuy ? '구매 가능' : '렌탈 가능'),
              imageStatus: 'READY' as const
            };
          });

          // Start with server results (real SQLite DB entries with live stock & IDs)
          const combined = [...mapped];
          // Supplement with local catalog items that aren't already represented
          for (const lItem of localMatches) {
            if (!combined.some(c => c.title === lItem.title || (c.imageUrl && lItem.imageUrl && c.imageUrl === lItem.imageUrl))) {
              combined.push(lItem);
            }
          }
          setSearchResults(combined.length > 0 ? combined : localMatches);
        } else if (isCurrent) {
          setSearchResults(localMatches);
        }
      } catch (err) {
        if (isCurrent) {
          const lowerQ = q.toLowerCase();
          const fallback = SEARCH_CATALOG.filter((item: CatalogProduct) => 
            item.brand.toLowerCase().includes(lowerQ) || 
            item.title.toLowerCase().includes(lowerQ)
          );
          setSearchResults(fallback);
        }
      } finally {
        if (isCurrent) {
          setIsSearching(false);
        }
      }
    }, 120);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleKeywordClick = (word: string) => {
    setSearchResults([]);
    setIsSearching(true);
    setSearchQuery(word);
    inputRef.current?.focus();
  };

  const handleAddToCart = (product: CatalogProduct, days: number) => {
    if (!user) {
      showToast('로그인이 필요한 서비스입니다. 먼저 로그인해 주세요.', 'info');
      setSelectedProduct(null);
      setActiveOverlay('LOGIN');
      return;
    }
    const details = calculateRentalPriceDetails(product.price, product.originalPrice, days);
    const newItem = {
      id: product.id,
      brand: product.brand,
      title: product.title,
      price: details.formattedCurrentPrice,
      days,
      image: product.imageUrl,
      category: product.category
    };
    try {
      const saved = localStorage.getItem('luxury_cart');
      const cart = saved ? JSON.parse(saved) : [];
      const updated = [...cart.filter((item: any) => item.id !== product.id), newItem];
      localStorage.setItem('luxury_cart', JSON.stringify(updated));
    } catch {}
    showToast(`'${product.brand} ${product.title}' 상품이 장바구니에 담겼습니다.`, 'success');
    setSelectedProduct(null);
  };

  const handleRentNow = (product: CatalogProduct, days: number) => {
    if (!user) {
      showToast('로그인이 필요한 서비스입니다. 먼저 로그인해 주세요.', 'info');
      setSelectedProduct(null);
      setActiveOverlay('LOGIN');
      return;
    }
    handleAddToCart(product, days);
  };

  const filteredResults = searchResults.filter((item: CatalogProduct) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'jewelry_watch') {
      return item.category === 'jewelry' || item.category === 'watch';
    }
    return item.category === selectedCategory;
  });

  return (
    <div 
      ref={dialogRef}
      aria-modal="true"
      role="dialog"
      aria-label="통합 검색"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={`absolute inset-0 bg-white z-[110] transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 pointer-events-none invisible'
      }`}
    >
      {/* 상단 검색바 헤더 */}
      <div className="flex items-center px-4 py-3 gap-3 bg-white border-b border-gray-100 shadow-2xs">
        <button 
          type="button"
          aria-label="검색창 닫기"
          onClick={() => setActiveOverlay(null)} 
          className="p-1 -ml-1 text-gray-800 hover:text-black transition"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 border border-gray-900 rounded-lg px-3 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-black/10 transition-all">
          <input 
            ref={inputRef} 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchResults([]);
              setIsSearching(true);
              setSearchQuery(e.target.value);
            }}
            placeholder="검색어를 입력해주세요" 
            className="w-full text-[15px] outline-none placeholder-gray-400 font-medium bg-transparent" 
          />
          {searchQuery ? (
            <button 
              type="button" 
              aria-label="검색어 지우기"
              onClick={() => {
                setSearchResults([]);
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#F5F2ED] border border-[#E6E0D4] flex items-center justify-center text-[#252525] shadow-2xs">
              <SearchIcon size={12} className="text-[#252525] stroke-[2.5]" />
            </div>
          )}
        </div>
      </div>

      {/* 검색 결과 화면 또는 추천/인기 검색어 화면 */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 scrollbar-hide">
        {searchQuery.trim().length > 0 ? (
          <div>
            {/* 카테고리 필터 칩 */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 mb-3 scrollbar-hide">
              {[
                { id: 'ALL', label: '전체' },
                { id: 'bag', label: '가방' },
                { id: 'clothing', label: '의류' },
                { id: 'shoes', label: '슈즈' },
                { id: 'jewelry_watch', label: '주얼리/시계' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
                    selectedCategory === cat.id
                      ? 'bg-gray-950 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-[15px] text-gray-900 flex items-center gap-2">
                검색 결과 <span className="text-indigo-600 font-black">({filteredResults.length})</span>
                {isSearching && <span className="text-xs text-gray-400 font-normal animate-pulse">검색 중...</span>}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="text-xs text-gray-400 hover:text-gray-700 underline"
              >
                검색어 초기화
              </button>
            </div>

            {isSearching ? (
              /* 스켈레톤 로딩 */
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="p-2 rounded-xl bg-gray-50/70 border border-gray-100 animate-pulse space-y-2">
                    <div className="aspect-square bg-gray-200 rounded-lg w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm font-semibold mb-2">'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
                <p className="text-xs text-gray-400">정확한 브랜드명 또는 상품명을 다시 입력해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredResults.map((item: CatalogProduct) => {
                  const numericId = typeof item.id === 'number'
                    ? item.id
                    : (parseInt(String(item.id).replace(/\D/g, ''), 10) || 1);
                  const isFav = favorites.includes(numericId);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedProduct(item)}
                      className="flex flex-col group cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition"
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
                        {item.tag && (() => {
                          const badge = getStatusBadgeConfig(item.tag);
                          return (
                            <div className={`absolute bottom-0 w-full backdrop-blur-xs text-center text-[10px] py-1 font-bold z-10 ${badge ? badge.className : 'bg-black/60 text-white'}`}>
                              {badge ? badge.label : item.tag}
                            </div>
                          );
                        })()}
                      </div>
                      <span className="font-extrabold text-xs text-gray-900 group-hover:text-indigo-600 transition-colors">{item.brand}</span>
                      <span className="text-[11px] text-gray-600 truncate">{item.title}</span>
                      <span className="font-black text-sm text-gray-950 mt-1">{item.price}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 추천 검색어 */}
            <h3 className="font-extrabold text-[17px] mb-4 text-gray-900 tracking-tight">추천 검색어</h3>
            <div className="flex flex-wrap gap-2.5 mb-10">
              {recommended.map(word => (
                <button 
                  key={word} 
                  type="button"
                  onClick={() => handleKeywordClick(word)}
                  className="bg-gray-50 hover:bg-gray-100 hover:text-black border border-gray-100 active:scale-95 text-gray-800 text-[13px] px-4 py-2 rounded-full font-semibold transition-all shadow-2xs"
                >
                  {word}
                </button>
              ))}
            </div>

            {/* 실시간 급상승 키워드 */}
            <div className="flex justify-between items-end mb-5">
              <h3 className="font-extrabold text-[17px] text-gray-900 tracking-tight">실시간 급상승</h3>
              <span className="text-[12px] text-gray-400 font-medium">10.28 10:27 기준</span>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-5">
                {trendingLeft.map(item => (
                  <div 
                    key={item.rank} 
                    onClick={() => handleKeywordClick(item.name)}
                    className="flex items-center justify-between cursor-pointer group hover:bg-gray-50/80 p-1 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base w-4 text-gray-900 group-hover:text-indigo-600 transition-colors">{item.rank}</span>
                      <span className="text-[14px] font-semibold text-gray-800 group-hover:text-black transition-colors">{item.name}</span>
                    </div>
                    {item.status && (
                      <span className="text-[12px] font-bold text-blue-500 flex items-center gap-0.5">
                        {item.status.type === 'up' && <ArrowUp size={12} className="stroke-[3]" />}
                        {item.status.type === 'down' && <ArrowDown size={12} className="stroke-[3]" />}
                        {item.status.type === 'new' ? 'new' : `▲ ${item.status.text}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-5">
                {trendingRight.map(item => (
                  <div 
                    key={item.rank} 
                    onClick={() => handleKeywordClick(item.name)}
                    className="flex items-center justify-between cursor-pointer group hover:bg-gray-50/80 p-1 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base w-4 text-gray-900 group-hover:text-indigo-600 transition-colors">{item.rank}</span>
                      <span className="text-[14px] font-semibold text-gray-800 group-hover:text-black transition-colors">{item.name}</span>
                    </div>
                    {item.status && (
                      <span className="text-[12px] font-bold text-blue-500 flex items-center gap-0.5">
                        {item.status.type === 'up' && <ArrowUp size={12} className="stroke-[3]" />}
                        {item.status.type === 'down' && <ArrowDown size={12} className="stroke-[3]" />}
                        {item.status.type === 'new' ? 'new' : `${item.status.type === 'up' ? '▲' : '▼'} ${item.status.text}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 상품 상세 모달 */}
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
    </div>
  );
};
