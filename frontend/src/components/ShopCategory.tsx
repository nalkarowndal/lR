import React, { useState } from 'react';
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
  const { goBack, setActiveOverlay } = useApp();
  const { showToast } = useToast();
  const [mainTab, setMainTab] = useState<'CATEGORY' | 'BRAND'>('CATEGORY');
  const [subTab, setSubTab] = useState('여성');
  const [leftActive, setLeftActive] = useState('가방/핸드백');
  const [activeBrand, setActiveBrand] = useState('루이비통');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('전체');

  const leftCategories = ['가방/핸드백', '의류', '슈즈', '지갑', '패션잡화', '시계/액세서리', '골프', '화장품/향수'];
  const currentSubCategories = SUBCATEGORIES_BY_CATEGORY[leftActive] || SUBCATEGORIES_BY_CATEGORY['가방/핸드백'];

  const brands = [
    { name: '루이비통' }, 
    { name: '스톤 아일랜드' },
    { name: '구찌' }, 
    { name: '샤넬' },
    { name: 'CP 컴퍼니' }, 
    { name: '셀린느' }
  ];

  const currentBrandProducts: CatalogProduct[] = BRAND_PRODUCTS_MAP[activeBrand] || BRAND_PRODUCTS_MAP['루이비통'] || [];

  const handleTileClick = (targetCategory: string, tileTitle: string) => {
    setLeftActive(targetCategory);
    setSelectedSubCategory('전체');
    showToast(`'${tileTitle}' 카테고리(${targetCategory})로 이동했습니다.`, 'info');
  };

  const handleSubCategoryClick = (sub: string) => {
    setSelectedSubCategory(sub);
    showToast(`${leftActive} > ${sub} 필터가 적용되었습니다.`, 'info');
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg text-gray-950 tracking-tight">인기 브랜드 ({brands.length})</h2>
            <span className="text-xs text-gray-400 font-medium">전체 {currentBrandProducts.length}개 상품</span>
          </div>
          
          {/* 인기 브랜드 모노그램 칩 가로 스크롤 */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-6">
            {brands.map((brand, i) => (
              <div 
                key={i} 
                onClick={() => setActiveBrand(brand.name)} 
                className="flex flex-col items-center gap-2 cursor-pointer min-w-[60px] active:scale-95 transition-transform"
              >
                <BrandMonogram name={brand.name} active={activeBrand === brand.name} />
                <span className={`text-[11px] transition-colors ${
                  activeBrand === brand.name ? 'text-[#252525] font-black' : 'text-gray-600 font-bold'
                }`}>
                  {brand.name}
                </span>
              </div>
            ))}
          </div>

          {/* 선택된 브랜드 상품 그리드 (2열) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 mb-6">
            {currentBrandProducts.map((item) => (
              <div key={item.id} className="flex flex-col group cursor-pointer">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveOverlay('LOGIN');
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/70 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-white transition shadow-xs z-10"
                  >
                    <Heart size={16}/>
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
                  {item.unit && <span className="text-[10px] text-gray-400">{item.unit}</span>}
                </div>
              </div>
            ))}
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
