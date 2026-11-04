/**
 * Unified LuxuryRental Product Catalog Data & Image Registry
 * Single Source of Truth for Main, Category, Brand, Search, Wishlist, and Admin
 */

export type AssetQualityStatus = 
  | 'APPROVED_PHOTOREAL'     // Verified high-resolution genuine studio photograph
  | 'REGENERATE_REQUIRED'    // Vector/geometric art requiring photoreal AI generation
  | 'PRODUCT_MISMATCH'
  | 'REVIEW_REQUIRED';

export interface CatalogProduct {
  id: string;
  brand: string;
  title: string;
  category: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
  price: string;
  originalPrice?: string;
  discount?: string;
  unit?: string;
  tag?: string;
  isExcellent?: boolean;
  imageUrl: string;
  imageStatus: 'READY' | 'PENDING' | 'ERROR';
  assetQuality?: AssetQualityStatus;
  assetSource?: 'STUDIO_AI_PHOTOREAL' | 'VECTOR_RENDER' | 'CATALOG_ARCHIVE';
  verifiedDate?: string;
  condition?: string;
  targetGroup?: string;
}

// 1. 카테고리 상단 3개 추천 타일 비주얼 데이터
export interface CategoryTopTile {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetCategory: string;
}

export const CATEGORY_TOP_TILES: CategoryTopTile[] = [
  {
    id: 'tile-sneakers',
    title: '오늘의 스니커즈',
    subtitle: '디자이너 스니커즈 컬렉션',
    imageUrl: '/assets/categories/sneaker_tile.jpg',
    targetCategory: '슈즈'
  },
  {
    id: 'tile-jewelry',
    title: '요즘 이게 잘 나갑니다',
    subtitle: '하이엔드 파인 주얼리 & 링',
    imageUrl: '/assets/categories/jewelry_tile.jpg',
    targetCategory: '시계/액세서리'
  },
  {
    id: 'tile-apparel',
    title: '봄 신상 코트·자켓',
    subtitle: '시즌 테일러드 코트 & 아우터',
    imageUrl: '/assets/categories/apparel_tile.jpg',
    targetCategory: '의류'
  }
];

