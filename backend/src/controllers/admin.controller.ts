import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';
import { hashPassword } from '../utils/crypto.js';

// 1. Admin Products
export function getAdminProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

export function createAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { title, type, price, brand = 'LUXURY', category = 'bag', tag = null } = req.body;

    const stmt = db.prepare(`
      INSERT INTO products (brand, title, type, price, category, tag)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(brand, title, type, price, category, tag);

    res.status(201).json({
      success: true,
      message: '신규 상품이 등록되었습니다.',
      data: {
        id: Number(info.lastInsertRowid),
        brand,
        title,
        type,
        price,
        category,
        tag
      }
    });
  } catch (err) {
    next(err);
  }
}

export function deleteAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const id = Number(req.params.id);

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: '상품이 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
}

// 2. Admin Recruit Requests
export function getRecruitRequests(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM recruit_requests ORDER BY id DESC').all() as any[];

    const formatted = rows.map(r => ({
      id: r.id,
      storeName: r.store_name,
      date: r.date,
      section: r.section,
      time: r.time,
      breakTime: r.break_time,
      required: r.required,
      hired: r.hired,
      status: r.status,
      partner: r.partner || ''
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
}

export function createRecruitRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { storeName, date, section, time, breakTime, required, partner = '' } = req.body;

    const stmt = db.prepare(`
      INSERT INTO recruit_requests (store_name, date, section, time, break_time, required, hired, status, partner)
      VALUES (?, ?, ?, ?, ?, ?, 0, '채용중', ?)
    `);
    const info = stmt.run(storeName, date, section, time, breakTime, required, partner);

    res.status(201).json({
      success: true,
      message: '구인 요청이 접수되었습니다.',
      data: {
        id: Number(info.lastInsertRowid),
        storeName,
        date,
        section,
        time,
        breakTime,
        required,
        hired: 0,
        status: '채용중',
        partner
      }
    });
  } catch (err) {
    next(err);
  }
}

export function updateRecruitRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const id = Number(req.params.id);
    const { status, hired } = req.body;

    if (status !== undefined && hired !== undefined) {
      db.prepare('UPDATE recruit_requests SET status = ?, hired = ? WHERE id = ?').run(String(status), Number(hired), id);
    } else if (status !== undefined) {
      db.prepare('UPDATE recruit_requests SET status = ? WHERE id = ?').run(String(status), id);
    } else if (hired !== undefined) {
      db.prepare('UPDATE recruit_requests SET hired = ? WHERE id = ?').run(Number(hired), id);
    }

    res.json({ success: true, message: '구인 상태가 변경되었습니다.' });
  } catch (err) {
    next(err);
  }
}

// 3. Admin Workers
export function getWorkers(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM workers ORDER BY id ASC').all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

export function createWorker(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { name, phone, exp } = req.body;

    const stmt = db.prepare('INSERT INTO workers (name, phone, exp) VALUES (?, ?, ?)');
    const info = stmt.run(name, phone, exp);

    res.status(201).json({
      success: true,
      message: '근무자가 등록되었습니다.',
      data: {
        id: Number(info.lastInsertRowid),
        name,
        phone,
        exp
      }
    });
  } catch (err) {
    next(err);
  }
}

// 4. Admin Messages
export function getMessages(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM messages ORDER BY id ASC').all() as any[];

    const formatted = rows.map(r => ({
      id: r.id,
      sender: r.sender,
      text: r.text,
      time: r.time,
      isMine: Boolean(r.is_mine)
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
}

export function createMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const { sender, text, isMine = true } = req.body;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const stmt = db.prepare('INSERT INTO messages (sender, text, time, is_mine) VALUES (?, ?, ?, ?)');
    const info = stmt.run(sender, text, timeStr, isMine ? 1 : 0);

    res.status(201).json({
      success: true,
      data: {
        id: Number(info.lastInsertRowid),
        sender,
        text,
        time: timeStr,
        isMine
      }
    });
  } catch (err) {
    next(err);
  }
}

// 5. Admin Sell Requests
export function getAdminSellRequests(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT s.id, s.user_id, s.brand_name, s.user_name, s.status, s.created_at,
             u.email as user_email, u.phone as user_phone
      FROM sell_requests s
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY s.id DESC
    `).all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

export function updateAdminSellRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: '상태 값이 필요합니다.' });
    }

    db.prepare('UPDATE sell_requests SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: '판매 신청 상태가 성공적으로 변경되었습니다.' });
  } catch (err) {
    next(err);
  }
}

// 6. Admin Users & Role Management
export function getAdminUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT id, email, name, phone, postcode, address, detail_address, role, created_at
      FROM users
      ORDER BY CASE WHEN role = 'ADMIN' THEN 0 ELSE 1 END, id DESC
    `).all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

export function createOrPromoteAdminUser(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const email = (req.body.email || '').trim().toLowerCase();
    const name = (req.body.name || '관리자').trim();
    const password = (req.body.password || '').trim();
    const phone = (req.body.phone || '').trim();
    const role = req.body.role === 'USER' ? 'USER' : 'ADMIN';

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: '올바른 이메일 주소를 입력해주세요.' });
    }

    const existing = db.prepare('SELECT id, email, name, role FROM users WHERE lower(email) = ?').get(email) as any;
    if (existing) {
      if (password && password.length >= 6) {
        const pwHash = hashPassword(password);
        db.prepare('UPDATE users SET role = ?, password_hash = ?, name = COALESCE(NULLIF(?, \'\'), name) WHERE id = ?')
          .run(role, pwHash, name, existing.id);
      } else {
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, existing.id);
      }
      const updated = db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(existing.id);
      return res.json({
        success: true,
        message: `기존 회원(${email})의 권한이 ${role === 'ADMIN' ? '관리자(ADMIN)' : '일반 회원(USER)'}(으)로 업데이트되었습니다.`,
        data: updated
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: '신규 관리자 계정 생성 시 비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    const pwHash = hashPassword(password);
    const info = db.prepare(`
      INSERT INTO users (email, password_hash, name, phone, role, marketing_consent)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(email, pwHash, name, phone, role);

    const newUserId = Number(info.lastInsertRowid);
    db.prepare(`
      INSERT OR IGNORE INTO user_settings (user_id, service_notifications, marketing_notifications, product_notifications, reduce_animations, theme)
      VALUES (?, 1, 0, 1, 0, 'light')
    `).run(newUserId);

    const created = db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(newUserId);
    return res.status(201).json({
      success: true,
      message: `신규 관리자 계정(${email})이 성공적으로 생성되었습니다.`,
      data: created
    });
  } catch (err) {
    next(err);
  }
}

export function updateAdminUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDatabase();
    const targetId = Number(req.params.id);
    const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'USER';

    if (!targetId) {
      return res.status(400).json({ success: false, error: '유효한 회원 ID가 필요합니다.' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetId);
    const updated = db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(targetId);

    res.json({
      success: true,
      message: `회원 권한이 ${role === 'ADMIN' ? '관리자(ADMIN)' : '일반 회원(USER)'}(으)로 변경되었습니다.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

