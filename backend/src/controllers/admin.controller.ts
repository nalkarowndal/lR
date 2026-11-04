import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

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
