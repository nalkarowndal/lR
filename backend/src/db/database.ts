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

  // 14. Non-destructive Migrations for existing database instances
  try {
    db.exec(`ALTER TABLE products ADD COLUMN image_url TEXT;`);
  } catch {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT '';`);
  } catch {}

  try {
    db.exec(`ALTER TABLE sell_requests ADD COLUMN user_id INTEGER;`);
  } catch {}
}
