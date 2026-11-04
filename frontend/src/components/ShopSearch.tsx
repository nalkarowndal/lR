import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronLeft, Search as SearchIcon, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductVisualBadge } from './ui/LuxuryIcons';

interface SearchResultItem {
  id: string;
  brand: string;
  title: string;
  price: string;
  tag?: string;
  category: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
}

const SEARCH_CATALOG: SearchResultItem[] = [
  { id: '1', brand: '샤넬', title: '샤넬 클래식 플랩백 흑장 체인', price: '24,500원/3일', tag: '예약 마감', category: 'bag' },
  { id: '2', brand: '샤넬', title: '샤넬 22 미니 퀼팅 숄더 핸드백', price: '45,000원/3일', tag: '앱전용', category: 'bag' },
  { id: '3', brand: '까르띠에', title: '탱크 머스트 워치 스몰 스틸', price: '35,000원/3일', tag: '예약 마감', category: 'watch' },
  { id: '4', brand: '까르띠에', title: 'LOVE 브레이슬릿 클래식 옐로우골드', price: '48,000원/3일', tag: '앱전용', category: 'jewelry' },
  { id: '5', brand: '발렌시아가', title: '블랙 르 시티 모토 스몰 숄더백', price: '18,510원/3일', tag: '예약 마감', category: 'bag' },
  { id: '6', brand: '셀린느', title: '틴 트리옹프 샤이니 카프스킨', price: '29,000원/3일', tag: '예약 마감', category: 'bag' },
  { id: '7', brand: '디올', title: '레이디 D-Joy 까나쥬 스몰백', price: '38,000원/3일', tag: '예약 마감', category: 'bag' },
  { id: '8', brand: '프라다', title: '리나일론 삼각로고 남성 벨트백', price: '16,800원/3일', tag: '앱전용', category: 'bag' },
  { id: '9', brand: '루이비통', title: '모노그램 네오노에 BB 버킷백', price: '22,000원/3일', tag: '예약 마감', category: 'bag' },
  { id: '10', brand: '고야드', title: '생루이 PM 토트백 블랙 탠', price: '21,000원/3일', tag: '예약 마감', category: 'bag' },
  { id: '11', brand: '구찌', title: '홀스빗 1955 미니 탑핸들백', price: '24,000원/3일', tag: '앱전용', category: 'bag' },
  { id: '12', brand: '에르메스', title: '에블린 TPM 미니 크로스 에토프', price: '42,000원/3일', tag: '예약 마감', category: 'bag' }
];

export const ShopSearch = () => {
  const { activeOverlay, setActiveOverlay } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 'SEARCH' 상태일 때만 열림
  const isOpen = activeOverlay === 'SEARCH';

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setActiveOverlay(null);
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

  // 검색어 입력 시 필터링 결과
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_CATALOG.filter(item => 
      item.brand.toLowerCase().includes(q) || 
      item.title.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleKeywordClick = (word: string) => {
    setSearchQuery(word);
    inputRef.current?.focus();
  };

  return (
    <div 
      aria-modal="true"
      role="dialog"
      aria-label="통합 검색"
      className={`absolute inset-0 bg-white z-[110] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어를 입력해주세요" 
            className="w-full text-[15px] outline-none placeholder-gray-400 font-medium bg-transparent" 
          />
          {searchQuery ? (
            <button 
              type="button" 
              aria-label="검색어 지우기"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          ) : (
            <SearchIcon size={18} className="text-gray-500" />
          )}
        </div>
      </div>

      {/* 검색 결과 화면 또는 추천/인기 검색어 화면 */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-20 scrollbar-hide">
        {searchQuery.trim().length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-[16px] text-gray-900">
                검색 결과 <span className="text-indigo-600 font-black">({filteredResults.length})</span>
              </h3>
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-700 underline"
              >
                검색어 초기화
              </button>
            </div>

            {filteredResults.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm font-semibold mb-2">'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
                <p className="text-xs text-gray-400">정확한 브랜드명 또는 상품명을 다시 입력해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredResults.map(item => (
                  <div key={item.id} className="flex flex-col group cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition">
                    <div className="relative aspect-square bg-gray-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs">
                      <ProductVisualBadge brand={item.brand} category={item.category} />
                      {item.tag && (
                        <div className="absolute bottom-0 w-full bg-black/60 text-white text-center text-[10px] py-1 font-bold z-10">
                          {item.tag}
                        </div>
                      )}
                    </div>
                    <span className="font-extrabold text-xs text-gray-900">{item.brand}</span>
                    <span className="text-[11px] text-gray-600 truncate">{item.title}</span>
                    <span className="font-black text-sm text-gray-950 mt-1">{item.price}</span>
                  </div>
                ))}
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
    </div>
  );
};
