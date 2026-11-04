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
}
