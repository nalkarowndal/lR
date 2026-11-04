import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = path.resolve(process.cwd(), 'public/assets/products/bags');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const items = [
  {
    filename: 'hermes_evelyne_tpm.jpg',
    brand: 'HERMÈS',
    model: 'Evelyne TPM 16',
    color: '#8D7B68', // Étoupe taupe grey
    badgeColor: '#D4AF37',
    leatherTexture: 'grain',
    hardware: 'Palladium Silver',
    details: 'Perforated "H" Oval Medallion, Contrast Saddle Stitching, Canvas Amazonia Strap',
    type: 'crossbody'
  },
  {
    filename: 'celine_triomphe.jpg',
    brand: 'CÉLINE PARIS',
    model: 'Teen Triomphe Bag',
    color: '#1A1A1A', // Shiny Black
    badgeColor: '#E6C657',
    leatherTexture: 'smooth',
    hardware: 'Polished Gold Metallic Clasp',
    details: 'Iconic Arc de Triomphe Double C Clasp, Shiny Calfskin, Lambskin Lining',
    type: 'shoulder'
  },
  {
    filename: 'dior_lady_djoy.jpg',
    brand: 'CHRISTIAN DIOR',
    model: 'Lady D-Joy Small',
    color: '#141416', // Deep Noir
    badgeColor: '#F3E5AB',
    leatherTexture: 'cannage',
    hardware: 'Pale Gold-Finish D.I.O.R Charms',
    details: 'Horizontal Architectural Silhouette, Cannage Quilting, Detachable Chain',
    type: 'handbag'
  },
  {
    filename: 'thombrowne_clutch.jpg',
    brand: 'THOM BROWNE',
    model: 'Pebble Grain Document Clutch',
    color: '#1E1E22', // Charcoal Noir
    badgeColor: '#E03C31',
    leatherTexture: 'pebble',
    hardware: 'Gold Brass Zipper',
    details: 'Signature Red-White-Blue Grosgrain Tab, Gold Foil Number Code, Pebble Calfskin',
    type: 'clutch'
  },
  {
    filename: 'gucci_gg_supreme.jpg',
    brand: 'GUCCI',
    model: 'GG Supreme Canvas Messenger',
    color: '#6E5C4E', // Beige/Ebony Supreme
    badgeColor: '#C4302B',
    leatherTexture: 'monogram',
    hardware: 'Matte Silver & Web Strap',
    details: 'GG Monogram Coated Canvas, Green/Red/Green Webbing, Black Leather Trim',
    type: 'messenger'
  },
  {
    filename: 'saint_laurent_backpack.jpg',
    brand: 'SAINT LAURENT',
    model: 'City Backpack in Matte Nylon',
    color: '#121214', // Ultra Matte Black
    badgeColor: '#FFFFFF',
    leatherTexture: 'nylon',
    hardware: 'Oxidized Nickel Hardware',
    details: 'Embossed Silver Logo, Calfskin Leather Accents, Headphone Port, Canvas Webbing',
    type: 'backpack'
  },
  {
    filename: 'louisvuitton_capucines_bb.jpg',
    brand: 'LOUIS VUITTON',
    model: 'Capucines BB Noir',
    color: '#161618', // Noir Black
    badgeColor: '#DFB15B',
    leatherTexture: 'taurillon',
    hardware: 'Leather-Wrapped LV Clasp & Gold Hardware',
    details: 'Full-Grain Taurillon Leather, Distinctive Monogram Flower Flap, Protective Metal Feet',
    type: 'top_handle'
  },
  {
    filename: 'chanel_classic_medium.jpg',
    brand: 'CHANEL',
    model: 'Classic 11.12 Double Flap',
    color: '#0D0D0E', // Caviar Black
    badgeColor: '#DFB15B',
    leatherTexture: 'caviar_quilted',
    hardware: '18K Gold Plated Turn-Lock Clasp',
    details: 'Iconic Diamond Quilted Grained Calfskin, Interwoven Gold Chain, Burgundy Leather Interior',
    type: 'flap'
  }
];

