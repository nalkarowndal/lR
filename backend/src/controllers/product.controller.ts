import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

export function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { brand, category, type, limit = 50 } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (brand) {
      query += ' AND brand = ?';
      params.push(brand);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const rows = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

export function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
    if (!row) {
      return res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
}

export function getRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const target = (req.query.target as string) || '20대 여성';

    const rows = db.prepare('SELECT * FROM products WHERE target_group = ? ORDER BY id ASC').all(target);
    res.json({
      success: true,
      target,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}
