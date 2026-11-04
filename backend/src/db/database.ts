import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new DatabaseSync(config.databasePath);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // 1. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'RENT',
      price INTEGER NOT NULL,
      original_price INTEGER,
      discount_rate TEXT,
      unit TEXT,
      tag TEXT,
      category TEXT NOT NULL DEFAULT 'bag',
      target_group TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Categories Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      subcategories TEXT NOT NULL
    );
  `);

  // 3. Brands Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ko TEXT NOT NULL UNIQUE,
      name_en TEXT NOT NULL,
      is_popular INTEGER NOT NULL DEFAULT 0
    );
  `);

  // 4. Sell Requests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sell_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      brand_name TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT '고객',
      status TEXT NOT NULL DEFAULT '접수완료',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 5. Recruit Requests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recruit_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      date TEXT NOT NULL,
      section TEXT NOT NULL,
      time TEXT NOT NULL,
      break_time TEXT NOT NULL,
      required INTEGER NOT NULL,
      hired INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT '채용중',
      partner TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 6. Workers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      exp TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 7. Messages Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      time TEXT NOT NULL,
      is_mine INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 8. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'USER',
      marketing_consent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 9. Sessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 10. Password Reset Tokens Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 11. Product Images Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_path TEXT NOT NULL,
      thumbnail_path TEXT DEFAULT '',
      alt_text TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'ORIGINAL',
      rights_status TEXT NOT NULL DEFAULT 'DEMO_EDITORIAL',
      is_generated INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 12. User Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      service_notifications INTEGER NOT NULL DEFAULT 1,
      marketing_notifications INTEGER NOT NULL DEFAULT 0,
      product_notifications INTEGER NOT NULL DEFAULT 1,
      reduce_animations INTEGER NOT NULL DEFAULT 0,
      theme TEXT NOT NULL DEFAULT 'light',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 13. Favorites Table (찜 목록)
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id)
    );
  `);

  // 14. Legal Documents Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS legal_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_type TEXT NOT NULL,
      title TEXT NOT NULL,
      short_title TEXT NOT NULL,
      version TEXT NOT NULL,
      effective_date TEXT NOT NULL,
      is_required INTEGER NOT NULL DEFAULT 1,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(doc_type, version)
    );
  `);

  // 15. User Consents Audit Log Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doc_type TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT 'v2.1',
      agreed INTEGER NOT NULL DEFAULT 1,
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Non-destructive Migrations for existing database instances
  try {
    db.exec(`ALTER TABLE products ADD COLUMN image_url TEXT;`);
  } catch {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT '';`);
  } catch {}

  try {
    db.exec(`ALTER TABLE sell_requests ADD COLUMN user_id INTEGER;`);
  } catch {}

  // Seed default legal documents if empty
  try {
    const docCount = db.prepare('SELECT count(*) as count FROM legal_documents').get() as { count: number };
    if (docCount.count === 0) {
      const insertDoc = db.prepare(`
        INSERT OR IGNORE INTO legal_documents (doc_type, title, short_title, version, effective_date, is_required, summary, content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertDoc.run(
        'TERMS_OF_SERVICE',
        'LUXURYRENTAL 서비스 이용약관',
        '서비스 이용약관',
        'v2.1',
        '2026년 1월 1일',
        1,
        '명품 렌트, 구매 및 위탁 판매 서비스 이용과 관련한 이용자와 회사의 권리, 의무 및 책임사항을 규정합니다.',
        '제1조(목적) 본 약관은 주식회사 럭셔리렌탈이 운영하는 명품 렌탈 플랫폼 이용조건을 규정합니다. 제2조(정품보증) 위조품 판정 시 200% 보상 제도를 운영합니다. 제3조(렌트 및 반납) 대여 기간 종료일까지 지정 택배사로 접수되어야 합니다.'
      );

      insertDoc.run(
        'PRIVACY_COLLECTION',
        '개인정보 수집 및 이용 동의',
        '개인정보 수집·이용 동의',
        'v2.1',
        '2026년 1월 1일',
        1,
        '회원 식별, 고가 명품 렌탈 계약 체결, 배송 및 고객 상담을 위해 필요한 최소한의 개인정보를 수집·이용합니다.',
        '1. 수집 항목: 이메일, 비밀번호, 이름, 휴대폰번호. 2. 이용 목적: 회원 관리, 계약 이행, 배송 및 상담. 3. 보유 기간: 회원 탈퇴 시 지체없이 파기(법령에 따른 보존 예외).'
      );

      insertDoc.run(
        'PRIVACY_POLICY',
        'LUXURYRENTAL 개인정보 처리방침',
        '개인정보 처리방침',
        'v2.1',
        '2026년 1월 1일',
        0,
        '주식회사 럭셔리렌탈은 정보통신망법 및 개인정보보호법에 의거하여 이용자의 개인정보를 안전하게 관리합니다.',
        '제1조(총칙) 회사는 개인정보보호법을 준수합니다. 제2조(보호조치) SSL 보안서버 및 암호화 처리를 적용합니다. 제3조(보호책임자) privacy@luxuryrental.com'
      );

      insertDoc.run(
        'MARKETING_CONSENT',
        '마케팅 정보 수신 및 활용 동의',
        '마케팅 정보 수신 동의',
        'v2.1',
        '2026년 1월 1일',
        0,
        '신규 명품 입고, 렌탈 할인 쿠폰 및 프로모션 안내를 받아보실 수 있습니다.',
        '1. 목적: 신규 입고 안내, 할인 쿠폰 제공. 2. 매체: 이메일, SMS, 푸시. 3. 철회: 설정 및 마이페이지에서 언제든지 즉시 철회 가능.'
      );
    }
  } catch (err) {
    console.warn('[Database] Legal docs initialization note:', err);
  }
}
