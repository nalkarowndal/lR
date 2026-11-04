import { getDatabase } from './database.js';
import { hashPassword } from '../utils/crypto.js';

export function seedDatabase() {
  const db = getDatabase();

  // 0. Seed Users (Admin & Customer) if not existing
  try {
    const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
      console.log('[Database] Seeding default users (admin & customer)...');
      const adminHash = hashPassword('admin1234!');
      const customerHash = hashPassword('luxury1234!');

      db.prepare(`
        INSERT INTO users (email, password_hash, name, phone, role, marketing_consent)
        VALUES (?, ?, ?, ?, 'ADMIN', 1)
      `).run('admin@luxuryrental.com', adminHash, '최고관리자', '010-9999-8888');

      db.prepare(`
        INSERT INTO users (email, password_hash, name, phone, role, marketing_consent)
        VALUES (?, ?, ?, ?, 'USER', 1)
      `).run('customer@luxuryrental.com', customerHash, '김명품', '010-1234-5678');
    }
  } catch (err) {
    console.warn('[Database] User seed note:', err);
  }

  // Check if general catalog already seeded
  const countRow = db.prepare('SELECT count(*) as count FROM brands').get() as { count: number };
  if (countRow.count > 0) {
    return; // Already seeded
  }

  console.log('[Database] Seeding initial luxury rental data...');

  // 1. Seed Brands (12 brands from ShopSell + popular brands)
  const brands = [
    { ko: '고야드', en: 'Goyard', popular: 0 },
    { ko: '구찌', en: 'Gucci', popular: 1 },
    { ko: '그라프', en: 'Graff', popular: 0 },
    { ko: '까르띠에', en: 'Cartier', popular: 0 },
    { ko: '끌로에', en: 'Chloe', popular: 0 },
    { ko: '다미아니', en: 'Damiani', popular: 0 },
    { ko: '더 로우', en: 'The Row', popular: 0 },
    { ko: '델보', en: 'Delvaux', popular: 0 },
    { ko: '드래곤 디퓨전', en: 'Dragon Diffusion', popular: 0 },
    { ko: '디젤', en: 'Diesel', popular: 0 },
    { ko: '로로피아나', en: 'Loro Piana', popular: 0 },
    { ko: '로에베', en: 'Loewe', popular: 0 },
    { ko: '루이비통', en: 'Louis Vuitton', popular: 1 },
    { ko: '스톤 아일랜드', en: 'Stone Island', popular: 1 },
    { ko: '샤넬', en: 'Chanel', popular: 1 },
    { ko: 'CP 컴퍼니', en: 'C.P. Company', popular: 1 },
    { ko: '셀린느', en: 'Celine', popular: 1 },
    { ko: '생로랑', en: 'Saint Laurent', popular: 0 },
    { ko: '발렌시아가', en: 'Balenciaga', popular: 0 },
    { ko: '크리스찬 디올', en: 'Christian Dior', popular: 0 },
  ];

  const insertBrand = db.prepare('INSERT INTO brands (name_ko, name_en, is_popular) VALUES (?, ?, ?)');
  for (const b of brands) {
    insertBrand.run(b.ko, b.en, b.popular);
  }

  // 2. Seed Categories
  const categories = [
    { name: '가방/핸드백', subs: ['전체', '토트백', '숄더백/호보백', '크로스/메신저백', '버킷백', '클러치/파우치', '백팩', '벨트백/힙색', '서류가방', '여행가방'] },
    { name: '의류', subs: ['전체', '자켓/블레이저', '코트/트렌치', '원피스/드레스', '니트/가디건', '탑/셔츠', '팬츠', '스커트', '패딩/다운'] },
    { name: '슈즈', subs: ['전체', '스니커즈/운동화', '펌프스/힐', '플랫/로퍼', '부츠/워커', '뮬/샌들', '슬리퍼/슬라이드'] },
    { name: '지갑', subs: ['전체', '장지갑', '중지갑/반지갑', '카드지갑', '동전/키지갑', '머니클립'] },
    { name: '패션잡화', subs: ['전체', '머플러/스카프', '벨트', '모자', '선글라스/안경', '장갑', '키링/스트랩'] },
    { name: '시계/액세서리', subs: ['전체', '명품시계', '목걸이/펜던트', '귀걸이', '팔찌/뱅글', '반지', '헤어액세서리'] },
    { name: '골프', subs: ['전체', '골프웨어', '골프백/파우치', '골프화', '골프모자/장갑', '골프 액세서리'] },
    { name: '화장품/향수', subs: ['전체', '럭셔리 향수', '스킨케어', '메이크업', '바디/헤어케어', '캔들/디퓨저'] }
  ];

  const insertCat = db.prepare('INSERT INTO categories (name, subcategories) VALUES (?, ?)');
  for (const c of categories) {
    insertCat.run(c.name, JSON.stringify(c.subs));
  }

  // 3. Seed Products (Recommendations & Brand products)
  const products = [
    // 20대 여성 맞춤추천
    { brand: '생로랑', title: '블랙 페이던트 Le 5 A 7 호보...', type: 'RENT', price: 10230, original: 44400, discount: '77%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '20대 여성', image: '/assets/products/bags/saint_laurent_le5a7.jpg' },
    { brand: '발렌시아가', title: '블랙 르 시티 모토 스몰 숄더백', type: 'RENT', price: 18510, original: 80400, discount: '77%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '20대 여성', image: '/assets/products/bags/balenciaga_le_city.jpg' },
    { brand: '샤넬', title: '블랙 캐비어 호보 미니 토트백', type: 'RENT', price: 101600, original: 170400, discount: '41%', unit: '/3일', tag: '앱전용', cat: 'bag', target: '20대 여성', image: '/assets/products/bags/chanel_caviar_hobo.jpg' },
    { brand: '샤넬', title: '블랙 클래식 플랩 흑장 체인 숄...', type: 'RENT', price: 24500, original: null, discount: '72%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '20대 여성', image: '/assets/products/bags/chanel_classic_flap.jpg' },
    
    // 20대 남성 맞춤추천
    { brand: '메종 마르지엘라', title: '남성 5AC 블랙 크로스백 미디엄', type: 'RENT', price: 14200, original: 48000, discount: '70%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '20대 남성', image: '/assets/products/bags/maison_margiela_5ac.jpg' },
    { brand: '프라다', title: '리나일론 삼각로고 남성 벨트백', type: 'RENT', price: 16800, original: 56000, discount: '70%', unit: '/3일', tag: '앱전용', cat: 'bag', target: '20대 남성', image: '/assets/products/bags/prada_renylon_belt.jpg' },
    { brand: '보테가 베네타', title: '카세트 인트레치아토 크로스백', type: 'RENT', price: 19500, original: 65000, discount: '70%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '20대 남성', image: '/assets/products/bags/bottega_cassette.jpg' },
    { brand: '아미', title: '하트 로고 크루넥 남성 니트', type: 'RENT', price: 11000, original: 38000, discount: '71%', unit: '/3일', tag: '예약 마감', cat: 'clothing', target: '20대 남성', image: '/assets/products/clothing/ami_heart_knit.jpg' },
    
    // 30대 여성 맞춤추천
    { brand: '샤넬', title: '샤넬 22 미니 퀼팅 숄더 핸드백', type: 'RENT', price: 45000, original: 150000, discount: '70%', unit: '/3일', tag: '앱전용', cat: 'bag', target: '30대 여성', image: '/assets/products/bags/chanel_22_mini.jpg' },
    { brand: '에르메스', title: '에블린 TPM 미니 크로스 에토프', type: 'RENT', price: 42000, original: 120000, discount: '65%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '30대 여성', image: '/assets/products/bags/hermes_evelyne_tpm.jpg' },
    { brand: '셀린느', title: '틴 트리옹프 샤이니 카프스킨', type: 'RENT', price: 29000, original: 98000, discount: '70%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '30대 여성', image: '/assets/products/bags/celine_triomphe.jpg' },
    { brand: '크리스찬 디올', title: '레이디 D-Joy 까나쥬 스몰백', type: 'RENT', price: 38000, original: 130000, discount: '71%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '30대 여성', image: '/assets/products/bags/dior_lady_djoy.jpg' },
    
    // 30대 남성 맞춤추천
    { brand: '톰브라운', title: '삼선 그로그랭 페블 레더 클러치', type: 'RENT', price: 13500, original: 45000, discount: '70%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '30대 남성', image: '/assets/products/bags/thombrowne_clutch.jpg' },
    { brand: '구찌', title: 'GG 수프림 캔버스 슬링 메신저백', type: 'RENT', price: 15000, original: 50000, discount: '70%', unit: '/3일', tag: '앱전용', cat: 'bag', target: '30대 남성', image: '/assets/products/bags/gucci_gg_supreme.jpg' },
    { brand: '롤렉스', title: '오이스터 서브마리너 블랙 데이트', type: 'RENT', price: 85000, original: 250000, discount: '66%', unit: '/3일', tag: '예약 마감', cat: 'watch', target: '30대 남성', image: '/assets/products/watches/rolex_submariner.jpg' },
    { brand: '생로랑', title: '시티 나일론 블랙 백팩 클래식', type: 'RENT', price: 16000, original: 55000, discount: '71%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '30대 남성', image: '/assets/products/bags/saint_laurent_backpack.jpg' },
    
    // 40대 여성 맞춤추천
    { brand: '에르메스', title: '버킨 25 토고 골드 하드웨어', type: 'RENT', price: 115000, original: 350000, discount: '67%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '40대 여성', image: '/assets/products/bags/hermes_birkin_25.jpg' },
    { brand: '루이비통', title: '카푸신 BB 블랙 토뤼옹 핸드백', type: 'RENT', price: 39000, original: 130000, discount: '70%', unit: '/3일', tag: '앱전용', cat: 'bag', target: '40대 여성', image: '/assets/products/bags/louisvuitton_capucines_bb.jpg' },
    { brand: '샤넬', title: '클래식 미디엄 캐비어 금장 플랩', type: 'RENT', price: 58000, original: 190000, discount: '69%', unit: '/3일', tag: '예약 마감', cat: 'bag', target: '40대 여성', image: '/assets/products/bags/chanel_classic_medium.jpg' },
    { brand: '반클리프 아펠', title: '빈티지 알함브라 펜던트 옐로골드', type: 'RENT', price: 28000, original: 85000, discount: '67%', unit: '/3일', tag: '예약 마감', cat: 'jewelry', target: '40대 여성', image: '/assets/products/jewelry/vancleef_alhambra.jpg' },

    // 루이비통 브랜드 상품
    { brand: '루이비통', title: '핑크 LV 에센셜 머플러', type: 'RENT', price: 15800, original: null, discount: null, unit: '/1일', tag: 'N', cat: 'clothing', target: null, image: '/assets/products/clothing/louisvuitton_scarf.jpg' },
    { brand: '루이비통', title: '루이비통 M41526 모노그램 ...', type: 'BUY', price: 902100, original: 970000, discount: '7%', unit: '', tag: 'EXCELLENT', cat: 'bag', target: null, image: '/assets/products/bags/louisvuitton_speedy.jpg' },
    { brand: '루이비통', title: '블랙 앙프렝뜨 이지 파우치 온 ...', type: 'RENT', price: 17800, original: null, discount: null, unit: '/1일', tag: null, cat: 'bag', target: null, image: '/assets/products/bags/louisvuitton_pouch.jpg' },
    { brand: '루이비통', title: '루이비통 블랙 에삐 레더 미라...', type: 'BUY', price: 1220000, original: null, discount: null, unit: '', tag: 'EXCELLENT', cat: 'bag', target: null, image: '/assets/products/bags/louisvuitton_epi.jpg' },
    { brand: '루이비통', title: '루이비통 모노그램 NN14 이...', type: 'BUY', price: 1480000, original: null, discount: null, unit: '', tag: 'EXCELLENT', cat: 'bag', target: null, image: '/assets/products/bags/louisvuitton_nn14.jpg' },
    { brand: '루이비통', title: '모노그램 네오노에 BB 버킷백', type: 'BUY', price: 1890000, original: 1990000, discount: '5%', unit: '', tag: 'EXCELLENT', cat: 'bag', target: null, image: '/assets/products/bags/louisvuitton_neonoe_bb.jpg' }
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (brand, title, type, price, original_price, discount_rate, unit, tag, category, target_group, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of products) {
    insertProd.run(p.brand, p.title, p.type, p.price, p.original, p.discount, p.unit, p.tag, p.cat, p.target, p.image);
  }

  // 4. Seed Recruit Requests
  const recruitRequests = [
    { storeName: '강남본점', date: '2026-10-31', section: '홀 서빙', time: '10:00 - 15:00', breakTime: '30분', required: 2, hired: 1, status: '채용중', partner: '' },
    { storeName: '홍대점', date: '2026-11-01', section: '카운터', time: '12:00 - 20:00', breakTime: '60분', required: 1, hired: 0, status: '채용중', partner: '김지인' }
  ];

  const insertRecruit = db.prepare(`
    INSERT INTO recruit_requests (store_name, date, section, time, break_time, required, hired, status, partner)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of recruitRequests) {
    insertRecruit.run(r.storeName, r.date, r.section, r.time, r.breakTime, r.required, r.hired, r.status, r.partner);
  }

  // 5. Seed Workers
  const workers = [
    { name: '김철수', phone: '010-1234-5678', exp: '홀 서빙 1년' },
    { name: '이영희', phone: '010-8765-4321', exp: '카운터 2년' }
  ];

  const insertWorker = db.prepare('INSERT INTO workers (name, phone, exp) VALUES (?, ?, ?)');
  for (const w of workers) {
    insertWorker.run(w.name, w.phone, w.exp);
  }

  // 6. Seed Messages
  const messages = [
    { sender: '강남본점', text: '오늘 저녁 타임 구인 급합니다!', time: '10:30 AM', isMine: 0 }
  ];

  const insertMsg = db.prepare('INSERT INTO messages (sender, text, time, is_mine) VALUES (?, ?, ?, ?)');
  for (const m of messages) {
    insertMsg.run(m.sender, m.text, m.time, m.isMine);
  }

  console.log('[Database] Seed completed successfully!');
}
