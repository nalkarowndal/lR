import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const catalogPath = path.resolve(__dirname, '../src/data/catalog.ts');

const PHOTOREAL_SET = new Set([
  'balenciaga_le_city.jpg',
  'bottega_cassette.jpg',
  'chanel_22_mini.jpg',
  'chanel_caviar_hobo.jpg',
  'chanel_classic_flap.jpg',
  'hermes_birkin_25.jpg',
  'hermes_evelyne_tpm.jpg',
  'louisvuitton_speedy.jpg',
  'maison_margiela_5ac.jpg',
  'prada_renylon_belt.jpg',
  'saint_laurent_le5a7.jpg',
  'ami_heart_knit.jpg',
  'vancleef_alhambra.jpg',
  'rolex_submariner.jpg',
  'sneaker_tile.jpg'
]);

let code = fs.readFileSync(catalogPath, 'utf-8');

// 1. Update interface
const oldInterface = `export interface CatalogProduct {
  id: string;
  brand: string;
  title: string;
  category: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
  price: string;
  originalPrice?: string;
  discount?: string;
  unit?: string;
  tag?: string;
  isExcellent?: boolean;
  imageUrl: string;
  imageStatus: 'READY' | 'PENDING' | 'ERROR';
  condition?: string;
  targetGroup?: string;
}`;

const newInterface = `export type AssetQualityStatus = 
  | 'APPROVED_PHOTOREAL'     // Verified high-resolution genuine studio photograph
  | 'REGENERATE_REQUIRED'    // Vector/geometric art requiring photoreal AI generation
  | 'PRODUCT_MISMATCH'
  | 'REVIEW_REQUIRED';

export interface CatalogProduct {
  id: string;
  brand: string;
  title: string;
  category: 'bag' | 'clothing' | 'shoes' | 'jewelry' | 'watch' | 'wallet';
  price: string;
  originalPrice?: string;
  discount?: string;
  unit?: string;
  tag?: string;
  isExcellent?: boolean;
  imageUrl: string;
  imageStatus: 'READY' | 'PENDING' | 'ERROR';
  assetQuality?: AssetQualityStatus;
  assetSource?: 'STUDIO_AI_PHOTOREAL' | 'VECTOR_RENDER' | 'CATALOG_ARCHIVE';
  verifiedDate?: string;
  condition?: string;
  targetGroup?: string;
}`;

if (code.includes(oldInterface)) {
  code = code.replace(oldInterface, newInterface);
  console.log('[CATALOG] Updated CatalogProduct interface with AssetQualityStatus');
}

// 2. Add assetQuality and assetSource to each item based on filename
code = code.replace(/imageUrl:\s*['"]([^'"]+)['"],\s*imageStatus:\s*['"]READY['"]/g, (match, url) => {
  const filename = path.basename(url);
  const isPhotoreal = PHOTOREAL_SET.has(filename);
  const quality = isPhotoreal ? 'APPROVED_PHOTOREAL' : 'REGENERATE_REQUIRED';
  const source = isPhotoreal ? 'STUDIO_AI_PHOTOREAL' : 'VECTOR_RENDER';
  return `imageUrl: '${url}',\n      imageStatus: 'READY',\n      assetQuality: '${quality}',\n      assetSource: '${source}',\n      verifiedDate: '2026-11-04'`;
});

fs.writeFileSync(catalogPath, code, 'utf-8');
console.log('[CATALOG] Successfully annotated all products with asset quality metadata.');

