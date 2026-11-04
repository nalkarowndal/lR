import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

export function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM categories ORDER BY id ASC').all() as Array<{
      id: number;
      name: string;
      subcategories: string;
    }>;

    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      subcategories: JSON.parse(r.subcategories)
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

export function getBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { popular } = req.query;

    let query = 'SELECT * FROM brands';
    const params: any[] = [];

    if (popular === 'true') {
      query += ' WHERE is_popular = 1';
    }
    query += ' ORDER BY name_ko ASC';

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
