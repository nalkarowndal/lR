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
    name: 'security',
    files: [
      { src: 'docs/analysis/SECURITY_AUDIT.md', dest: 'SECURITY_AUDIT.md' },
      { src: 'docs/qa/SECURITY_QA.md', dest: 'SECURITY_QA.md' }
    ]
  },
  {
    name: 'api-db',
    files: [
      { src: 'docs/analysis/API_DB_AUDIT.md', dest: 'API_DB_AUDIT.md' },
      { src: 'docs/qa/API_DB_QA.md', dest: 'API_DB_QA.md' }
    ]
  },
  {
    name: 'assets',
    files: [
      { src: 'docs/assets/IMAGE_INVENTORY.md', dest: 'IMAGE_INVENTORY.md' },
      { src: 'docs/assets/IMAGE_RIGHTS_REGISTER.md', dest: 'IMAGE_RIGHTS_REGISTER.md' },
      { src: 'docs/assets/ASSET_INTEGRITY_REPORT.md', dest: 'ASSET_INTEGRITY_REPORT.md' },
      { src: 'docs/assets/ASSET_GENERATION_REPORT.md', dest: 'ASSET_GENERATION_REPORT.md' }
    ]
  },
  {
    name: 'ui-ux',
    files: [
      { src: 'docs/analysis/UI_UX_AUDIT.md', dest: 'UI_UX_AUDIT.md' },
      { src: 'docs/design/DESIGN_SYSTEM.md', dest: 'DESIGN_SYSTEM.md' }
    ]
  },
  {
    name: 'final-qa',
    files: [
      { src: 'docs/analysis/FULL_SYSTEM_AUDIT.md', dest: 'FULL_SYSTEM_AUDIT.md' },
      { src: 'docs/qa/FINAL_QA_REPORT.md', dest: 'FINAL_QA_REPORT.md' },
      { src: 'docs/FINAL_IMPROVEMENT_REPORT.md', dest: 'FINAL_IMPROVEMENT_REPORT.md' }
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
