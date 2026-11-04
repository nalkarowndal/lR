import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

export function createSellRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { brandName, userName, phone } = req.body;
    const userId = req.user ? req.user.id : null;
    const resolvedUserName = req.user ? req.user.name : (userName?.trim() || '고객');
    const resolvedPhone = req.user?.phone || phone?.trim() || '';

    // Guest sell request requires contact information for appraisal team follow-up
    if (!req.user && !resolvedPhone) {
      return res.status(400).json({
        success: false,
        error: '비회원 위탁 판매 신청 시 감정팀의 안내 연락을 위한 연락처(전화번호)가 필수입니다.'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO sell_requests (user_id, brand_name, user_name, phone, status)
      VALUES (?, ?, ?, ?, '접수완료')
    `);
    const info = stmt.run(userId, brandName, resolvedUserName, resolvedPhone);

    res.status(201).json({
      success: true,
      message: '위탁 판매 신청이 성공적으로 접수되었습니다. 감정팀이 안내 연락을 드립니다.',
      data: {
        id: Number(info.lastInsertRowid),
        brandName,
        userName: resolvedUserName,
        phone: resolvedPhone,
        status: '접수완료'
      }
    });
  } catch (err) {
    next(err);
  }
}

export function getSellRequests(req: Request, res: Response, next: NextFunction) {
  try {
    // P0 Security: Block unauthenticated access
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '로그인이 필요한 서비스입니다.'
      });
    }

    const db = getDatabase();

    // Admins see all sell requests with administrative details
    if (req.user.role === 'ADMIN') {
      const rows = db.prepare(`
        SELECT s.id, s.user_id, s.brand_name, s.user_name, s.phone, s.status, s.created_at,
               u.email as user_email, COALESCE(NULLIF(s.phone, ''), u.phone, '') as user_phone
        FROM sell_requests s
        LEFT JOIN users u ON u.id = s.user_id
        ORDER BY s.id DESC
      `).all();
      return res.json({ success: true, count: rows.length, data: rows });
    }

    // Normal users strictly see their own requests without leaking other users' info
    const rows = db.prepare(`
      SELECT id, brand_name, user_name, phone, status, created_at
      FROM sell_requests
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(req.user.id);

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}
