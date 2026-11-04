import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

export function getLegalDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const docs = db.prepare(`
      SELECT id, doc_type, title, short_title, version, effective_date, is_required, summary, created_at
      FROM legal_documents
      ORDER BY is_required DESC, id ASC
    `).all();

    return res.json({
      success: true,
      data: docs
    });
  } catch (err) {
    next(err);
  }
}

export function getLegalDocumentByType(req: Request, res: Response, next: NextFunction) {
  try {
    const { docType } = req.params;
    const db = getDatabase();
    const doc = db.prepare(`
      SELECT id, doc_type, title, short_title, version, effective_date, is_required, summary, content, created_at
      FROM legal_documents
      WHERE doc_type = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(String(docType));

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `요청하신 약관 문서(${docType})를 찾을 수 없습니다.`
      });
    }

    return res.json({
      success: true,
      data: doc
    });
  } catch (err) {
    next(err);
  }
}

export function getUserConsents(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
    }

    const db = getDatabase();
    const consents = db.prepare(`
      SELECT id, doc_type, version, agreed, ip_address, created_at
      FROM user_consents
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(user.id);

    return res.json({
      success: true,
      data: consents
    });
  } catch (err) {
    next(err);
  }
}

export function updateUserConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
    }

    const { docType, agreed } = req.body;
    if (!docType || typeof agreed !== 'boolean') {
      return res.status(400).json({ success: false, error: 'docType과 agreed(boolean) 필드가 필요합니다.' });
    }

    const db = getDatabase();
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket?.remoteAddress || '';
    const userAgent = (req.headers['user-agent'] as string) || '';

    // Record audit row
    db.prepare(`
      INSERT INTO user_consents (user_id, doc_type, version, agreed, ip_address, user_agent)
      VALUES (?, ?, 'v2.1', ?, ?, ?)
    `).run(user.id, docType, agreed ? 1 : 0, ip, userAgent);

    // If marketing consent, also sync user table and user_settings
    if (docType === 'MARKETING_CONSENT') {
      db.prepare(`UPDATE users SET marketing_consent = ? WHERE id = ?`).run(agreed ? 1 : 0, user.id);
      db.prepare(`UPDATE user_settings SET marketing_notifications = ? WHERE user_id = ?`).run(agreed ? 1 : 0, user.id);
    }

    return res.json({
      success: true,
      message: `${docType} 동의 상태가 성공적으로 변경되었습니다.`,
      consent: {
        docType,
        agreed,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}