// 2. 브랜드별 36대 전체 상품 데이터 (안정적인 ID + 실제 이미지 매핑)
export const BRAND_PRODUCTS_MAP: Record<string, CatalogProduct[]> = {
  '루이비통': [
    {
      id: 'lv-01',
      brand: '루이비통',
      title: '핑크 LV 에센셜 머플러',
      price: '15,800원',
      discount: '',
      unit: '/1일',
      tag: 'N',
      isExcellent: false,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/louisvuitton_scarf.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'lv-02',
      brand: '루이비통',
      title: '루이비통 M41526 모노그램 스피디 25',
      price: '902,100원',
      discount: '7%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/louisvuitton_speedy.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'lv-03',
      brand: '루이비통',
      title: '블랙 앙프렝뜨 이지 파우치 온 스트랩',
      price: '17,800원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'bag',
      imageUrl: '/assets/products/bags/louisvuitton_pouch_black.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'lv-04',
      brand: '루이비통',
      title: '루이비통 블랙 에삐 레더 미라보 PM',
      price: '1,220,000원',
      discount: '',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/louisvuitton_epi_mirabeau.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'lv-05',
      brand: '루이비통',
      title: '루이비통 모노그램 NN14 이디스 버킷백',
      price: '1,480,000원',
      discount: '',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/louisvuitton_nn14_canvas.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'lv-06',
      brand: '루이비통',
      title: '모노그램 네오노에 BB 버킷백',
      price: '1,890,000원',
      discount: '5%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/louisvuitton_neonoe_bb.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ],
  '스톤 아일랜드': [
    {
      id: 'si-01',
      brand: '스톤 아일랜드',
      title: '와펜 패치 소프트쉘 나일론 자켓',
      price: '680,000원',
      discount: '10%',
      unit: '',
      tag: 'N',
      isExcellent: true,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/stoneisland_softshell_jacket.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'si-02',
      brand: '스톤 아일랜드',
      title: '크루넥 가먼트다잉 맨투맨 블랙',
      price: '12,500원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/stoneisland_sweatshirt_black.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'si-03',
      brand: '스톤 아일랜드',
      title: '고스트피스 나일론 메탈 후드',
      price: '890,000원',
      discount: '8%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/stoneisland_ghost_hoodie.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'si-04',
      brand: '스톤 아일랜드',
      title: '컴패스 로고 볼캡 블랙 프리',
      price: '8,000원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/stoneisland_compass_cap.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'si-05',
      brand: '스톤 아일랜드',
      title: '카고 조거 팬츠 슬림핏 차콜',
      price: '520,000원',
      discount: '12%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/stoneisland_cargo_pants.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'si-06',
      brand: '스톤 아일랜드',
      title: '크링클 랩스 나일론 다운 패딩',
      price: '1,350,000원',
      discount: '15%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/stoneisland_down_jacket.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ],
  '구찌': [
    {
      id: 'gu-01',
      brand: '구찌',
      title: 'GG 마몽 스몰 숄더백 블랙',
      price: '22,000원',
      discount: '',
      unit: '/1일',
      tag: 'N',
      isExcellent: false,
      category: 'bag',
      imageUrl: '/assets/products/bags/gucci_marmont_black.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'gu-02',
      brand: '구찌',
      title: '홀스빗 1955 미니 탑핸들백',
      price: '2,450,000원',
      discount: '8%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/gucci_horsebit_1955.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'gu-03',
      brand: '구찌',
      title: '재키 1961 스몰 숄더백 에토프',
      price: '2,890,000원',
      discount: '6%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/gucci_jackie_1961.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'gu-04',
      brand: '구찌',
      title: '인터로킹 G 체인 크로스 파우치',
      price: '16,500원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'bag',
      imageUrl: '/assets/products/bags/gucci_interlocking_pouch.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'gu-05',
      brand: '구찌',
      title: 'GG 수프림 캔버스 슬링 메신저백',
      price: '1,780,000원',
      discount: '9%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/gucci_gg_supreme.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'gu-06',
      brand: '구찌',
      title: '디오니소스 슈퍼미니 체인백',
      price: '1,120,000원',
      discount: '',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/gucci_dionysus_supermini.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ],
  '샤넬': [
    {
      id: 'ch-01',
      brand: '샤넬',
      title: '클래식 미디엄 캐비어 금장 플랩',
      price: '13,500,000원',
      discount: '5%',
      unit: '',
      tag: 'N',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_classic_medium.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ch-02',
      brand: '샤넬',
      title: '샤넬 22 미니 핸드백 블랙 유광',
      price: '55,000원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_22_mini.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ch-03',
      brand: '샤넬',
      title: '보이 샤넬 스몰 쉐브론 체인백',
      price: '7,900,000원',
      discount: '',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_boy_chevron.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ch-04',
      brand: '샤넬',
      title: 'CC 로고 클래식 카드홀더 캐비어',
      price: '9,800원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'wallet',
      imageUrl: '/assets/products/wallets/chanel_classic_cardholder.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ch-05',
      brand: '샤넬',
      title: '가브리엘 호보백 스몰 빈티지',
      price: '6,200,000원',
      discount: '7%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_gabrielle_hobo.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ch-06',
      brand: '샤넬',
      title: '코코핸들 미니 쉐브론 블랙 샴페인',
      price: '8,400,000원',
      discount: '',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_coco_handle.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ],
  'CP 컴퍼니': [
    {
      id: 'cp-01',
      brand: 'CP 컴퍼니',
      title: '렌즈 와펜 소프트쉘 후드 집업',
      price: '450,000원',
      discount: '14%',
      unit: '',
      tag: 'N',
      isExcellent: true,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/cpcompany_lens_hoodie.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'cp-02',
      brand: 'CP 컴퍼니',
      title: '크롬-R 고글 다운 자켓 올리브',
      price: '18,000원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/cpcompany_goggle_jacket.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'cp-03',
      brand: 'CP 컴퍼니',
      title: '가먼트다잉 렌즈 카고 팬츠',
      price: '380,000원',
      discount: '11%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/cpcompany_lens_cargo.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'cp-04',
      brand: 'CP 컴퍼니',
      title: '프로-텍 고글 아노락 자켓',
      price: '14,000원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/cpcompany_goggle_anorak.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'cp-05',
      brand: 'CP 컴퍼니',
      title: '다이애그널 플리스 스웻셔츠',
      price: '290,000원',
      discount: '10%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'clothing',
      imageUrl: '/assets/products/clothing/cpcompany_fleece_sweatshirt.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'cp-06',
      brand: 'CP 컴퍼니',
      title: '나일론 B 크로스바디 고글 힙색',
      price: '240,000원',
      discount: '8%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/cpcompany_goggle_waistbag.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ],
  '셀린느': [
    {
      id: 'ce-01',
      brand: '셀린느',
      title: '틴 트리옹프 샤이니 카프스킨 블랙',
      price: '32,000원',
      discount: '',
      unit: '/1일',
      tag: 'N',
      isExcellent: false,
      category: 'bag',
      imageUrl: '/assets/products/bags/celine_triomphe.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ce-02',
      brand: '셀린느',
      title: '트리옹프 캔버스 아바백 탄',
      price: '1,980,000원',
      discount: '6%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/celine_ava_canvas.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ce-03',
      brand: '셀린느',
      title: '클래식 박스백 미디엄 카프스킨',
      price: '3,800,000원',
      discount: '',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/celine_classic_box.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ce-04',
      brand: '셀린느',
      title: '트리옹프 폴코 백 미니 숄더백',
      price: '21,000원',
      discount: '',
      unit: '/1일',
      tag: '',
      isExcellent: false,
      category: 'bag',
      imageUrl: '/assets/products/bags/celine_folco_shoulder.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ce-05',
      brand: '셀린느',
      title: '러기지 나노 수리 드럼드 카프',
      price: '2,900,000원',
      discount: '7%',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/celine_luggage_nano.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'ce-06',
      brand: '셀린느',
      title: '카바스 트리옹프 미니 토트백',
      price: '1,750,000원',
      discount: '',
      unit: '',
      tag: '',
      isExcellent: true,
      category: 'bag',
      imageUrl: '/assets/products/bags/celine_cabas_mini.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ]
};

// 3. 통합 검색 카탈로그 데이터 (12개 상품, 전원 실제 이미지 연결)
export const SEARCH_CATALOG: CatalogProduct[] = [
  {
    id: 'search-01',
    brand: '샤넬',
    title: '샤넬 클래식 플랩백 흑장 체인',
    price: '24,500원/3일',
    tag: '예약 마감',
    category: 'bag',
    imageUrl: '/assets/products/bags/chanel_classic_flap.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-02',
    brand: '샤넬',
    title: '샤넬 22 미니 퀼팅 숄더 핸드백',
    price: '45,000원/3일',
    tag: '앱전용',
    category: 'bag',
    imageUrl: '/assets/products/bags/chanel_22_mini.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-03',
    brand: '까르띠에',
    title: '탱크 머스트 워치 스몰 스틸',
    price: '35,000원/3일',
    tag: '예약 마감',
    category: 'watch',
    imageUrl: '/assets/products/watches/cartier_tank_must.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-04',
    brand: '까르띠에',
    title: 'LOVE 브레이슬릿 클래식 옐로우골드',
    price: '48,000원/3일',
    tag: '앱전용',
    category: 'jewelry',
    imageUrl: '/assets/products/jewelry/cartier_love_bracelet.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-05',
    brand: '발렌시아가',
    title: '블랙 르 시티 모토 스몰 숄더백',
    price: '18,510원/3일',
    tag: '예약 마감',
    category: 'bag',
    imageUrl: '/assets/products/bags/balenciaga_le_city.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-06',
    brand: '셀린느',
    title: '틴 트리옹프 샤이니 카프스킨',
    price: '29,000원/3일',
    tag: '예약 마감',
    category: 'bag',
    imageUrl: '/assets/products/bags/celine_triomphe.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-07',
    brand: '디올',
    title: '레이디 D-Joy 까나쥬 스몰백',
    price: '38,000원/3일',
    tag: '예약 마감',
    category: 'bag',
    imageUrl: '/assets/products/bags/dior_lady_djoy.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-08',
    brand: '프라다',
    title: '리나일론 삼각로고 남성 벨트백',
    price: '16,800원/3일',
    tag: '앱전용',
    category: 'bag',
    imageUrl: '/assets/products/bags/prada_renylon_belt.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-09',
    brand: '루이비통',
    title: '모노그램 네오노에 BB 버킷백',
    price: '22,000원/3일',
    tag: '예약 마감',
    category: 'bag',
    imageUrl: '/assets/products/bags/louisvuitton_neonoe_bb.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-10',
    brand: '고야드',
    title: '생루이 PM 토트백 블랙 탠',
    price: '21,000원/3일',
    tag: '예약 마감',
    category: 'bag',
    imageUrl: '/assets/products/bags/goyard_saint_louis_pm.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-11',
    brand: '구찌',
    title: '홀스빗 1955 미니 탑핸들백',
    price: '24,000원/3일',
    tag: '앱전용',
    category: 'bag',
    imageUrl: '/assets/products/bags/gucci_horsebit_1955.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'search-12',
    brand: '에르메스',
    title: '에블린 TPM 미니 크로스 에토프',
    price: '42,000원/3일',
    tag: '예약 마감',
    category: 'bag',
    imageUrl: '/assets/products/bags/hermes_evelyne_tpm.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
  }
];

// 4. 메인 화면 맞춤 추천 데이터 세트
export const RECOMMENDATIONS_DATA: Record<string, CatalogProduct[]> = {
  '20대 여성': [
    {
      id: 'rec-20w-01',
      brand: '생로랑',
      title: '블랙 페이던트 Le 5 A 7 호보...',
      price: '10,230원',
      originalPrice: '44,400원',
      discount: '77%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/saint_laurent_le5a7.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-20w-02',
      brand: '발렌시아가',
      title: '블랙 르 시티 모토 스몰 숄더백',
      price: '18,510원',
      originalPrice: '80,400원',
      discount: '77%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/balenciaga_le_city.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-20w-03',
      brand: '샤넬',
      title: '블랙 캐비어 호보 미니 토트백',
      price: '101,600원',
      originalPrice: '170,400원',
      discount: '41%',
      tag: '앱전용',
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_caviar_hobo.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-20w-04',
      brand: '샤넬',
      title: '블랙 클래식 플랩 흑장 체인 숄...',
      price: '24,500원',
      originalPrice: '',
      discount: '72%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_classic_flap.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    }
  ],
  '20대 남성': [
    {
      id: 'rec-20m-01',
      brand: '메종 마르지엘라',
      title: '남성 5AC 블랙 크로스백 미디엄',
      price: '14,200원',
      originalPrice: '48,000원',
      discount: '70%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/maison_margiela_5ac.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-20m-02',
      brand: '프라다',
      title: '리나일론 삼각로고 남성 벨트백',
      price: '16,800원',
      originalPrice: '56,000원',
      discount: '70%',
      tag: '앱전용',
      category: 'bag',
      imageUrl: '/assets/products/bags/prada_renylon_belt.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-20m-03',
      brand: '보테가 베네타',
      title: '카세트 인트레치아토 크로스백',
      price: '19,500원',
      originalPrice: '65,000원',
      discount: '70%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/bottega_cassette.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-20m-04',
      brand: '아미',
      title: '하트 로고 크루넥 남성 니트',
      price: '11,000원',
      originalPrice: '38,000원',
      discount: '71%',
      tag: '예약 마감',
      category: 'clothing',
      imageUrl: '/assets/products/clothing/ami_heart_knit.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    }
  ],
  '30대 여성': [
    {
      id: 'rec-30w-01',
      brand: '샤넬',
      title: '샤넬 22 미니 퀼팅 숄더 핸드백',
      price: '45,000원',
      originalPrice: '150,000원',
      discount: '70%',
      tag: '앱전용',
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_22_mini.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-30w-02',
      brand: '에르메스',
      title: '에블린 TPM 미니 크로스 에토프',
      price: '42,000원',
      originalPrice: '120,000원',
      discount: '65%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/hermes_evelyne_tpm.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-30w-03',
      brand: '셀린느',
      title: '틴 트리옹프 샤이니 카프스킨',
      price: '29,000원',
      originalPrice: '98,000원',
      discount: '70%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/celine_triomphe.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-30w-04',
      brand: '크리스찬 디올',
      title: '레이디 D-Joy 까나쥬 스몰백',
      price: '38,000원',
      originalPrice: '130,000원',
      discount: '71%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/dior_lady_djoy.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ],
  '30대 남성': [
    {
      id: 'rec-30m-01',
      brand: '톰브라운',
      title: '삼선 그로그랭 페블 레더 클러치',
      price: '13,500원',
      originalPrice: '45,000원',
      discount: '70%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/thombrowne_clutch.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-30m-02',
      brand: '구찌',
      title: 'GG 수프림 캔버스 슬링 메신저백',
      price: '15,000원',
      originalPrice: '50,000원',
      discount: '70%',
      tag: '앱전용',
      category: 'bag',
      imageUrl: '/assets/products/bags/gucci_gg_supreme.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-30m-03',
      brand: '롤렉스',
      title: '오이스터 서브마리너 블랙 데이트',
      price: '85,000원',
      originalPrice: '250,000원',
      discount: '66%',
      tag: '예약 마감',
      category: 'watch',
      imageUrl: '/assets/products/watches/rolex_submariner.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-30m-04',
      brand: '생로랑',
      title: '시티 나일론 블랙 백팩 클래식',
      price: '16,000원',
      originalPrice: '55,000원',
      discount: '71%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/saint_laurent_backpack.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    }
  ],
  '40대 여성': [
    {
      id: 'rec-40w-01',
      brand: '에르메스',
      title: '버킨 25 토고 골드 하드웨어',
      price: '115,000원',
      originalPrice: '350,000원',
      discount: '67%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/hermes_birkin_25.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-40w-02',
      brand: '루이비통',
      title: '카푸신 BB 블랙 토뤼옹 핸드백',
      price: '39,000원',
      originalPrice: '130,000원',
      discount: '70%',
      tag: '앱전용',
      category: 'bag',
      imageUrl: '/assets/products/bags/louisvuitton_capucines_bb.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-40w-03',
      brand: '샤넬',
      title: '클래식 미디엄 캐비어 금장 플랩',
      price: '58,000원',
      originalPrice: '190,000원',
      discount: '69%',
      tag: '예약 마감',
      category: 'bag',
      imageUrl: '/assets/products/bags/chanel_classic_medium.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
    },
    {
      id: 'rec-40w-04',
      brand: '반클리프 아펠',
      title: '빈티지 알함브라 펜던트 옐로골드',
      price: '28,000원',
      originalPrice: '85,000원',
      discount: '67%',
      tag: '예약 마감',
      category: 'jewelry',
      imageUrl: '/assets/products/jewelry/vancleef_alhambra.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
    }
  ]
};

// 5. Rent New Arrivals 데이터 (메인 화면)
export const RENT_NEW_ARRIVALS: CatalogProduct[] = [
  {
    id: 'arr-01',
    brand: '발렌시아가',
    title: '르 시티 미디엄 숄더백 블랙',
    price: '40,600원',
    unit: '1일',
    category: 'bag',
    imageUrl: '/assets/products/bags/balenciaga_le_city.jpg',
      imageStatus: 'READY',
      assetQuality: 'APPROVED_PHOTOREAL',
      assetSource: 'STUDIO_AI_PHOTOREAL',
      verifiedDate: '2026-11-04'
  },
  {
    id: 'arr-02',
    brand: '크리스찬 디올',
    title: '레이디 D-Joy 까나쥬 스몰백',
    price: '11,100원',
    unit: '1일',
    category: 'bag',
    imageUrl: '/assets/products/bags/dior_lady_djoy.jpg',
      imageStatus: 'READY',
      assetQuality: 'REGENERATE_REQUIRED',
      assetSource: 'VECTOR_RENDER',
      verifiedDate: '2026-11-04'
  }
];

// Helper: 전체 상품 목록 플랫화
export function getAllCatalogProducts(): CatalogProduct[] {
  const list: CatalogProduct[] = [];
  const seenIds = new Set<string>();

  const addIfUnique = (p: CatalogProduct) => {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      list.push(p);
    }
  };

  // Brand products
  Object.values(BRAND_PRODUCTS_MAP).forEach(products => {
    products.forEach(addIfUnique);
  });

  // Search catalog
  SEARCH_CATALOG.forEach(addIfUnique);

  // Recommendations
  Object.values(RECOMMENDATIONS_DATA).forEach(products => {
    products.forEach(addIfUnique);
  });

  // New arrivals
  RENT_NEW_ARRIVALS.forEach(addIfUnique);

  return list;
}

