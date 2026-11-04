import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

export function search(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const q = (req.query.q as string || '').trim();

    if (!q) {
      return res.json({ success: true, count: 0, query: '', data: [] });
    }

    const pattern = `%${q}%`;
    const rows = db.prepare(`
      SELECT * FROM products 
      WHERE brand LIKE ? OR title LIKE ?
      ORDER BY id DESC LIMIT 20
    `).all(pattern, pattern);

    res.json({
      success: true,
      query: q,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

export function getTrendingKeywords(_req: Request, res: Response, _next: NextFunction) {
  res.json({
    success: true,
    timestamp: '10.28 10:27 기준',
    recommended: ['Supreme', 'Matin', 'Chrome', '불가리', 'Essentials', '목걸이', '까르띠에', '시계', '르메르', 'BAPE', 'The'],
    trending: [
      { rank: 1, name: '샤넬', status: null }, 
      { rank: 2, name: '셀린느', status: null },
      { rank: 3, name: '발렌시아가', status: { type: 'new', text: 'new' } },
      { rank: 4, name: '디올', status: { type: 'up', text: '1' } },
      { rank: 5, name: '프라다', status: { type: 'down', text: '1' } },
      { rank: 6, name: '루이비통', status: { type: 'down', text: '3' } },
      { rank: 7, name: '에르메스', status: { type: 'up', text: '1' } },
      { rank: 8, name: '더로우', status: { type: 'new', text: 'new' } },
      { rank: 9, name: '고야드', status: { type: 'new', text: 'new' } },
      { rank: 10, name: '구찌', status: { type: 'new', text: 'new' } },
    ]
  });
}