function buildHtml(item) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1000px;
      height: 1000px;
      background: radial-gradient(circle at 50% 38%, #F7F7F8 0%, #E9EBEF 65%, #DADBDE 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      position: relative;
    }

    /* Soft Studio Spotlighting */
    .spotlight {
      position: absolute;
      top: -150px;
      width: 900px;
      height: 700px;
      background: radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
      pointer-events: none;
    }

    /* Studio Stone Podium */
    .podium-wrap {
      position: absolute;
      bottom: 120px;
      width: 720px;
      height: 180px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .podium-shadow {
      position: absolute;
      bottom: -15px;
      width: 680px;
      height: 70px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0) 75%);
      filter: blur(14px);
    }
    .podium {
      width: 660px;
      height: 90px;
      background: linear-gradient(180deg, #FFFFFF 0%, #EDEDF0 50%, #D4D6DC 100%);
      border-radius: 50% / 30px;
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.9), 0 16px 36px rgba(0,0,0,0.12);
      border: 1px solid rgba(255,255,255,0.7);
    }

    /* Main Product Silhouette Representation */
    .product-stage {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -40px;
    }

    .bag-container {
      position: relative;
      width: 440px;
      height: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 32px 36px rgba(0,0,0,0.36));
    }

    /* Brand Header Watermark */
    .brand-watermark {
      position: absolute;
      top: 60px;
      text-align: center;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: rgba(30, 30, 35, 0.75);
      font-size: 15px;
      font-weight: 800;
    }
    .model-sub {
      font-size: 11px;
      letter-spacing: 0.25em;
      color: rgba(100, 100, 110, 0.7);
      margin-top: 6px;
      font-weight: 600;
    }

    /* Spec Pill */
    .spec-pill {
      position: absolute;
      bottom: 45px;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      padding: 10px 24px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 12px;
      color: #333;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .spec-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${item.badgeColor};
      box-shadow: 0 0 8px ${item.badgeColor};
    }
  </style>
</head>
<body>
  <div class="spotlight"></div>
  
  <div class="brand-watermark">
    <div>${item.brand}</div>
    <div class="model-sub">${item.model}</div>
  </div>

  <div class="podium-wrap">
    <div class="podium-shadow"></div>
    <div class="podium"></div>
  </div>

  <div class="product-stage">
    <div class="bag-container">
      ${renderVectorArt(item)}
    </div>
  </div>

  <div class="spec-pill">
    <div class="spec-dot"></div>
    <span>${item.details}</span>
  </div>
