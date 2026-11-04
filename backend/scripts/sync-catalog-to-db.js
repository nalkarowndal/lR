import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('backend/data/luxuryrental.sqlite');

const content = fs.readFileSync('frontend/src/data/catalog.ts', 'utf8');
const start = content.indexOf('export const BRAND_PRODUCTS_MAP');
const end = content.indexOf('export const SEARCH_CATALOG');
const mapCode = content.slice(start, end).replace('export const BRAND_PRODUCTS_MAP: Record<string, CatalogProduct[]> =', 'const map =') + '; return map;';
const fn = new Function(mapCode);
const map = fn();

const checkStmt = db.prepare('SELECT id FROM products WHERE brand = ? AND title = ?');
const insertStmt = db.prepare(`
  INSERT INTO products (brand, title, type, price, original_price, discount_rate, unit, tag, category, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
for (const [brand, items] of Object.entries(map)) {
  for (const item of items) {
    const existing = checkStmt.get(brand, item.title);
    if (!existing) {
      const priceNum = parseInt(String(item.price).replace(/\D/g, ''), 10) || 50000;
      const type = item.unit?.includes('일') ? 'RENT' : 'BUY';
      insertStmt.run(
        brand,
        item.title,
        type,
        priceNum,
        Math.round(priceNum * 1.3),
        item.discount || null,
        item.unit || null,
        item.tag || null,
        item.category || 'bag',
        item.imageUrl || null
      );
      inserted++;
    }
  }
}

console.log(`Inserted ${inserted} missing brand products into SQLite.`);

