import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

export function createSellRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { brandName, userName = '고객' } = req.body;

    const stmt = db.prepare(`
      INSERT INTO sell_requests (brand_name, user_name, status)
      VALUES (?, ?, '접수완료')
    `);
    const info = stmt.run(brandName, userName);

    res.status(201).json({
      success: true,
      message: '위탁 판매 신청이 성공적으로 접수되었습니다.',
      data: {
        id: Number(info.lastInsertRowid),
        brandName,
        userName,
        status: '접수완료'
      }
    });
  } catch (err) {
    next(err);
  }
}

export function getSellRequests(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM sell_requests ORDER BY id DESC').all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}