</body>
</html>`;
}

function renderVectorArt(item) {
  if (item.type === 'flap') {
    // Chanel Classic Flap
    return `
      <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
        <!-- Leather Strap with woven gold chain -->
        <path d="M120 70 C 120 -10, 280 -10, 280 70" stroke="#DFB15B" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M120 70 C 120 -10, 280 -10, 280 70" stroke="#111" stroke-width="3" stroke-dasharray="6 6" fill="none"/>
        
        <!-- Bag Body Back Shadow -->
        <rect x="40" y="60" width="320" height="240" rx="24" fill="#0A0A0C"/>
        <!-- Diamond Quilt Pattern -->
        <pattern id="quilt" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="40" height="40" fill="none" stroke="#252528" stroke-width="1.5"/>
        </pattern>
        <rect x="42" y="62" width="316" height="236" rx="22" fill="url(#quilt)"/>
        <!-- Flap Curve -->
        <path d="M40 70 Q 200 80 360 70 L 360 180 Q 200 230 40 180 Z" fill="#141416"/>
        <path d="M42 72 Q 200 82 358 72 L 358 178 Q 200 228 42 178 Z" fill="url(#quilt)"/>
        <!-- Flap Stitch Border -->
        <path d="M44 72 Q 200 82 356 72 L 356 176 Q 200 226 44 176 Z" stroke="#333338" stroke-width="2" fill="none"/>
        <!-- Gold CC Turnlock -->
        <circle cx="200" cy="195" r="22" fill="#E6C657" stroke="#BA9830" stroke-width="2"/>
        <circle cx="193" cy="195" r="14" stroke="#87681C" stroke-width="4" fill="none"/>
        <circle cx="207" cy="195" r="14" stroke="#87681C" stroke-width="4" fill="none"/>
        <rect x="196" y="186" width="8" height="18" rx="2" fill="#BA9830"/>
      </svg>
    `;
  } else if (item.type === 'shoulder') {
    // Celine Triomphe
    return `
      <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
        <!-- Smooth Leather Strap -->
        <path d="M110 90 C 110 5, 290 5, 290 90" stroke="#1A1A1A" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M110 90 C 110 5, 290 5, 290 90" stroke="#3A3A3A" stroke-width="2" fill="none"/>
        <!-- Structured Bag Body -->
        <rect x="50" y="80" width="300" height="220" rx="20" fill="#18181A"/>
        <!-- Front Flap -->
        <path d="M50 80 H 350 V 195 Q 200 215 50 195 Z" fill="#202022" stroke="#2D2D30" stroke-width="2"/>
        <!-- Golden Triomphe Clasp -->
        <rect x="172" y="178" width="56" height="42" rx="8" fill="#F0CE62" stroke="#B8942A" stroke-width="2"/>
        <path d="M185 188 C 178 188, 178 210, 185 210 M 215 188 C 222 188, 222 210, 215 210 M 185 199 H 215" stroke="#7A5E10" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Leather Sheen Highlights -->
        <path d="M60 90 L 340 90" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
      </svg>
    `;
  } else if (item.type === 'handbag') {
    // Dior Lady D-Joy
    return `
      <svg width="420" height="320" viewBox="0 0 420 320" fill="none">
        <!-- Rolled Handles -->
        <path d="M150 90 C 150 20, 270 20, 270 90" stroke="#141416" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M150 90 C 150 20, 270 20, 270 90" stroke="#E6C657" stroke-width="2" stroke-dasharray="8 12" fill="none"/>
        <!-- Wide Horizontal Cannage Body -->
        <rect x="30" y="80" width="360" height="190" rx="16" fill="#151518" stroke="#252528" stroke-width="2"/>
        <!-- Cannage Geometric Pattern -->
        <path d="M 60 80 L 120 270 M 120 80 L 180 270 M 180 80 L 240 270 M 240 80 L 300 270 M 300 80 L 360 270" stroke="#28282C" stroke-width="2"/>
        <path d="M 360 80 L 300 270 M 300 80 L 240 270 M 240 80 L 180 270 M 180 80 L 120 270 M 120 80 L 60 270" stroke="#28282C" stroke-width="2"/>
        <!-- DIOR Hanging Charms -->
        <circle cx="280" cy="115" r="7" fill="#E6C657"/>
        <text x="278" y="145" font-family="serif" font-weight="bold" font-size="28" fill="#F0CE62">D</text>
        <text x="294" y="160" font-family="serif" font-weight="bold" font-size="20" fill="#E6C657">I</text>
        <text x="303" y="152" font-family="serif" font-weight="bold" font-size="24" fill="#E6C657">O</text>
        <text x="323" y="165" font-family="serif" font-weight="bold" font-size="22" fill="#D4AF37">R</text>
      </svg>
    `;
  } else if (item.type === 'crossbody') {
    // Hermès Evelyne TPM
    return `
      <svg width="380" height="360" viewBox="0 0 380 360" fill="none">
        <!-- Webbing Strap -->
        <path d="M90 60 C 90 -20, 290 -20, 290 60" stroke="#5C5349" stroke-width="16" stroke-linecap="round" fill="none"/>
        <!-- Horseshoe / Oval Body in Etoupe -->
        <path d="M80 60 Q 60 200 90 280 Q 190 320 290 280 Q 320 200 300 60 Z" fill="#8D7B68" stroke="#756554" stroke-width="3"/>
        <!-- White Contrast Saddle Stitching -->
        <path d="M86 66 Q 68 198 96 274 Q 190 312 284 274 Q 312 198 294 66 Z" stroke="#EFECE6" stroke-width="1.8" stroke-dasharray="5 5" fill="none"/>
        <!-- Perforated H in Oval -->
        <ellipse cx="190" cy="180" rx="55" ry="65" stroke="#756554" stroke-width="3" stroke-dasharray="4 6" fill="none"/>
        <path d="M165 140 V 220 M 215 140 V 220 M 165 180 H 215" stroke="#4F4438" stroke-width="6" stroke-dasharray="4 7" stroke-linecap="round"/>
        <!-- Leather Tab & Snap -->
        <rect x="180" y="50" width="20" height="40" rx="6" fill="#756554"/>
        <circle cx="190" cy="80" r="6" fill="#D6D6DB"/>
      </svg>
    `;
  } else if (item.type === 'clutch') {
    // Thom Browne Clutch
    return `
      <svg width="420" height="300" viewBox="0 0 420 300" fill="none">
        <!-- Pebble Leather Envelope Body -->
        <rect x="40" y="50" width="340" height="220" rx="14" fill="#202024" stroke="#333338" stroke-width="2"/>
        <!-- Top Brass Zipper -->
        <line x1="45" y1="58" x2="375" y2="58" stroke="#D4AF37" stroke-width="4" stroke-dasharray="3 3"/>
        <!-- Signature Grosgrain Tab (Red, White, Blue) -->
        <g transform="translate(192, 42)">
          <rect x="0" y="0" width="12" height="28" fill="#002366"/>
          <rect x="12" y="0" width="12" height="28" fill="#FFFFFF"/>
          <rect x="24" y="0" width="12" height="28" fill="#C8102E"/>
        </g>
        <!-- Gold Stamped Thom Browne Brand Badge -->
        <rect x="150" y="160" width="120" height="45" rx="4" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="1"/>
        <text x="210" y="180" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle" fill="#111">THOM BROWNE.</text>
        <text x="210" y="194" font-family="monospace" font-size="8" text-anchor="middle" fill="#666">NEW YORK</text>
      </svg>
    `;
  } else if (item.type === 'messenger') {
    // Gucci GG Supreme Messenger
    return `
      <svg width="380" height="340" viewBox="0 0 380 340" fill="none">
        <!-- Green & Red Web Strap -->
        <path d="M100 50 C 100 -20, 280 -20, 280 50" stroke="#004D25" stroke-width="18" fill="none"/>
        <path d="M100 50 C 100 -20, 280 -20, 280 50" stroke="#BA0C2F" stroke-width="6" fill="none"/>
        <!-- GG Canvas Body -->
        <rect x="60" y="50" width="260" height="250" rx="16" fill="#756554" stroke="#4A3F33" stroke-width="3"/>
        <!-- Black Leather Trim Base -->
        <path d="M60 250 H 320 V 284 Q 320 300 304 300 H 76 Q 60 300 60 284 Z" fill="#18181A"/>
        <!-- Front Zipper Pocket with Webbing -->
        <rect x="80" y="150" width="220" height="90" rx="8" fill="#635445" stroke="#4A3F33" stroke-width="2"/>
        <!-- Web Trim on Pocket -->
        <rect x="175" y="150" width="30" height="90" fill="#004D25"/>
        <rect x="185" y="150" width="10" height="90" fill="#BA0C2F"/>
        <!-- Oval GG Metal Logo -->
        <circle cx="190" cy="100" r="18" fill="#18181A" stroke="#B08D57" stroke-width="2"/>
        <text x="190" y="106" font-family="serif" font-weight="black" font-size="14" text-anchor="middle" fill="#E6C657">GG</text>
      </svg>
    `;
  } else if (item.type === 'backpack') {
    // Saint Laurent City Backpack
    return `
      <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
        <!-- Top Leather Loop Handle -->
        <path d="M160 50 C 160 15, 220 15, 220 50" stroke="#111" stroke-width="10" stroke-linecap="round" fill="none"/>
        <!-- Backpack Dome Shape -->
        <path d="M90 320 V 170 Q 90 50 190 50 Q 290 50 290 170 V 320 Z" fill="#151518" stroke="#252528" stroke-width="3"/>
        <!-- Front Rounded Zipper Pocket -->
        <path d="M110 320 V 220 Q 110 190 190 190 Q 270 190 270 220 V 320 Z" fill="#1D1D20" stroke="#2D2D32" stroke-width="2"/>
        <!-- Embossed Silver Saint Laurent Signature -->
        <text x="190" y="150" font-family="sans-serif" font-size="11" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#E0E0E0">SAINT LAURENT</text>
        <text x="190" y="163" font-family="sans-serif" font-size="7" font-weight="600" letter-spacing="2" text-anchor="middle" fill="#888888">PARIS</text>
        <!-- Leather Zipper Pulls -->
        <rect x="187" y="196" width="6" height="24" rx="2" fill="#333"/>
      </svg>
    `;
  } else {
    // Louis Vuitton Capucines BB
    return `
      <svg width="400" height="360" viewBox="0 0 400 360" fill="none">
        <!-- Curved Rigid Top Handle with Ring Clasps -->
        <path d="M140 80 C 140 10, 260 10, 260 80" stroke="#161618" stroke-width="14" stroke-linecap="round" fill="none"/>
        <circle cx="140" cy="80" r="10" stroke="#DFB15B" stroke-width="4" fill="none"/>
        <circle cx="260" cy="80" r="10" stroke="#DFB15B" stroke-width="4" fill="none"/>
        <!-- Trapezoidal Taurillon Body -->
        <path d="M90 90 L 60 300 H 340 L 310 90 Z" fill="#18181A" stroke="#28282C" stroke-width="3"/>
        <!-- Front Flap with Monogram Flower -->
        <path d="M150 90 L 170 145 Q 200 160 230 145 L 250 90 Z" fill="#222226" stroke="#333338" stroke-width="2"/>
        <!-- Leather-Wrapped LV Signature Clasp -->
        <circle cx="200" cy="180" r="24" fill="#161618" stroke="#DFB15B" stroke-width="3"/>
        <text x="200" y="188" font-family="serif" font-weight="black" font-size="22" text-anchor="middle" fill="#DFB15B">LV</text>
        <!-- Base Gold Studs -->
        <circle cx="80" cy="305" r="4" fill="#DFB15B"/>
        <circle cx="320" cy="305" r="4" fill="#DFB15B"/>
      </svg>
    `;
  }
}

async function run() {
  console.log('Generating missing luxury editorial assets with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });

  for (const item of items) {
    const destPath = path.join(targetDir, item.filename);
    console.log(`Rendering ${item.filename}...`);
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: destPath, type: 'jpeg', quality: 95 });
    console.log(`Saved: ${destPath}`);
  }

  await browser.close();
  console.log('All 8 missing luxury product images successfully created!');
}

run().catch(console.error);

