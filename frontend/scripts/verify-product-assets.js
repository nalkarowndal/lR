import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const publicDir = path.join(frontendDir, 'public');

// We will read catalog.ts to extract all image paths
const catalogPath = path.join(frontendDir, 'src/data/catalog.ts');
const catalogContent = fs.readFileSync(catalogPath, 'utf-8');

// Match all imageUrl: '/assets/...'
const imageRegex = /imageUrl:\s*['"]([^'"]+)['"]/g;
let match;
const foundPaths = new Set();
while ((match = imageRegex.exec(catalogContent)) !== null) {
  foundPaths.add(match[1]);
}

console.log(`[VERIFY] Found ${foundPaths.size} unique image URLs in catalog.ts`);

const report = {
  timestamp: new Date().toISOString(),
  totalUniqueImages: foundPaths.size,
  passed: 0,
  failed: 0,
  details: []
};

for (const imgUrl of Array.from(foundPaths).sort()) {
  const filePath = path.join(publicDir, imgUrl);
  const exists = fs.existsSync(filePath);
  let size = 0;
  if (exists) {
    const stat = fs.statSync(filePath);
    size = stat.size;
  }

  const ok = exists && size > 1000;
  if (ok) {
    report.passed++;
  } else {
    report.failed++;
  }

  report.details.push({
    url: imgUrl,
    exists,
    size,
    status: ok ? 'PASS' : 'FAIL'
  });
}

console.log(`[VERIFY RESULT] Passed: ${report.passed} / ${report.totalUniqueImages}, Failed: ${report.failed}`);
if (report.failed > 0) {
  console.log('[VERIFY FAILED ITEMS]:');
  report.details.filter(d => d.status === 'FAIL').forEach(d => {
    console.log(` - ${d.url} (exists: ${d.exists}, size: ${d.size})`);
  });
}

// Write markdown report
const reportDir = path.resolve(frontendDir, '../docs/assets');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

let md = `# LuxuryRental Catalog Asset Integrity Report\n\n`;
md += `- **Generated At**: ${report.timestamp}\n`;
md += `- **Total Checked Assets**: ${report.totalUniqueImages}\n`;
md += `- **Pass Count**: ${report.passed}\n`;
md += `- **Fail Count**: ${report.failed}\n`;
md += `- **Overall Status**: ${report.failed === 0 ? '✅ 100% PASS' : '❌ FAILED'}\n\n`;

md += `## Asset Inspection Table\n\n`;
md += `| # | Image URL | Exists | File Size (Bytes) | Status |\n`;
md += `|---|-----------|--------|-------------------|--------|\n`;

report.details.forEach((d, idx) => {
  md += `| ${idx + 1} | \`${d.url}\` | ${d.exists ? 'Yes' : 'No'} | ${d.size.toLocaleString()} | ${d.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |\n`;
});

fs.writeFileSync(path.join(reportDir, 'ASSET_INTEGRITY_REPORT.md'), md, 'utf-8');
console.log(`[REPORT SAVED] docs/assets/ASSET_INTEGRITY_REPORT.md written successfully.`);

if (report.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
