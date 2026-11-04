import { getDatabase } from './database.js';
import { hashPassword } from '../utils/crypto.js';
import { config } from '../config/env.js';

export function seedDatabase() {
  const db = getDatabase();

  // 0. Seed Users (Admin & Customer) in development/test environment
  if (config.nodeEnv === 'production') {
    console.log('[Database] Production mode: skipping dev user seeding.');
  } else {
    try {
      const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
      if (userCount.count === 0) {
        console.log('[Database] Seeding default development users (admin & customer)...');
        const adminHash = hashPassword(process.env.DEV_ADMIN_PASSWORD || 'admin1234!');
        const customerHash = hashPassword(process.env.DEV_CUSTOMER_PASSWORD || 'luxury1234!');

        const adminResult = db.prepare(`
          INSERT INTO users (email, password_hash, name, phone, avatar_url, role, marketing_consent)
          VALUES (?, ?, ?, ?, ?, 'ADMIN', 1)
        `).run('admin@luxuryrental.com', adminHash, '최고관리자', '010-9999-8888', '');

        const customerResult = db.prepare(`
          INSERT INTO users (email, password_hash, name, phone, avatar_url, role, marketing_consent)
          VALUES (?, ?, ?, ?, ?, 'USER', 1)
        `).run('customer@luxuryrental.com', customerHash, '김명품', '010-1234-5678', '');

        // Seed initial user settings
        const insertSettings = db.prepare(`
          INSERT OR IGNORE INTO user_settings (user_id, service_notifications, marketing_notifications, product_notifications, reduce_animations, theme)
          VALUES (?, 1, 0, 1, 0, 'light')
        `);

        if (adminResult.lastInsertRowid) insertSettings.run(adminResult.lastInsertRowid);
        if (customerResult.lastInsertRowid) insertSettings.run(customerResult.lastInsertRowid);
      }
    } catch (err) {
      console.warn('[Database] User seed note:', err);
    }
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
    { name: '시계', subs: ['전체', '오토매틱', '쿼츠', '가죽 스트랩', '메탈 스트랩', '주얼리 워치', '탁상/벽시계'] },
    { name: '주얼리', subs: ['전체', '목걸이/펜던트', '귀걸이', '반지', '팔찌/뱅글', '브로치', '파인 주얼리'] },
    { name: '지갑', subs: ['전체', '반지갑', '장지갑', '카드지갑/명함지갑', '동전지갑', '머니클립'] },
    { name: '패션잡화', subs: ['전체', '스카프/머플러', '벨트', '선글라스/안경', '모자', '넥타이', '키링/열쇠고리', '우산/양산'] },
    { name: '키즈', subs: ['전체', '베이비 의류', '키즈 의류', '키즈 슈즈', '키즈 잡화', '유아용품'] }
  ];

  const insertCat = db.prepare('INSERT INTO categories (name, subcategories) VALUES (?, ?)');
  for (const c of categories) {
    insertCat.run(c.name, JSON.stringify(c.subs));
  }

  // 3. Seed Initial Products with high-res studio assets
  const products = [
    { brand: '생로랑', title: '르 5 아 7 숄더백 블랙', type: 'RENT', price: 29000, orig: 35000, disc: '17%', unit: '1일', tag: '신규등록', cat: 'bag', target: '20대 여성', img: '/assets/products/bags/saint_laurent_le5a7.jpg' },
    { brand: '발렌시아가', title: '르 시티 미디엄 숄더백 블랙', type: 'RENT', price: 34000, orig: 42000, disc: '19%', unit: '1일', tag: '인기상품', cat: 'bag', target: '20대 여성', img: '/assets/products/bags/balenciaga_le_city.jpg' },
    { brand: '샤넬', title: '캐비어 호보백 화이트', type: 'RENT', price: 49000, orig: 58000, disc: '15%', unit: '1일', tag: '프리미엄', cat: 'bag', target: '20대 여성', img: '/assets/products/bags/chanel_caviar_hobo.jpg' },
    { brand: '샤넬', title: '클래식 플랩백 블랙 은장', type: 'RENT', price: 55000, orig: 65000, disc: '15%', unit: '1일', tag: '마감임박', cat: 'bag', target: '30대 여성', img: '/assets/products/bags/chanel_classic_flap.jpg' },
    { brand: '에르메스', title: '버킨 25 골드 토고 레더', type: 'RENT', price: 89000, orig: 110000, disc: '19%', unit: '1일', tag: '최고급', cat: 'bag', target: '40대 여성', img: '/assets/products/bags/hermes_birkin_25.jpg' },
    { brand: '루이비통', title: '스피디 반둘리에 25 모노그램', type: 'RENT', price: 25000, orig: 32000, disc: '21%', unit: '1일', tag: '추천', cat: 'bag', target: '20대 여성', img: '/assets/products/bags/louisvuitton_speedy.jpg' },
    { brand: '아미', title: '하트 로고 울 니트 가디건', type: 'BUY', price: 420000, orig: 520000, disc: '19%', unit: '', tag: '구매전용', cat: 'clothing', target: '20대 남성', img: '/assets/products/clothing/ami_heart_knit.jpg' },
    { brand: '롤렉스', title: '서브마리너 데이트 블랙 41mm', type: 'RENT', price: 79000, orig: 95000, disc: '16%', unit: '1일', tag: '명품시계', cat: 'watch', target: '30대 남성', img: '/assets/products/watches/rolex_submariner.jpg' },
    { brand: '반클리프 앤 아펠', title: '빈티지 알함브라 펜던트 옐로우 골드', type: 'BUY', price: 3850000, orig: 4200000, disc: '8%', unit: '', tag: '한정수량', cat: 'jewelry', target: '30대 여성', img: '/assets/products/jewelry/vancleef_alhambra.jpg' }
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (brand, title, type, price, original_price, discount_rate, unit, tag, category, target_group, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImage = db.prepare(`
    INSERT INTO product_images (product_id, image_path, thumbnail_path, alt_text, source_type, rights_status, is_generated, sort_order, is_primary)
    VALUES (?, ?, ?, ?, 'STUDIO_RENDER', 'DEMO_COMMERCIAL_USE', 1, 0, 1)
  `);

  for (const p of products) {
    const res = insertProd.run(p.brand, p.title, p.type, p.price, p.orig, p.disc, p.unit, p.tag, p.cat, p.target, p.img);
    if (res.lastInsertRowid) {
      insertImage.run(res.lastInsertRowid, p.img, p.img, `${p.brand} ${p.title} 스튜디오 룩북`);
    }
  }

  // 4. Seed Recruit Requests
  const recruits = [
    { store: '강남본점', date: '2026-11-05', sec: '명품의류/잡화', time: '10:00 - 19:00', brk: '60분', req: 3, hir: 2, st: '채용중', pt: '럭셔리파트너스' },
    { store: '청담쇼룸', date: '2026-11-06', sec: '하이엔드시계/주얼리', time: '11:00 - 20:00', brk: '60분', req: 2, hir: 2, st: '마감', pt: '청담에이전시' },
    { store: '한남부티크', date: '2026-11-07', sec: '가방/피혁검수', time: '09:30 - 18:30', brk: '60분', req: 4, hir: 1, st: '채용중', pt: '피혁케어넷' }
  ];

  const insertRecruit = db.prepare(`
    INSERT INTO recruit_requests (store_name, date, section, time, break_time, required, hired, status, partner)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of recruits) {
    insertRecruit.run(r.store, r.date, r.sec, r.time, r.brk, r.req, r.hir, r.st, r.pt);
  }

  // 5. Seed Workers
  const workers = [
    { name: '이수민', phone: '010-8765-4321', exp: '백화점 명품관 3년 근무' },
    { name: '박준호', phone: '010-2345-6789', exp: '시계 감정 및 CS 2년 근무' },
    { name: '정다은', phone: '010-3456-7890', exp: '가죽 피혁 복원 전문 과정 수료' }
  ];

  const insertWorker = db.prepare('INSERT INTO workers (name, phone, exp) VALUES (?, ?, ?)');
  for (const w of workers) {
    insertWorker.run(w.name, w.phone, w.exp);
  }

  // 6. Seed Messages
  const messages = [
    { sender: '시스템', text: '11월 명품 특별 기획전 파트너 채용이 시작되었습니다.', time: '오전 09:00', mine: 0 },
    { sender: '강남본점 매니저', text: '주말 렌탈 반납 검수 인원 1명 추가 배치 요청드립니다.', time: '오전 10:15', mine: 0 }
  ];

  const insertMsg = db.prepare('INSERT INTO messages (sender, text, time, is_mine) VALUES (?, ?, ?, ?)');
  for (const m of messages) {
    insertMsg.run(m.sender, m.text, m.time, m.mine);
  }

  console.log('[Database] Seed completed successfully.');
}
