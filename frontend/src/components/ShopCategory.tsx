import React, { useState } from 'react';
import { ChevronLeft, MessageCircle, ShoppingCart, ChevronRight, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  LuxurySneakerIcon, LuxuryJewelryIcon, LuxuryCoatIcon, 
  BrandMonogram, ProductVisualBadge 
} from './ui/LuxuryIcons';

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

// 브랜드별 상품 데이터
interface BrandProduct {
  tag: string;
  isExcellent: boolean;
  title: string;
  price: string;
  discount: string;
  unit: string;
  category: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
}

const BRAND_PRODUCTS_MAP: Record<string, BrandProduct[]> = {
  '루이비통': [
    { tag: 'N', isExcellent: false, title: '핑크 LV 에센셜 머플러', price: '15,800원', discount: '', unit: '/1일', category: 'clothing' },
    { tag: '', isExcellent: true, title: '루이비통 M41526 모노그램 ...', price: '902,100원', discount: '7%', unit: '', category: 'bag' },
    { tag: '', isExcellent: false, title: '블랙 앙프렝뜨 이지 파우치 온 ...', price: '17,800원', discount: '', unit: '/1일', category: 'bag' },
    { tag: '', isExcellent: true, title: '루이비통 블랙 에삐 레더 미라...', price: '1,220,000원', discount: '', unit: '', category: 'bag' },
    { tag: '', isExcellent: true, title: '루이비통 모노그램 NN14 이...', price: '1,480,000원', discount: '', unit: '', category: 'bag' },
    { tag: '', isExcellent: true, title: '모노그램 네오노에 BB 버킷백', price: '1,890,000원', discount: '5%', unit: '', category: 'bag' },
  ],
  '스톤 아일랜드': [
    { tag: 'N', isExcellent: true, title: '와펜 패치 소프트쉘 나일론 자켓', price: '680,000원', discount: '10%', unit: '', category: 'clothing' },
    { tag: '', isExcellent: false, title: '크루넥 가먼트다잉 맨투맨 블랙', price: '12,500원', discount: '', unit: '/1일', category: 'clothing' },
    { tag: '', isExcellent: true, title: '고스트피스 나일론 메탈 후드', price: '890,000원', discount: '8%', unit: '', category: 'clothing' },
    { tag: '', isExcellent: false, title: '컴패스 로고 볼캡 블랙 프리', price: '8,000원', discount: '', unit: '/1일', category: 'clothing' },
    { tag: '', isExcellent: true, title: '카고 조거 팬츠 슬림핏 차콜', price: '520,000원', discount: '12%', unit: '', category: 'clothing' },
    { tag: '', isExcellent: true, title: '크링클 랩스 나일론 다운 패딩', price: '1,350,000원', discount: '15%', unit: '', category: 'clothing' },
  ],
  '구찌': [
    { tag: 'N', isExcellent: false, title: 'GG 마몽 스몰 숄더백 블랙', price: '22,000원', discount: '', unit: '/1일', category: 'bag' },
    { tag: '', isExcellent: true, title: '홀스빗 1955 미니 탑핸들백', price: '2,450,000원', discount: '8%', unit: '', category: 'bag' },
    { tag: '', isExcellent: true, title: '재키 1961 스몰 숄더백 에토프', price: '2,890,000원', discount: '6%', unit: '', category: 'bag' },
    { tag: '', isExcellent: false, title: '인터로킹 G 체인 크로스 파우치', price: '16,500원', discount: '', unit: '/1일', category: 'bag' },
    { tag: '', isExcellent: true, title: 'GG 수프림 오피디아 토트백', price: '1,780,000원', discount: '9%', unit: '', category: 'bag' },
    { tag: '', isExcellent: true, title: '디오니소스 슈퍼미니 체인백', price: '1,120,000원', discount: '', unit: '', category: 'bag' },
  ],
  '샤넬': [
    { tag: 'N', isExcellent: true, title: '클래식 미디엄 캐비어 금장 플랩', price: '13,500,000원', discount: '5%', unit: '', category: 'bag' },
    { tag: '', isExcellent: false, title: '샤넬 22 미니 핸드백 블랙 유광', price: '55,000원', discount: '', unit: '/1일', category: 'bag' },
    { tag: '', isExcellent: true, title: '보이 샤넬 스몰 쉐브론 체인백', price: '7,900,000원', discount: '', unit: '', category: 'bag' },
    { tag: '', isExcellent: false, title: 'CC 로고 클래식 카드홀더 캐비어', price: '9,800원', discount: '', unit: '/1일', category: 'wallet' },
    { tag: '', isExcellent: true, title: '가브리엘 호보백 스몰 빈티지', price: '6,200,000원', discount: '7%', unit: '', category: 'bag' },
    { tag: '', isExcellent: true, title: '코코핸들 미니 쉐브론 블랙 샴페인', price: '8,400,000원', discount: '', unit: '', category: 'bag' },
  ],
  'CP 컴퍼니': [
    { tag: 'N', isExcellent: true, title: '렌즈 와펜 소프트쉘 후드 집업', price: '450,000원', discount: '14%', unit: '', category: 'clothing' },
    { tag: '', isExcellent: false, title: '크롬-R 고글 다운 자켓 올리브', price: '18,000원', discount: '', unit: '/1일', category: 'clothing' },
    { tag: '', isExcellent: true, title: '가먼트다잉 렌즈 카고 팬츠', price: '380,000원', discount: '11%', unit: '', category: 'clothing' },
    { tag: '', isExcellent: false, title: '프로-텍 고글 아노락 자켓', price: '14,000원', discount: '', unit: '/1일', category: 'clothing' },
    { tag: '', isExcellent: true, title: '다이애그널 플리스 스웻셔츠', price: '290,000원', discount: '10%', unit: '', category: 'clothing' },
    { tag: '', isExcellent: true, title: '나일론 B 크로스바디 고글 힙색', price: '240,000원', discount: '8%', unit: '', category: 'bag' },
  ],
  '셀린느': [
    { tag: 'N', isExcellent: false, title: '틴 트리옹프 샤이니 카프스킨 블랙', price: '32,000원', discount: '', unit: '/1일', category: 'bag' },
    { tag: '', isExcellent: true, title: '트리옹프 캔버스 아바백 탄', price: '1,980,000원', discount: '6%', unit: '', category: 'bag' },
    { tag: '', isExcellent: true, title: '클래식 박스백 미디엄 카프스킨', price: '3,800,000원', discount: '', unit: '', category: 'bag' },
    { tag: '', isExcellent: false, title: '트리옹프 폴코 백 미니 숄더백', price: '21,000원', discount: '', unit: '/1일', category: 'bag' },
    { tag: '', isExcellent: true, title: '러기지 나노 수리 드럼드 카프', price: '2,900,000원', discount: '7%', unit: '', category: 'bag' },
    { tag: '', isExcellent: true, title: '카바스 트리옹프 미니 토트백', price: '1,750,000원', discount: '', unit: '', category: 'bag' },
  ]
};

