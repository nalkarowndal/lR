import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDatabase } from '../db/database.js';

function getUploadDir(subfolder: string): string {
  const possibleRoots = [
    path.resolve(process.cwd(), '..', 'frontend', 'public', 'assets', 'uploads', subfolder),
    path.resolve(process.cwd(), 'public', 'assets', 'uploads', subfolder),
    path.resolve(process.cwd(), 'frontend', 'public', 'assets', 'uploads', subfolder)
  ];

  const targetDir = possibleRoots[0];
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

function detectImageType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { ext: 'png', mime: 'image/png' };
  }
  // WebP: RIFF ... WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

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
    const { imagePath, fileData, altText, isPrimary = 0, sortOrder = 0 } = req.body;
    const db = getDatabase();
    const productId = Number(id);

    // Verify product exists
    const prod = db.prepare('SELECT id, title, brand FROM products WHERE id = ?').get(productId) as any;
    if (!prod) {
      return res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다.' });
    }

    let finalImagePath = '';

    // Handle real file upload (base64 string or data URL)
    if (fileData && typeof fileData === 'string') {
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Max size: 5MB
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: '이미지 파일 크기는 최대 5MB까지 업로드 가능합니다.' });
      }

      // Validate Magic Bytes
      const imgInfo = detectImageType(buffer);
      if (!imgInfo) {
        return res.status(400).json({ 
          success: false, 
          error: '유효하지 않은 이미지 파일입니다. JPEG, PNG, WebP 형식만 지원합니다.' 
        });
      }

      const uploadDir = getUploadDir('products');
      const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const filename = `prod_${productId}_${uniqueSuffix}.${imgInfo.ext}`;
      const fullFilePath = path.join(uploadDir, filename);

      fs.writeFileSync(fullFilePath, buffer);
      finalImagePath = `/assets/uploads/products/${filename}`;
    } else if (imagePath && typeof imagePath === 'string') {
      finalImagePath = imagePath.trim();
    } else {
      return res.status(400).json({ 
        success: false, 
        error: '업로드할 이미지 파일 데이터(fileData) 또는 유효한 이미지 경로(imagePath)가 필요합니다.' 
      });
    }

    const resolvedAlt = altText || `${prod.brand} ${prod.title} 갤러리 이미지`;
    const resolvedIsPrimary = Boolean(isPrimary);

    if (resolvedIsPrimary) {
      db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(productId);
      db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(finalImagePath, productId);
    }

    const result = db.prepare(`
      INSERT INTO product_images (product_id, image_path, thumbnail_path, alt_text, is_primary, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(productId, finalImagePath, finalImagePath, resolvedAlt, resolvedIsPrimary ? 1 : 0, Number(sortOrder));

    return res.status(201).json({
      success: true,
      message: '상품 이미지가 등록되었습니다.',
      data: {
        id: Number(result.lastInsertRowid),
        product_id: productId,
        image_path: finalImagePath,
        alt_text: resolvedAlt,
        is_primary: resolvedIsPrimary ? 1 : 0
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

    // If deleted image was primary, promote next available image
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
