import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';

export function getProductImages(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const images = db.prepare(`
      SELECT * FROM product_images 
      WHERE product_id = ? 
      ORDER BY is_primary DESC, sort_order ASC, id ASC
    `).all(Number(id));

    return res.json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (err) {
    next(err);
  }
}

export function addProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { imagePath, altText, isPrimary = 0, sortOrder = 0 } = req.body;

    if (!imagePath || typeof imagePath !== 'string') {
      return res.status(400).json({ success: false, error: '유효한 이미지 경로(imagePath)가 필요합니다.' });
    }

    const db = getDatabase();
    const productId = Number(id);

    // Verify product exists
    const prod = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!prod) {
      return res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다.' });
    }

    if (isPrimary) {
      // Clear existing primary flag for this product
      db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(productId);
      // Update main product image_url
      db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(imagePath, productId);
    }

    const result = db.prepare(`
      INSERT INTO product_images (product_id, image_path, alt_text, is_primary, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(productId, imagePath, altText || '명품 렌탈 상품 이미지', isPrimary ? 1 : 0, Number(sortOrder));

    return res.status(201).json({
      success: true,
      message: '상품 이미지가 등록되었습니다.',
      data: {
        id: Number(result.lastInsertRowid),
        product_id: productId,
        image_path: imagePath,
        alt_text: altText,
        is_primary: isPrimary ? 1 : 0
      }
    });
  } catch (err) {
    next(err);
  }
}

export function updateProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, imageId } = req.params;
    const { isPrimary, altText, sortOrder } = req.body;
    const db = getDatabase();
    const productId = Number(id);
    const imgId = Number(imageId);

    const image = db.prepare('SELECT * FROM product_images WHERE id = ? AND product_id = ?').get(imgId, productId) as {
      id: number;
      product_id: number;
      image_path: string;
      is_primary: number;
    } | undefined;

    if (!image) {
      return res.status(404).json({ success: false, error: '이미지를 찾을 수 없습니다.' });
    }

    if (isPrimary === 1 || isPrimary === true) {
      db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(productId);
      db.prepare('UPDATE product_images SET is_primary = 1 WHERE id = ?').run(imgId);
      db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(image.image_path, productId);
    }

    if (altText !== undefined) {
      db.prepare('UPDATE product_images SET alt_text = ? WHERE id = ?').run(String(altText), imgId);
    }

    if (sortOrder !== undefined) {
      db.prepare('UPDATE product_images SET sort_order = ? WHERE id = ?').run(Number(sortOrder), imgId);
    }

    return res.json({
      success: true,
      message: '이미지 설정이 변경되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}

export function deleteProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, imageId } = req.params;
    const db = getDatabase();
    const productId = Number(id);
    const imgId = Number(imageId);

    const image = db.prepare('SELECT * FROM product_images WHERE id = ? AND product_id = ?').get(imgId, productId) as {
      id: number;
      product_id: number;
      image_path: string;
      is_primary: number;
    } | undefined;

    if (!image) {
      return res.status(404).json({ success: false, error: '이미지를 찾을 수 없습니다.' });
    }

    db.prepare('DELETE FROM product_images WHERE id = ?').run(imgId);

    // If deleted image was primary, pick next image or set null
    if (image.is_primary) {
      const nextImg = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY id ASC LIMIT 1').get(productId) as {
        id: number;
        image_path: string;
      } | undefined;
      if (nextImg) {
        db.prepare('UPDATE product_images SET is_primary = 1 WHERE id = ?').run(nextImg.id);
        db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(nextImg.image_path, productId);
      } else {
        db.prepare('UPDATE products SET image_url = NULL WHERE id = ?').run(productId);
      }
    }

    return res.json({
      success: true,
      message: '이미지가 삭제되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}