export const ShopCategory = () => {
  const { setCurrentView, setActiveOverlay } = useApp();
  const [mainTab, setMainTab] = useState<'CATEGORY' | 'BRAND'>('CATEGORY');
  const [subTab, setSubTab] = useState('여성');
  const [leftActive, setLeftActive] = useState('가방/핸드백');
  const [activeBrand, setActiveBrand] = useState('루이비통');

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

  const currentBrandProducts = BRAND_PRODUCTS_MAP[activeBrand] || BRAND_PRODUCTS_MAP['루이비통'];

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. 상단 헤더 */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-white">
        <button 
          type="button"
          aria-label="메인 화면으로 뒤로가기"
          onClick={() => setCurrentView('SHOP_MAIN')}
          className="p-1 -ml-1 text-gray-800 hover:text-black transition"
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
                  onClick={() => setLeftActive(cat)}
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
              {/* 상단 추천 3개 카드 (이모지 대신 세련된 벡터 일러스트) */}
              <div className="flex justify-between gap-2.5 mb-6">
                <div className="flex flex-col items-center gap-1.5 w-1/3 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer group">
                  <div className="bg-gray-50 group-hover:bg-gray-100 border border-gray-100 rounded-xl aspect-square w-full flex items-center justify-center transition-colors">
                    <LuxurySneakerIcon className="w-8 h-8 text-neutral-800 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] text-center font-bold text-gray-800 break-keep leading-tight">
                    {subTab} 오늘의 스니커즈
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-1/3 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer group">
                  <div className="bg-gray-50 group-hover:bg-gray-100 border border-gray-100 rounded-xl aspect-square w-full flex items-center justify-center transition-colors">
                    <LuxuryJewelryIcon className="w-8 h-8 text-amber-500 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] text-center font-bold text-gray-800 break-keep leading-tight">
                    {subTab} 요즘 이게 잘 나갑니다
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-1/3 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer group">
                  <div className="bg-gray-50 group-hover:bg-gray-100 border border-gray-100 rounded-xl aspect-square w-full flex items-center justify-center transition-colors">
                    <LuxuryCoatIcon className="w-8 h-8 text-neutral-700 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] text-center font-bold text-gray-800 break-keep leading-tight">
                    {subTab} 옷장 업데이트
                  </span>
                </div>
              </div>

              {/* 세부 카테고리 리스트 */}
              <div className="border-t border-gray-100">
                <div className="py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {leftActive} 전체 세부 카테고리
                </div>
                {currentSubCategories.map((sub, idx) => (
                  <div 
                    key={idx} 
                    role="button"
                    tabIndex={0}
                    className="flex justify-between items-center py-3.5 border-b border-gray-50 hover:bg-gray-50/80 px-1 rounded-lg cursor-pointer transition-colors group"
                  >
                    <span className="text-[13px] text-gray-800 font-bold group-hover:text-black transition-colors">{sub}</span>
                    <ChevronRight size={15} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-B. 브랜드 뷰 */}
      {mainTab === 'BRAND' && (
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <h2 className="font-black text-lg mb-4 text-gray-950 tracking-tight">인기 브랜드 10</h2>
          
          {/* 인기 브랜드 모노그램 칩 가로 스크롤 */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-6">
            {brands.map((brand, i) => (
              <div 
                key={i} 
                onClick={() => setActiveBrand(brand.name)} 
                className="flex flex-col items-center gap-2 cursor-pointer min-w-[60px] active:scale-95 transition-transform"
              >
                <BrandMonogram name={brand.name} active={activeBrand === brand.name} />
                <span className={`text-[11px] font-extrabold ${
                  activeBrand === brand.name ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {brand.name}
                </span>
              </div>
            ))}
          </div>

          {/* 선택된 브랜드 상품 그리드 (2열) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 mb-6">
            {currentBrandProducts.map((item, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="relative aspect-square bg-gray-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs">
                  <ProductVisualBadge brand={activeBrand} category={item.category} />
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
                <span className="font-black text-xs text-gray-900 group-hover:text-blue-600 transition-colors">{activeBrand}</span>
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
            className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.99] py-3.5 rounded-xl text-sm font-bold text-gray-800 flex justify-center items-center gap-1 mb-8 transition-all shadow-2xs"
          >
            {activeBrand} 상품 더보기 <ChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
};
