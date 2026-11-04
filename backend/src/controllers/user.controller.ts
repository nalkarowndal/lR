import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, '이름은 최소 2글자 이상이어야 합니다.').max(50).optional(),
  phone: z.string().max(20).optional(),
  avatar_url: z.string().max(500).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z.string().min(6, '새 비밀번호는 최소 6자 이상이어야 합니다.')
});

const updateSettingsSchema = z.object({
  service_notifications: z.boolean().optional(),
  marketing_notifications: z.boolean().optional(),
  product_notifications: z.boolean().optional(),
  reduce_animations: z.boolean().optional(),
  theme: z.enum(['light', 'dark']).optional()
});

/**
 * GET /api/v1/users/me
 * Retrieves current authenticated user's full profile, settings, and summary stats.
 */
export function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const db = getDatabase();
    const userRow = db.prepare(`
      SELECT id, email, name, role, phone, avatar_url, created_at
      FROM users WHERE id = ?
    `).get(req.user.id) as any;

    if (!userRow) {
      return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
    }

    // Get or create settings
    let settings = db.prepare(`
      SELECT service_notifications, marketing_notifications, product_notifications, reduce_animations, theme
      FROM user_settings WHERE user_id = ?
    `).get(req.user.id) as any;

    if (!settings) {
      db.prepare(`
        INSERT INTO user_settings (user_id, service_notifications, marketing_notifications, product_notifications, reduce_animations, theme)
        VALUES (?, 1, 0, 1, 0, 'light')
      `).run(req.user.id);
      settings = {
        service_notifications: 1,
        marketing_notifications: 0,
        product_notifications: 1,
        reduce_animations: 0,
        theme: 'light'
      };
    }

    // Count favorites
    const favCount = (db.prepare(`
      SELECT count(*) as count FROM favorites WHERE user_id = ?
    `).get(req.user.id) as any)?.count || 0;

    // Count sell requests
    const sellCount = (db.prepare(`
      SELECT count(*) as count FROM sell_requests WHERE user_id = ? OR user_name = ?
    `).get(req.user.id, userRow.name) as any)?.count || 0;

    return res.json({
      success: true,
      profile: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: userRow.role,
        phone: userRow.phone || '',
        avatar_url: userRow.avatar_url || '',
        created_at: userRow.created_at,
        settings: {
          service_notifications: Boolean(settings.service_notifications),
          marketing_notifications: Boolean(settings.marketing_notifications),
          product_notifications: Boolean(settings.product_notifications),
          reduce_animations: Boolean(settings.reduce_animations),
          theme: settings.theme || 'light'
        },
        stats: {
          favorites_count: favCount,
          sell_requests_count: sellCount,
          rentals_count: 0
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/me
 * Update personal profile. Strict prevention of role escalation.
 */
export function updateMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const validated = updateProfileSchema.parse(req.body);
    const db = getDatabase();

    const updates: string[] = [];
    const params: any[] = [];

    if (validated.name !== undefined) {
      updates.push('name = ?');
      params.push(validated.name);
    }
    if (validated.phone !== undefined) {
      updates.push('phone = ?');
      params.push(validated.phone);
    }
    if (validated.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(validated.avatar_url);
    }

    if (updates.length > 0) {
      params.push(req.user.id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare(`
      SELECT id, email, name, role, phone, avatar_url, created_at
      FROM users WHERE id = ?
    `).get(req.user.id) as any;

    return res.json({
      success: true,
      message: '프로필 정보가 성공적으로 수정되었습니다.',
      profile: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/me/password
 * Change password after verifying current password.
 */
export function changeMyPassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const validated = changePasswordSchema.parse(req.body);
    const db = getDatabase();

    const userRecord = db.prepare(`
      SELECT password_hash FROM users WHERE id = ?
    `).get(req.user.id) as { password_hash: string } | undefined;

    if (!userRecord || !verifyPassword(validated.currentPassword, userRecord.password_hash)) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호가 일치하지 않습니다.'
      });
    }

    const newHash = hashPassword(validated.newPassword);
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newHash, req.user.id);

    return res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/me/settings
 */
export function getMySettings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const db = getDatabase();
    let row = db.prepare(`
      SELECT service_notifications, marketing_notifications, product_notifications, reduce_animations, theme
      FROM user_settings WHERE user_id = ?
    `).get(req.user.id) as any;

    if (!row) {
      db.prepare(`
        INSERT INTO user_settings (user_id, service_notifications, marketing_notifications, product_notifications, reduce_animations, theme)
        VALUES (?, 1, 0, 1, 0, 'light')
      `).run(req.user.id);
      row = { service_notifications: 1, marketing_notifications: 0, product_notifications: 1, reduce_animations: 0, theme: 'light' };
    }

    return res.json({
      success: true,
      settings: {
        service_notifications: Boolean(row.service_notifications),
        marketing_notifications: Boolean(row.marketing_notifications),
        product_notifications: Boolean(row.product_notifications),
        reduce_animations: Boolean(row.reduce_animations),
        theme: row.theme || 'light'
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/me/settings
 */
export function updateMySettings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const validated = updateSettingsSchema.parse(req.body);
    const db = getDatabase();

    // Ensure settings row exists
    db.prepare(`
      INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)
    `).run(req.user.id);

    const updates: string[] = ["updated_at = datetime('now')"];
    const params: any[] = [];

    if (validated.service_notifications !== undefined) {
      updates.push('service_notifications = ?');
      params.push(validated.service_notifications ? 1 : 0);
    }
    if (validated.marketing_notifications !== undefined) {
      updates.push('marketing_notifications = ?');
      params.push(validated.marketing_notifications ? 1 : 0);
    }
    if (validated.product_notifications !== undefined) {
      updates.push('product_notifications = ?');
      params.push(validated.product_notifications ? 1 : 0);
    }
    if (validated.reduce_animations !== undefined) {
      updates.push('reduce_animations = ?');
      params.push(validated.reduce_animations ? 1 : 0);
    }
    if (validated.theme !== undefined) {
      updates.push('theme = ?');
      params.push(validated.theme);
    }

    params.push(req.user.id);
    db.prepare(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`).run(...params);

    const updated = db.prepare(`
      SELECT service_notifications, marketing_notifications, product_notifications, reduce_animations, theme
      FROM user_settings WHERE user_id = ?
    `).get(req.user.id) as any;

    return res.json({
      success: true,
      message: '환경 설정이 저장되었습니다.',
      settings: {
        service_notifications: Boolean(updated.service_notifications),
        marketing_notifications: Boolean(updated.marketing_notifications),
        product_notifications: Boolean(updated.product_notifications),
        reduce_animations: Boolean(updated.reduce_animations),
        theme: updated.theme || 'light'
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/me/favorites
 */
export function getMyFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const db = getDatabase();
    const favorites = db.prepare(`
      SELECT p.*, f.created_at as favorited_at
      FROM favorites f
      JOIN products p ON p.id = f.product_id
      WHERE f.user_id = ?
      ORDER BY f.id DESC
    `).all(req.user.id);

    return res.json({
      success: true,
      favorites
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/users/me/favorites/:productId
 */
export function addFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const productId = Number(req.params.productId);
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ success: false, error: '유효한 상품 ID가 아닙니다.' });
    }

    const db = getDatabase();
    db.prepare(`
      INSERT OR IGNORE INTO favorites (user_id, product_id)
      VALUES (?, ?)
    `).run(req.user.id, productId);

    return res.json({
      success: true,
      message: '관심 상품(좋아요)에 추가되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/users/me/favorites/:productId
 */
export function removeFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const productId = Number(req.params.productId);
    const db = getDatabase();
    db.prepare(`
      DELETE FROM favorites WHERE user_id = ? AND product_id = ?
    `).run(req.user.id, productId);

    return res.json({
      success: true,
      message: '관심 상품(좋아요)에서 삭제되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/me/sell-requests
 */
export function getMySellRequests(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const db = getDatabase();
    const rows = db.prepare(`
      SELECT id, brand_name, user_name, status, created_at
      FROM sell_requests
      WHERE user_id = ? OR user_name = ?
      ORDER BY id DESC
    `).all(req.user.id, req.user.name);

    return res.json({
      success: true,
      sellRequests: rows
    });
  } catch (err) {
    next(err);
  }
}

