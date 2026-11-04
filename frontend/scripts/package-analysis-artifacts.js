import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const artifactsDir = path.join(projectRoot, 'artifacts/analysis');

fs.mkdirSync(artifactsDir, { recursive: true });

const phases = [
  {
    name: 'phase1_asset_audit',
    files: [
      { src: 'docs/assets/IMAGE_INVENTORY.md', dest: 'IMAGE_INVENTORY.md' },
      { src: 'docs/assets/IMAGE_RIGHTS_REGISTER.md', dest: 'IMAGE_RIGHTS_REGISTER.md' }
    ]
  },
  {
    name: 'phase2_asset_generation',
    files: [
      { src: 'docs/assets/ASSET_GENERATION_REPORT.md', dest: 'ASSET_GENERATION_REPORT.md' },
      { src: 'docs/assets/ASSET_INTEGRITY_REPORT.md', dest: 'ASSET_INTEGRITY_REPORT.md' },
      { src: 'docs/analysis/PRODUCT_IMAGE_ROOT_CAUSE.md', dest: 'PRODUCT_IMAGE_ROOT_CAUSE.md' }
    ]
  },
  {
    name: 'phase3_icon_design',
    files: [
      { src: 'docs/design/DESIGN_SYSTEM.md', dest: 'DESIGN_SYSTEM.md' }
    ]
  },
  {
    name: 'phase5_visual_qa',
    files: [
      { src: 'docs/qa/UI_VISUAL_QA.md', dest: 'UI_VISUAL_QA.md' },
      { src: 'docs/qa/CATEGORY_IMAGE_QA.md', dest: 'CATEGORY_IMAGE_QA.md' },
      { src: 'docs/qa/visual_qa_results.json', dest: 'visual_qa_results.json' }
    ]
  }
];

for (const phase of phases) {
  const phaseFolder = path.join(artifactsDir, phase.name);
  fs.mkdirSync(phaseFolder, { recursive: true });

  for (const f of phase.files) {
    const srcPath = path.join(projectRoot, f.src);
    const destPath = path.join(phaseFolder, f.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // Create ZIP using PowerShell Compress-Archive
  const zipPath = path.join(artifactsDir, `${phase.name}.zip`);
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  try {
    const psCmd = `powershell -Command "Compress-Archive -Path '${phaseFolder}\\*' -DestinationPath '${zipPath}' -Force"`;
    execSync(psCmd, { stdio: 'pipe' });
    console.log(`[ZIP CREATED] ${zipPath} (${fs.statSync(zipPath).size} bytes)`);
  } catch (err) {
    console.warn(`[ZIP NOTE] Could not create zip for ${phase.name}:`, err.message);
  }
}

console.log('[ARTIFACTS] Analysis packaging complete.');
