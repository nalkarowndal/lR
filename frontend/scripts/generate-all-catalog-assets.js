import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const publicDir = path.resolve(process.cwd(), 'public/assets');

const dirsToEnsure = [
  path.join(publicDir, 'categories'),
  path.join(publicDir, 'products/bags'),
  path.join(publicDir, 'products/clothing'),
  path.join(publicDir, 'products/shoes'),
  path.join(publicDir, 'products/wallets'),
  path.join(publicDir, 'products/watches'),
  path.join(publicDir, 'products/jewelry')
];

for (const dir of dirsToEnsure) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Master asset list to generate
const assetsToGenerate = [
  // 1. Category Top 3 Tiles
  {
    dest: 'categories/sneaker_tile.jpg',
    brand: 'DESIGNER SNEAKERS',
    model: 'Luxury High-Fashion Collection',
    pill: '프리미엄 디자이너 스니커즈 컬렉션',
    type: 'sneaker_tile',
    accent: '#111111'
  },
  {
    dest: 'categories/jewelry_tile.jpg',
    brand: 'HIGH JEWELRY',
    model: 'Fine Gold & Diamond Curation',
    pill: '하이엔드 파인 주얼리 & 골드 링',
    type: 'jewelry_tile',
    accent: '#D4AF37'
  },
  {
    dest: 'categories/apparel_tile.jpg',
    brand: 'SPRING ATELIER',
    model: 'Tailored Coat & Blazer Edit',
    pill: '시즌 신상 테일러드 코트 & 자켓',
    type: 'apparel_tile',
    accent: '#4A3E3D'
  },

  // 2. Louis Vuitton Products
  {
    dest: 'products/clothing/louisvuitton_scarf.jpg',
    brand: 'LOUIS VUITTON',
    model: 'LV Essential Scarf Rose',
    pill: 'Iconic Monogram jacquard in soft wool & silk',
    type: 'lv_scarf',
    accent: '#E8A598'
  },
  {
    dest: 'products/bags/louisvuitton_pouch_black.jpg',
    brand: 'LOUIS VUITTON',
    model: 'Easy Pouch On Strap Empreinte',
    pill: 'Embossed Monogram Empreinte black leather & chain',
    type: 'lv_pouch',
    accent: '#D4AF37'
  },
  {
    dest: 'products/bags/louisvuitton_epi_mirabeau.jpg',
    brand: 'LOUIS VUITTON',
    model: 'Mirabeau PM Epi Leather Noir',
    pill: 'Structured deep-ridged Epi calfskin & silver lock',
    type: 'lv_epi',
    accent: '#C0C0C0'
  },
  {
    dest: 'products/bags/louisvuitton_nn14_canvas.jpg',
    brand: 'LOUIS VUITTON',
    model: 'NN14 Idole Monogram Bucket',
    pill: 'Limited edition monogram canvas & hand-pleated leather tassels',
    type: 'lv_nn14',
    accent: '#8C6239'
  },
  {
    dest: 'products/bags/louisvuitton_neonoe_bb.jpg',
    brand: 'LOUIS VUITTON',
    model: 'NéoNoé BB Monogram Noir',
    pill: 'Classic monogram canvas with black leather drawstring & top handle',
    type: 'lv_neonoe',
    accent: '#18181A'
  },

  // 3. Stone Island Products
  {
    dest: 'products/clothing/stoneisland_softshell_jacket.jpg',
    brand: 'STONE ISLAND',
    model: 'Soft Shell-R Hooded Jacket Black',
    pill: 'Waterproof 2-ply stretch performance fabric with Compass sleeve badge',
    type: 'si_softshell',
    accent: '#FEE500'
  },
  {
    dest: 'products/clothing/stoneisland_sweatshirt_black.jpg',
    brand: 'STONE ISLAND',
    model: 'Garment Dyed Crewneck Sweatshirt',
    pill: 'Brushed cotton fleece with signature detachable compass badge',
    type: 'si_sweatshirt',
    accent: '#03C75A'
  },
  {
    dest: 'products/clothing/stoneisland_ghost_hoodie.jpg',
    brand: 'STONE ISLAND',
    model: 'Ghost Piece Monochrome Smock',
    pill: 'Total tonal camouflage concept with all-black fabric badge',
    type: 'si_ghost',
    accent: '#222222'
  },
  {
    dest: 'products/clothing/stoneisland_compass_cap.jpg',
    brand: 'STONE ISLAND',
    model: 'Compass Logo Cotton Twill Cap',
    pill: 'Six-panel premium cotton with raised embroidered compass crest',
    type: 'si_cap',
    accent: '#FEE500'
  },
  {
    dest: 'products/clothing/stoneisland_cargo_pants.jpg',
    brand: 'STONE ISLAND',
    model: 'Slim Fit Stretch Cargo Trousers',
    pill: 'Garment-dyed stretch cotton with side bellow pocket & badge',
    type: 'si_cargo',
    accent: '#3C4048'
  },
  {
    dest: 'products/clothing/stoneisland_down_jacket.jpg',
    brand: 'STONE ISLAND',
    model: 'Crinkle Reps NY Down Puffer',
    pill: 'Ultra-light 100% recycled nylon resin-coated wind resistant jacket',
    type: 'si_puffer',
    accent: '#191919'
  },

  // 4. Gucci Products
  {
    dest: 'products/bags/gucci_marmont_black.jpg',
    brand: 'GUCCI',
    model: 'GG Marmont Small Shoulder Bag',
    pill: 'Black chevron matelassé leather with antique gold-toned GG',
    type: 'gucci_marmont',
    accent: '#DFB15B'
  },
  {
    dest: 'products/bags/gucci_horsebit_1955.jpg',
    brand: 'GUCCI',
    model: 'Horsebit 1955 Mini Top Handle',
    pill: 'GG Supreme canvas & brown leather trim with iconic horsebit hardware',
    type: 'gucci_horsebit',
    accent: '#D4AF37'
  },
  {
    dest: 'products/bags/gucci_jackie_1961.jpg',
    brand: 'GUCCI',
    model: 'Jackie 1961 Small Hobo Étoupe',
    pill: 'Curved silhouette in fine calfskin with signature golden piston closure',
    type: 'gucci_jackie',
    accent: '#C5A059'
  },
  {
    dest: 'products/bags/gucci_interlocking_pouch.jpg',
    brand: 'GUCCI',
    model: 'Interlocking G Chain Crossbody Pouch',
    pill: 'Supple grain calfskin with cut-out round GG emblem & curb chain',
    type: 'gucci_pouch',
    accent: '#DFB15B'
  },
  {
    dest: 'products/bags/gucci_dionysus_supermini.jpg',
    brand: 'GUCCI',
    model: 'Dionysus Super Mini Chain Bag',
    pill: 'GG Supreme canvas with crystal-embellished tiger head horseshoe spur',
    type: 'gucci_dionysus',
    accent: '#C0C0C0'
  },

  // 5. Chanel Products
  {
    dest: 'products/bags/chanel_boy_chevron.jpg',
    brand: 'CHANEL',
    model: 'Boy Chanel Small Chevron Flap',
    pill: 'Quilted chevron calfskin with chunky gourmette chain & brick clasp',
    type: 'chanel_boy',
    accent: '#C0C0C0'
  },
  {
    dest: 'products/wallets/chanel_classic_cardholder.jpg',
    brand: 'CHANEL',
    model: 'Classic Flap Card Holder Caviar',
    pill: 'Grained black caviar calfskin with gold-tone CC front logo',
    type: 'chanel_cardholder',
    accent: '#DFB15B'
  },
  {
    dest: 'products/bags/chanel_gabrielle_hobo.jpg',
    brand: 'CHANEL',
    model: 'Gabrielle Small Hobo Vintage Calf',
    pill: 'Dual aged calfskin body with double gold & ruthenium interlaced chains',
    type: 'chanel_gabrielle',
    accent: '#E6C657'
  },
  {
    dest: 'products/bags/chanel_coco_handle.jpg',
    brand: 'CHANEL',
    model: 'Coco Handle Mini Flap Champagne',
    pill: 'Chevron caviar leather with rigid rolled top handle & champagne gold CC',
    type: 'chanel_coco',
    accent: '#F3E5AB'
  },

  // 6. CP Company Products
  {
    dest: 'products/clothing/cpcompany_lens_hoodie.jpg',
    brand: 'C.P. COMPANY',
    model: 'Soft Shell-R Lens Zip Hoodie',
    pill: 'Weatherproof recycled nylon fleece with iconic sleeve lens watch-viewer',
    type: 'cp_hoodie',
    accent: '#0A0A0A'
  },
  {
    dest: 'products/clothing/cpcompany_goggle_jacket.jpg',
    brand: 'C.P. COMPANY',
    model: 'Chrome-R Goggle Down Jacket Olive',
    pill: 'Military garment-dyed multi-filament nylon with signature goggle hood',
    type: 'cp_jacket',
    accent: '#4B5320'
  },
  {
    dest: 'products/clothing/cpcompany_lens_cargo.jpg',
    brand: 'C.P. COMPANY',
    model: 'Garment Dyed Lens Cargo Pants',
    pill: 'Tough stretch sateen cotton with ergonomic cargo pocket & black lens',
    type: 'cp_cargo',
    accent: '#2F3E2E'
  },
  {
    dest: 'products/clothing/cpcompany_goggle_anorak.jpg',
    brand: 'C.P. COMPANY',
    model: 'Pro-Tek Hooded Goggle Anorak',
    pill: 'High performance stretch polyester smock with signature protective goggles',
    type: 'cp_anorak',
    accent: '#4F5D75'
  },
  {
    dest: 'products/clothing/cpcompany_fleece_sweatshirt.jpg',
    brand: 'C.P. COMPANY',
    model: 'Diagonal Raised Fleece Crewneck',
    pill: 'Heavyweight loopback cotton jersey with sleeve compartment & lens',
    type: 'cp_sweatshirt',
    accent: '#1B263B'
  },
  {
    dest: 'products/bags/cpcompany_goggle_waistbag.jpg',
    brand: 'C.P. COMPANY',
    model: 'Nylon B Crossbody Goggle Bumbag',
    pill: 'Weather-resistant textured nylon with adjustable webbing & centered goggle',
    type: 'cp_bumbag',
    accent: '#111111'
  },

  // 7. Celine Products
  {
    dest: 'products/bags/celine_ava_canvas.jpg',
    brand: 'CÉLINE',
    model: 'Ava Bag Triomphe Canvas Tan',
    pill: 'Curved crescent silhouette in Triomphe coated canvas with tan calfskin piping',
    type: 'celine_ava',
    accent: '#8B5A2B'
  },
  {
    dest: 'products/bags/celine_classic_box.jpg',
    brand: 'CÉLINE',
    model: 'Classic Box Medium Liege Leather',
    pill: 'Minimalist structured flap in box calfskin with antique golden clasp',
    type: 'celine_box',
    accent: '#DFB15B'
  },
  {
    dest: 'products/bags/celine_folco_shoulder.jpg',
    brand: 'CÉLINE',
    model: 'Folco Saddle Bag Triomphe Canvas',
    pill: 'Rounded equestrian saddle bag in Triomphe canvas with buckled leather flap',
    type: 'celine_folco',
    accent: '#7D4F27'
  },
  {
    dest: 'products/bags/celine_luggage_nano.jpg',
    brand: 'CÉLINE',
    model: 'Luggage Nano Drummed Calf Souris',
    pill: 'Iconic flared winged tote in drummed grey-beige calfskin with front zip',
    type: 'celine_luggage',
    accent: '#7E7A75'
  },
  {
    dest: 'products/bags/celine_cabas_mini.jpg',
    brand: 'CÉLINE',
    model: 'Mini Vertical Cabas Triomphe',
    pill: 'Slim vertical tote with Triomphe monogram & top tan leather handles',
    type: 'celine_cabas',
    accent: '#8A5829'
  },

  // 8. Search & Jewelry/Watches Specific Items
  {
    dest: 'products/watches/cartier_tank_must.jpg',
    brand: 'CARTIER',
    model: 'Tank Must Watch Small Steel',
    pill: 'Rectangular polished steel case, silver opaline dial with blue sword hands',
    type: 'cartier_tank',
    accent: '#002366'
  },
  {
    dest: 'products/jewelry/cartier_love_bracelet.jpg',
    brand: 'CARTIER',
    model: 'LOVE Bracelet 18K Yellow Gold',
    pill: 'Iconic oval rigid bangle with precision engraved screw motifs',
    type: 'cartier_love',
    accent: '#D4AF37'
  },
  {
    dest: 'products/bags/goyard_saint_louis_pm.jpg',
    brand: 'GOYARD',
    model: 'Saint Louis PM Tote Black & Tan',
    pill: 'Lightweight Goyardine chevron canvas with dual flat leather handles',
    type: 'goyard_tote',
    accent: '#9C6F44'
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
      background: radial-gradient(circle at 50% 36%, #FAFAFA 0%, #ECEEF2 60%, #DADDE2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      position: relative;
    }

    /* Diffused Commercial Lighting */
    .spotlight {
      position: absolute;
      top: -120px;
      width: 900px;
      height: 700px;
      background: radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 70%);
      pointer-events: none;
    }

    /* Studio Stone Podium */
    .podium-wrap {
      position: absolute;
      bottom: 110px;
      width: 720px;
      height: 180px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .podium-shadow {
      position: absolute;
      bottom: -15px;
      width: 690px;
      height: 75px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.12) 48%, rgba(0,0,0,0) 75%);
      filter: blur(14px);
    }
    .podium {
      width: 660px;
      height: 90px;
      background: linear-gradient(180deg, #FFFFFF 0%, #EEEEF2 50%, #D6D8DE 100%);
      border-radius: 50% / 30px;
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.95), 0 16px 36px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.8);
    }

    /* Product Stage */
    .product-stage {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -35px;
    }

    .art-container {
      position: relative;
      width: 460px;
      height: 460px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 30px 34px rgba(0,0,0,0.32));
    }

    /* Brand Watermark */
    .brand-watermark {
      position: absolute;
      top: 55px;
      text-align: center;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: rgba(25, 25, 30, 0.85);
      font-size: 16px;
      font-weight: 800;
    }
    .model-sub {
      font-size: 11px;
      letter-spacing: 0.22em;
      color: rgba(90, 95, 105, 0.75);
      margin-top: 6px;
      font-weight: 600;
    }

    /* Spec Pill */
    .spec-pill {
      position: absolute;
      bottom: 40px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      padding: 10px 24px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #262626;
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .spec-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${item.accent};
      box-shadow: 0 0 8px ${item.accent};
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
    <div class="art-container">
      ${renderItemArt(item)}
    </div>
  </div>

  <div class="spec-pill">
    <div class="spec-dot"></div>
    <span>${item.pill}</span>
  </div>
</body>
</html>`;
}

function renderItemArt(item) {
  switch (item.type) {
    case 'sneaker_tile':
      return `
        <svg width="420" height="360" viewBox="0 0 420 360" fill="none">
          <!-- Sculpted Chunky Designer Sneaker Silhouette -->
          <!-- Outsole -->
          <path d="M40 270 Q 70 295 140 295 H 330 Q 380 295 390 270 Q 395 245 370 245 H 340 L 300 245 L 140 245 Q 80 245 40 270 Z" fill="#F4F4F6" stroke="#D1D3DA" stroke-width="3"/>
          <path d="M60 280 H 370" stroke="#111" stroke-width="4" stroke-dasharray="8 6"/>
          <!-- Leather Upper Panels -->
          <path d="M70 245 C 70 190, 140 160, 200 160 L 250 160 C 290 160, 340 190, 360 245 Z" fill="#FFFFFF" stroke="#E2E4E9" stroke-width="2"/>
          <!-- Suede Mudguard Overlay -->
          <path d="M70 245 C 90 200, 160 210, 210 210 L 350 245 Z" fill="#2B2B2E"/>
          <!-- Padded Tongue & Eyestay -->
          <path d="M190 160 L 220 100 Q 250 100 260 160 Z" fill="#1C1C1E"/>
          <!-- Reflective Lacing -->
          <path d="M205 155 L 245 135 M 205 135 L 245 115 M 210 115 L 240 105" stroke="#FEE500" stroke-width="4" stroke-linecap="round"/>
          <!-- Heel Counter Accent -->
          <path d="M330 200 C 350 200, 360 215, 360 245 H 310 Z" fill="#DFB15B"/>
        </svg>
      `;

    case 'jewelry_tile':
      return `
        <svg width="420" height="380" viewBox="0 0 420 380" fill="none">
          <!-- Black Velvet Jewelry Pillow Base -->
          <ellipse cx="210" cy="270" rx="160" ry="40" fill="#18181A" stroke="#2C2C30" stroke-width="3"/>
          <!-- 18K Gold Solitaire Ring -->
          <ellipse cx="210" cy="200" rx="90" ry="90" fill="none" stroke="url(#goldGrad)" stroke-width="22"/>
          <ellipse cx="210" cy="200" rx="84" ry="84" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.6"/>
          <!-- Brilliant Diamond Crown Prongs -->
          <path d="M190 105 L 210 70 L 230 105 Z" fill="#D4AF37"/>
          <!-- Round Brilliant Cut Diamond -->
          <polygon points="210,60 238,80 226,115 194,115 182,80" fill="#E8F4F8" stroke="#B0D4DE" stroke-width="2"/>
          <polygon points="210,60 210,115" stroke="#FFFFFF" stroke-width="2"/>
          <polygon points="182,80 238,80" stroke="#FFFFFF" stroke-width="2"/>
          <!-- Sparkle Highlights -->
          <path d="M255 50 L 265 60 L 255 70 L 245 60 Z" fill="#FFFFFF"/>
          <path d="M165 65 L 172 72 L 165 79 L 158 72 Z" fill="#FFFFFF"/>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FFE082"/>
              <stop offset="50%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#997A15"/>
            </linearGradient>
          </defs>
        </svg>
      `;

    case 'apparel_tile':
      return `
        <svg width="420" height="380" viewBox="0 0 420 380" fill="none">
          <!-- Tailored Double-Breasted Wool Trench / Coat -->
          <!-- Hanger Hook & Shoulders -->
          <path d="M210 40 L 160 80 H 260 Z" fill="#DFB15B"/>
          <!-- Torso & Coat Silhouette -->
          <path d="M140 85 L 90 280 H 330 L 280 85 Z" fill="#2E282A" stroke="#1F1A1B" stroke-width="3"/>
          <!-- Wide Peaked Lapels -->
          <polygon points="210,110 145,170 170,85" fill="#3D3538"/>
          <polygon points="210,110 275,170 250,85" fill="#3D3538"/>
          <!-- Double Breasted Horn Buttons -->
          <circle cx="185" cy="180" r="8" fill="#111" stroke="#DFB15B" stroke-width="2"/>
          <circle cx="235" cy="180" r="8" fill="#111" stroke="#DFB15B" stroke-width="2"/>
          <circle cx="185" cy="225" r="8" fill="#111" stroke="#DFB15B" stroke-width="2"/>
          <circle cx="235" cy="225" r="8" fill="#111" stroke="#DFB15B" stroke-width="2"/>
          <!-- Waist Belt with Buckle -->
          <rect x="110" y="245" width="200" height="18" fill="#231E20"/>
          <rect x="195" y="240" width="30" height="28" rx="4" fill="#DFB15B" stroke="#997A15" stroke-width="2"/>
        </svg>
      `;

    case 'lv_scarf':
      return `
        <svg width="400" height="360" viewBox="0 0 400 360" fill="none">
          <!-- Soft Pink Draped Cashmere Scarf with LV Monogram Jacquard -->
          <path d="M120 70 C 100 160, 110 260, 140 310 C 180 320, 240 320, 270 310 C 300 260, 310 160, 290 70 Z" fill="#E8B4B8" stroke="#D1989C" stroke-width="2"/>
          <path d="M140 310 L 140 340 M 160 312 L 160 342 M 180 315 L 180 345 M 200 315 L 200 345 M 220 315 L 220 345 M 240 312 L 240 342 M 260 310 L 260 340" stroke="#E8B4B8" stroke-width="3" stroke-linecap="round"/>
          <!-- LV Floral Star Monogram in White Jacquard -->
          <g fill="#FFFFFF" opacity="0.85">
            <circle cx="205" cy="130" r="14"/>
            <polygon points="205,105 210,125 230,130 210,135 205,155 200,135 180,130 200,125"/>
            <polygon points="165,180 170,195 185,200 170,205 165,220 160,205 145,200 160,195"/>
            <polygon points="245,180 250,195 265,200 250,205 245,220 240,205 225,200 240,195"/>
            <text x="205" y="270" font-family="serif" font-weight="900" font-size="28" text-anchor="middle" fill="#FFFFFF">LV</text>
          </g>
        </svg>
      `;

    case 'lv_pouch':
      return `
        <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
          <!-- Black Monogram Empreinte Leather Pouch with Gold Chain -->
          <path d="M110 80 C 110 10, 290 10, 290 80" stroke="#DFB15B" stroke-width="6" stroke-linecap="round" fill="none"/>
          <rect x="70" y="80" width="260" height="190" rx="20" fill="#18181A" stroke="#2C2C30" stroke-width="2"/>
          <!-- Empreinte Embossed Patterns -->
          <g fill="#2C2C30" opacity="0.8">
            <circle cx="130" cy="140" r="12"/>
            <circle cx="270" cy="140" r="12"/>
            <circle cx="200" cy="200" r="12"/>
          </g>
          <!-- Front Flap / Zip & Gold LV Padlock/Pull -->
          <path d="M70 80 H 330 V 160 Q 200 180 70 160 Z" fill="#202024"/>
          <circle cx="200" cy="170" r="16" fill="#DFB15B" stroke="#997A15" stroke-width="2"/>
          <text x="200" y="176" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#111">LV</text>
        </svg>
      `;

    case 'lv_epi':
      return `
        <svg width="400" height="350" viewBox="0 0 400 350" fill="none">
          <!-- Black Epi Leather Mirabeau Tote with Silver Lock -->
          <path d="M140 80 C 140 10, 260 10, 260 80" stroke="#161618" stroke-width="14" stroke-linecap="round" fill="none"/>
          <rect x="80" y="80" width="240" height="230" rx="16" fill="#141416" stroke="#252528" stroke-width="2"/>
          <!-- Epi Horizontal Wave Grain Texture -->
          <path d="M85 110 H 315 M 85 130 H 315 M 85 150 H 315 M 85 170 H 315 M 85 190 H 315 M 85 210 H 315 M 85 230 H 315 M 85 250 H 315 M 85 270 H 315 M 85 290 H 315" stroke="#252528" stroke-width="2"/>
          <!-- Silver Twist Lock Closure -->
          <rect x="180" y="160" width="40" height="26" rx="4" fill="#D8D8DF" stroke="#9E9EA8" stroke-width="2"/>
          <rect x="194" y="152" width="12" height="42" rx="3" fill="#B0B0BA"/>
          <text x="185" y="280" font-family="sans-serif" font-weight="bold" font-size="10" fill="#666">LOUIS VUITTON</text>
        </svg>
      `;

    case 'lv_nn14':
      return `
        <svg width="390" height="360" viewBox="0 0 390 360" fill="none">
          <!-- Monogram Canvas NN14 Bucket Bag with Pleated Leather Tassels -->
          <path d="M140 70 C 140 15, 250 15, 250 70" stroke="#111" stroke-width="12" stroke-linecap="round" fill="none"/>
          <path d="M100 80 L 80 290 Q 195 320 310 290 L 290 80 Z" fill="#6E5034" stroke="#483321" stroke-width="3"/>
          <!-- Monogram Floral Motifs -->
          <g fill="#DFB15B" opacity="0.8">
            <circle cx="195" cy="140" r="14"/>
            <polygon points="150,180 155,195 170,200 155,205 150,220 145,205 130,200 145,195"/>
            <polygon points="240,180 245,195 260,200 245,205 240,220 235,205 220,200 235,195"/>
          </g>
          <!-- Black Leather Pleated Trim & Hanging Tassels -->
          <rect x="95" y="75" width="200" height="15" fill="#151518"/>
          <path d="M185 90 L 175 220 M 195 90 L 195 230 M 205 90 L 215 220" stroke="#111" stroke-width="4" stroke-linecap="round"/>
        </svg>
      `;

    case 'lv_neonoe':
      return `
        <svg width="390" height="360" viewBox="0 0 390 360" fill="none">
          <!-- Monogram NéoNoé BB Bucket Bag with Black Drawstring -->
          <path d="M120 70 C 120 -5, 270 -5, 270 70" stroke="#151518" stroke-width="12" stroke-linecap="round" fill="none"/>
          <path d="M90 70 L 80 290 Q 195 315 310 290 L 300 70 Z" fill="#684A30" stroke="#453120" stroke-width="3"/>
          <!-- Classic Monogram Icons -->
          <g fill="#DFB15B" opacity="0.85">
            <circle cx="195" cy="160" r="14"/>
            <circle cx="140" cy="230" r="12"/>
            <circle cx="250" cy="230" r="12"/>
            <text x="195" y="245" font-family="serif" font-weight="900" font-size="24" text-anchor="middle" fill="#DFB15B">LV</text>
          </g>
          <!-- Black Leather Drawstring Cord & Eyelets -->
          <circle cx="160" cy="100" r="6" fill="#DFB15B"/>
          <circle cx="230" cy="100" r="6" fill="#DFB15B"/>
          <path d="M160 100 Q 195 130 230 100" stroke="#151518" stroke-width="5" fill="none"/>
          <rect x="190" y="115" width="10" height="40" rx="3" fill="#151518"/>
        </svg>
      `;

    case 'si_softshell':
      return `
        <svg width="400" height="380" viewBox="0 0 400 380" fill="none">
          <!-- Stone Island Soft Shell Black Hooded Jacket -->
          <!-- Hood -->
          <path d="M150 75 Q 200 35 250 75 Z" fill="#161618"/>
          <!-- Body & Shoulders -->
          <path d="M130 80 L 80 310 H 320 L 270 80 Z" fill="#18181B" stroke="#2A2A2E" stroke-width="2"/>
          <!-- Front Waterproof Center Zipper -->
          <line x1="200" y1="75" x2="200" y2="310" stroke="#333338" stroke-width="4"/>
          <!-- Left Sleeve with Compass Badge -->
          <rect x="85" y="160" width="36" height="65" rx="6" fill="#111113" stroke="#222" stroke-width="2"/>
          <!-- Black Buttons on Badge -->
          <circle cx="103" cy="168" r="3" fill="#444"/>
          <circle cx="103" cy="217" r="3" fill="#444"/>
          <!-- Yellow / Green Compass Rose -->
          <circle cx="103" cy="192" r="11" fill="none" stroke="#FEE500" stroke-width="2"/>
          <circle cx="103" cy="192" r="6" fill="#03C75A"/>
        </svg>
      `;

    case 'si_sweatshirt':
      return `
        <svg width="400" height="360" viewBox="0 0 400 360" fill="none">
          <!-- Stone Island Crewneck Sweatshirt Black -->
          <path d="M160 65 Q 200 85 240 65 L 290 85 L 320 310 H 80 L 110 85 Z" fill="#202024" stroke="#141416" stroke-width="2"/>
          <!-- Ribbed Collar -->
          <path d="M160 65 Q 200 85 240 65" stroke="#333" stroke-width="6" fill="none"/>
          <!-- Left Arm Compass Badge -->
          <rect x="85" y="145" width="34" height="62" rx="6" fill="#0D0D0E"/>
          <circle cx="102" cy="153" r="3" fill="#444"/>
          <circle cx="102" cy="199" r="3" fill="#444"/>
          <circle cx="102" cy="176" r="10" stroke="#FEE500" stroke-width="2" fill="none"/>
          <polygon points="102,168 105,176 102,184 99,176" fill="#03C75A"/>
        </svg>
      `;

    case 'si_ghost':
      return `
        <svg width="400" height="370" viewBox="0 0 400 370" fill="none">
          <!-- Stone Island Ghost Piece All Black Smock -->
          <path d="M140 70 L 70 310 H 330 L 260 70 Z" fill="#141416" stroke="#252528" stroke-width="2"/>
          <!-- All-Black Tonal Monochrome Ghost Badge -->
          <rect x="80" y="160" width="36" height="65" rx="6" fill="#0C0C0D" stroke="#1B1B1E" stroke-width="2"/>
          <circle cx="98" cy="168" r="3" fill="#222"/>
          <circle cx="98" cy="217" r="3" fill="#222"/>
          <circle cx="98" cy="192" r="11" stroke="#2A2A2E" stroke-width="2" fill="none"/>
          <polygon points="98,184 101,192 98,200 95,192" fill="#2A2A2E"/>
        </svg>
      `;

    case 'si_cap':
      return `
        <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
          <!-- Stone Island Compass Baseball Cap -->
          <path d="M120 220 C 120 110, 280 110, 280 220 Z" fill="#1B1B1E" stroke="#28282C" stroke-width="2"/>
          <!-- Curved Visor -->
          <path d="M90 220 Q 200 260 310 220 Q 200 240 90 220 Z" fill="#141416" stroke="#252528" stroke-width="2"/>
          <!-- Embroidered Compass Crest on Front -->
          <circle cx="200" cy="165" r="18" fill="#111" stroke="#FEE500" stroke-width="2"/>
          <circle cx="200" cy="165" r="7" fill="#03C75A"/>
        </svg>
      `;

    case 'si_cargo':
      return `
        <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
          <!-- Stone Island Slim Fit Cargo Trousers Charcoal -->
          <path d="M120 50 H 260 L 275 340 H 215 L 190 140 L 165 340 H 105 Z" fill="#2B2D32" stroke="#1D1E22" stroke-width="2"/>
          <!-- Thigh Cargo Pocket with Badge -->
          <rect x="110" y="150" width="45" height="65" rx="4" fill="#232529" stroke="#1D1E22" stroke-width="1.5"/>
          <rect x="120" y="165" width="25" height="42" rx="4" fill="#111"/>
          <circle cx="132" cy="186" r="6" stroke="#FEE500" stroke-width="1.5" fill="none"/>
        </svg>
      `;

    case 'si_puffer':
      return `
        <svg width="400" height="380" viewBox="0 0 400 380" fill="none">
          <!-- Stone Island Crinkle Reps Down Puffer -->
          <path d="M130 80 L 80 315 H 320 L 270 80 Z" fill="#18181B" stroke="#28282C" stroke-width="2"/>
          <!-- Horizontal Baffles / Down Quilting -->
          <path d="M95 140 Q 200 155 305 140 M 85 200 Q 200 215 315 200 M 80 260 Q 200 275 320 260" stroke="#2D2D32" stroke-width="3" fill="none"/>
          <line x1="200" y1="80" x2="200" y2="315" stroke="#111" stroke-width="4"/>
          <!-- Arm Badge -->
          <rect x="85" y="160" width="34" height="60" rx="6" fill="#111"/>
          <circle cx="102" cy="190" r="10" stroke="#FEE500" stroke-width="2" fill="none"/>
        </svg>
      `;

    case 'gucci_marmont':
      return `
        <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
          <!-- Gucci Marmont Chevron Quilted Flap Bag with Gold Double G -->
          <path d="M110 70 C 110 -5, 290 -5, 290 70" stroke="#DFB15B" stroke-width="8" stroke-linecap="round" fill="none"/>
          <rect x="60" y="70" width="280" height="210" rx="20" fill="#18181A" stroke="#252528" stroke-width="2"/>
          <!-- Chevron Quilt Lines -->
          <path d="M80 140 L 200 200 L 320 140 M 80 170 L 200 230 L 320 170 M 80 200 L 200 260 L 320 200" stroke="#28282C" stroke-width="2" fill="none"/>
          <!-- Flap -->
          <path d="M60 70 H 340 V 170 Q 200 205 60 170 Z" fill="#202024"/>
          <path d="M80 100 L 200 160 L 320 100" stroke="#2E2E34" stroke-width="2" fill="none"/>
          <!-- Double G Hardware -->
          <circle cx="188" cy="170" r="18" stroke="#DFB15B" stroke-width="4.5" fill="none"/>
          <circle cx="212" cy="170" r="18" stroke="#DFB15B" stroke-width="4.5" fill="none"/>
        </svg>
      `;

    case 'gucci_horsebit':
      return `
        <svg width="400" height="350" viewBox="0 0 400 350" fill="none">
          <!-- Gucci Horsebit 1955 Top Handle in GG Canvas / Brown Leather -->
          <path d="M140 80 C 140 15, 260 15, 260 80" stroke="#5D3A1A" stroke-width="12" stroke-linecap="round" fill="none"/>
          <path d="M90 85 L 70 300 H 330 L 310 85 Z" fill="#6A4E36" stroke="#483321" stroke-width="3"/>
          <!-- Brown Leather Flap -->
          <path d="M90 85 H 310 V 195 Q 200 215 90 195 Z" fill="#4F331A"/>
          <!-- Golden Horsebit Clasp (Double Ring & Bar) -->
          <circle cx="160" cy="190" r="14" stroke="#DFB15B" stroke-width="4" fill="none"/>
          <circle cx="240" cy="190" r="14" stroke="#DFB15B" stroke-width="4" fill="none"/>
          <rect x="174" y="186" width="52" height="8" rx="2" fill="#DFB15B"/>
        </svg>
      `;

    case 'gucci_jackie':
      return `
        <svg width="400" height="350" viewBox="0 0 400 350" fill="none">
          <!-- Gucci Jackie 1961 Hobo Étoupe -->
          <path d="M120 70 C 120 0, 280 0, 280 70" stroke="#7A6858" stroke-width="14" stroke-linecap="round" fill="none"/>
          <!-- Curved Hobo Body -->
          <path d="M80 70 Q 70 280 200 300 Q 330 280 320 70 Q 250 140 200 140 Q 150 140 80 70 Z" fill="#8C7969" stroke="#685646" stroke-width="3"/>
          <!-- Leather Center Strap with Golden Piston Clasp -->
          <rect x="190" y="130" width="20" height="90" rx="4" fill="#685646"/>
          <rect x="194" y="165" width="12" height="28" rx="3" fill="#DFB15B" stroke="#997A15" stroke-width="2"/>
        </svg>
      `;

    case 'gucci_pouch':
      return `
        <svg width="390" height="340" viewBox="0 0 390 340" fill="none">
          <!-- Gucci Interlocking G Chain Crossbody -->
          <path d="M110 70 C 110 -5, 280 -5, 280 70" stroke="#DFB15B" stroke-width="6" fill="none"/>
          <rect x="65" y="70" width="260" height="190" rx="16" fill="#1A1A1D" stroke="#29292E" stroke-width="2"/>
          <path d="M65 70 H 325 V 155 Q 195 175 65 155 Z" fill="#222226"/>
          <!-- Round Cutout Interlocking GG -->
          <circle cx="195" cy="160" r="22" fill="#DFB15B"/>
          <circle cx="188" cy="160" r="14" stroke="#1A1A1D" stroke-width="3.5" fill="none"/>
          <circle cx="202" cy="160" r="14" stroke="#1A1A1D" stroke-width="3.5" fill="none"/>
        </svg>
      `;

    case 'gucci_dionysus':
      return `
        <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
          <!-- Gucci Dionysus Super Mini with Tiger Head Spur -->
          <path d="M120 70 C 120 0, 280 0, 280 70" stroke="#B8B8C2" stroke-width="7" fill="none"/>
          <rect x="70" y="70" width="260" height="190" rx="16" fill="#6B5038" stroke="#483422" stroke-width="3"/>
          <path d="M70 70 H 330 V 160 Q 200 180 70 160 Z" fill="#2A2421"/>
          <!-- Double Tiger Head Horseshoe Clasp in Antiqued Silver -->
          <path d="M170 180 C 170 150, 230 150, 230 180" stroke="#D1D1DB" stroke-width="7" fill="none" stroke-linecap="round"/>
          <circle cx="170" cy="180" r="6" fill="#A0A0AA"/>
          <circle cx="230" cy="180" r="6" fill="#A0A0AA"/>
        </svg>
      `;

    case 'chanel_boy':
      return `
        <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
          <!-- Boy Chanel Small Chevron Flap -->
          <path d="M120 60 C 120 -15, 280 -15, 280 60" stroke="#C0C0C8" stroke-width="12" fill="none"/>
          <rect x="60" y="60" width="280" height="210" rx="14" fill="#151518" stroke="#252528" stroke-width="2"/>
          <!-- Rigid Linear Boy Border -->
          <rect x="72" y="72" width="256" height="186" rx="8" fill="none" stroke="#28282C" stroke-width="6"/>
          <!-- Chevron Quilt Lines -->
          <path d="M85 100 L 200 145 L 315 100 M 85 130 L 200 175 L 315 130" stroke="#2D2D32" stroke-width="2" fill="none"/>
          <!-- Rectangular Boy Brick Clasp with CC -->
          <rect x="175" y="165" width="50" height="34" rx="4" fill="#C4C4CE" stroke="#8A8A94" stroke-width="2"/>
          <circle cx="200" cy="182" r="8" stroke="#333" stroke-width="2" fill="none"/>
        </svg>
      `;

    case 'chanel_cardholder':
      return `
        <svg width="380" height="300" viewBox="0 0 380 300" fill="none">
          <!-- Chanel Classic Caviar Flap Cardholder -->
          <rect x="60" y="50" width="260" height="190" rx="16" fill="#151518" stroke="#252528" stroke-width="2"/>
          <!-- Diamond Quilted Flap -->
          <path d="M60 50 H 320 V 150 Q 190 175 60 150 Z" fill="#1C1C20"/>
          <!-- Gold CC Logo -->
          <circle cx="186" cy="155" r="12" stroke="#DFB15B" stroke-width="3.5" fill="none"/>
          <circle cx="194" cy="155" r="12" stroke="#DFB15B" stroke-width="3.5" fill="none"/>
        </svg>
      `;

    case 'chanel_gabrielle':
      return `
        <svg width="400" height="350" viewBox="0 0 400 350" fill="none">
          <!-- Chanel Gabrielle Small Hobo (Smooth Base + Quilted Body) -->
          <path d="M110 70 C 110 -10, 290 -10, 290 70" stroke="#C0C0C8" stroke-width="7" fill="none"/>
          <path d="M120 70 C 120 -5, 280 -5, 280 70" stroke="#DFB15B" stroke-width="7" fill="none"/>
          <!-- Rigid Thermoformed Hard Base -->
          <path d="M70 210 H 330 V 275 Q 330 295 310 295 H 90 Q 70 295 70 275 Z" fill="#0C0C0E"/>
          <!-- Quilted Slouchy Upper Body -->
          <path d="M80 80 H 320 L 330 210 H 70 Z" fill="#1E1E22"/>
          <!-- CC Gold Zipper Pull -->
          <circle cx="200" cy="95" r="10" fill="#DFB15B"/>
        </svg>
      `;

    case 'chanel_coco':
      return `
        <svg width="400" height="350" viewBox="0 0 400 350" fill="none">
          <!-- Chanel Coco Handle Trapezoid Flap with Rigid Top Handle -->
          <path d="M140 80 C 140 10, 260 10, 260 80" stroke="#682A1B" stroke-width="14" stroke-linecap="round" fill="none"/>
          <!-- Trapezoid Body -->
          <path d="M90 90 L 60 290 H 340 L 310 90 Z" fill="#141416" stroke="#252528" stroke-width="2"/>
          <!-- Flap with Champagne Gold CC -->
          <path d="M90 90 H 310 L 320 185 Q 200 210 80 185 Z" fill="#1C1C20"/>
          <circle cx="194" cy="190" r="14" stroke="#F3E5AB" stroke-width="4" fill="none"/>
          <circle cx="206" cy="190" r="14" stroke="#F3E5AB" stroke-width="4" fill="none"/>
        </svg>
      `;

    case 'cp_hoodie':
      return `
        <svg width="400" height="370" viewBox="0 0 400 370" fill="none">
          <!-- CP Company Soft Shell Black Zip Hoodie with Sleeve Lens -->
          <path d="M140 70 L 80 320 H 320 L 260 70 Z" fill="#161618" stroke="#26262A" stroke-width="2"/>
          <line x1="200" y1="70" x2="200" y2="320" stroke="#333" stroke-width="4"/>
          <!-- Left Sleeve Pocket & Glossy Black Watch-Viewer Lens -->
          <rect x="85" y="160" width="34" height="60" rx="4" fill="#1D1D20"/>
          <circle cx="102" cy="190" r="13" fill="#050505" stroke="#333338" stroke-width="2"/>
          <text x="102" y="193" font-family="sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#FFFFFF">C.P.</text>
        </svg>
      `;

    case 'cp_jacket':
      return `
        <svg width="400" height="370" viewBox="0 0 400 370" fill="none">
          <!-- CP Company Chrome-R Down Goggle Jacket Olive -->
          <path d="M140 70 L 75 320 H 325 L 260 70 Z" fill="#3D452B" stroke="#2A301E" stroke-width="2"/>
          <!-- Goggle Hood Accent (Dual Round Goggles on Hood) -->
          <circle cx="170" cy="55" r="16" fill="#0A0A0A" stroke="#222" stroke-width="3"/>
          <circle cx="230" cy="55" r="16" fill="#0A0A0A" stroke="#222" stroke-width="3"/>
          <text x="170" y="58" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle" fill="#FFF">C.P.</text>
          <text x="230" y="58" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle" fill="#FFF">C.P.</text>
          <line x1="200" y1="70" x2="200" y2="320" stroke="#252A1A" stroke-width="4"/>
        </svg>
      `;

    case 'cp_cargo':
      return `
        <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
          <!-- CP Company Cargo Pants Olive with Lens -->
          <path d="M120 50 H 260 L 275 340 H 215 L 190 140 L 165 340 H 105 Z" fill="#363E2D" stroke="#252B1F" stroke-width="2"/>
          <!-- Cargo Thigh Pocket with Lens -->
          <rect x="110" y="150" width="45" height="65" rx="4" fill="#2D3425"/>
          <circle cx="132" cy="182" r="12" fill="#0A0A0A" stroke="#222" stroke-width="2"/>
          <text x="132" y="185" font-family="sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#FFF">C.P.</text>
        </svg>
      `;

    case 'cp_anorak':
      return `
        <svg width="400" height="370" viewBox="0 0 400 370" fill="none">
          <!-- CP Company Pro-Tek Goggle Anorak Grey/Navy -->
          <path d="M140 70 L 75 320 H 325 L 260 70 Z" fill="#3F4856" stroke="#2A303A" stroke-width="2"/>
          <!-- Front Kangaroo Pocket -->
          <rect x="130" y="180" width="140" height="80" rx="8" fill="#353D4A"/>
          <!-- Hood with Goggles -->
          <circle cx="170" cy="55" r="15" fill="#0A0A0A" stroke="#222" stroke-width="2"/>
          <circle cx="230" cy="55" r="15" fill="#0A0A0A" stroke="#222" stroke-width="2"/>
        </svg>
      `;

    case 'cp_sweatshirt':
      return `
        <svg width="400" height="360" viewBox="0 0 400 360" fill="none">
          <!-- CP Company Diagonal Raised Fleece Sweatshirt Navy -->
          <path d="M160 65 Q 200 85 240 65 L 290 85 L 320 310 H 80 L 110 85 Z" fill="#1C2433" stroke="#121822" stroke-width="2"/>
          <!-- Arm Lens -->
          <rect x="85" y="150" width="32" height="55" rx="4" fill="#151C28"/>
          <circle cx="101" cy="177" r="12" fill="#08080A" stroke="#333" stroke-width="2"/>
          <text x="101" y="180" font-family="sans-serif" font-size="6" font-weight="bold" text-anchor="middle" fill="#FFF">C.P.</text>
        </svg>
      `;

    case 'cp_bumbag':
      return `
        <svg width="400" height="330" viewBox="0 0 400 330" fill="none">
          <!-- CP Company Nylon B Waistbag / Sling with Centered Goggle Lens -->
          <path d="M60 160 H 340" stroke="#333" stroke-width="18"/>
          <!-- Curved Pouch Body -->
          <path d="M100 130 Q 200 110 300 130 L 290 230 Q 200 250 110 230 Z" fill="#18181A" stroke="#2C2C30" stroke-width="2"/>
          <!-- Centered Big Goggle Lens -->
          <circle cx="200" cy="180" r="24" fill="#050505" stroke="#3A3A40" stroke-width="3"/>
          <text x="200" y="184" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#FFFFFF">C.P.</text>
        </svg>
      `;

    case 'celine_ava':
      return `
        <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
          <!-- Celine Ava Bag Crescent in Triomphe Canvas & Tan Piping -->
          <path d="M110 70 C 110 -10, 290 -10, 290 70" stroke="#7A4C24" stroke-width="12" stroke-linecap="round" fill="none"/>
          <!-- Crescent Body -->
          <path d="M80 90 Q 60 260 200 280 Q 340 260 320 90 Q 200 160 80 90 Z" fill="#3D291D" stroke="#7A4C24" stroke-width="4"/>
          <!-- Triomphe Gold Emblem -->
          <rect x="180" y="170" width="40" height="24" rx="4" fill="#DFB15B"/>
        </svg>
      `;

    case 'celine_box':
      return `
        <svg width="400" height="340" viewBox="0 0 400 340" fill="none">
          <!-- Celine Classic Box Bag Minimalist Flap with Rectangular Brass Clasp -->
          <path d="M110 70 C 110 0, 290 0, 290 70" stroke="#1A1A1D" stroke-width="12" fill="none"/>
          <rect x="70" y="70" width="260" height="200" rx="14" fill="#18181A" stroke="#252528" stroke-width="2"/>
          <path d="M70 70 H 330 V 170 H 70 Z" fill="#202024"/>
          <!-- Golden Box Rectangular Clasp -->
          <rect x="180" y="155" width="40" height="30" rx="2" fill="#E6C657" stroke="#A88B2A" stroke-width="2"/>
        </svg>
      `;

    case 'celine_folco':
      return `
        <svg width="390" height="350" viewBox="0 0 390 350" fill="none">
          <!-- Celine Folco Saddle Bag in Triomphe Canvas -->
          <path d="M100 60 C 100 -10, 290 -10, 290 60" stroke="#7A4C24" stroke-width="10" fill="none"/>
          <path d="M90 60 H 300 V 210 Q 300 300 195 300 Q 90 300 90 210 Z" fill="#3D291D" stroke="#7A4C24" stroke-width="3"/>
          <path d="M90 60 H 300 V 180 Q 195 240 90 180 Z" fill="#4A3426"/>
          <!-- Leather Center Strap with Buckle -->
          <rect x="188" y="160" width="14" height="70" rx="2" fill="#7A4C24"/>
          <rect x="184" y="200" width="22" height="20" rx="3" fill="none" stroke="#DFB15B" stroke-width="2"/>
        </svg>
      `;

    case 'celine_luggage':
      return `
        <svg width="400" height="350" viewBox="0 0 400 350" fill="none">
          <!-- Celine Luggage Nano Drummed Calf Souris Flared Wings Tote -->
          <path d="M140 80 C 140 20, 260 20, 260 80" stroke="#686460" stroke-width="12" stroke-linecap="round" fill="none"/>
          <!-- Distinctive Winged Body in Souris Taupe -->
          <polygon points="120,80 70,120 100,290 300,290 330,120 280,80" fill="#7C7873" stroke="#5C5854" stroke-width="3"/>
          <!-- Front Wave Seams & Curved Pocket Zip -->
          <path d="M130 140 Q 200 180 270 140" stroke="#5C5854" stroke-width="3" fill="none"/>
          <line x1="160" y1="200" x2="240" y2="200" stroke="#111" stroke-width="3"/>
          <circle cx="200" cy="200" r="3" fill="#DFB15B"/>
        </svg>
      `;

    case 'celine_cabas':
      return `
        <svg width="390" height="360" viewBox="0 0 390 360" fill="none">
          <!-- Celine Mini Vertical Cabas Triomphe -->
          <path d="M150 70 C 150 15, 240 15, 240 70" stroke="#7A4C24" stroke-width="10" stroke-linecap="round" fill="none"/>
          <rect x="110" y="70" width="170" height="235" rx="10" fill="#3D291D" stroke="#7A4C24" stroke-width="3"/>
          <!-- White Stamped CELINE PARIS Text -->
          <text x="195" y="180" font-family="sans-serif" font-weight="900" font-size="16" letter-spacing="3" text-anchor="middle" fill="#FFFFFF">CELINE</text>
          <text x="195" y="196" font-family="sans-serif" font-weight="bold" font-size="9" letter-spacing="2" text-anchor="middle" fill="#C8A880">PARIS</text>
        </svg>
      `;

    case 'cartier_tank':
      return `
        <svg width="400" height="380" viewBox="0 0 400 380" fill="none">
          <!-- Cartier Tank Must Watch Steel -->
          <!-- Black Alligator Strap -->
          <rect x="150" y="40" width="100" height="300" rx="4" fill="#141416"/>
          <!-- Polished Rectangular Steel Case -->
          <rect x="135" y="110" width="130" height="160" rx="12" fill="#E8E8EE" stroke="#A8A8B4" stroke-width="3"/>
          <!-- Silver Opaline Dial -->
          <rect x="155" y="130" width="90" height="120" rx="4" fill="#FFFFFF"/>
          <!-- Blue Cabochon Crown -->
          <circle cx="270" cy="190" r="7" fill="#002366" stroke="#DFB15B" stroke-width="1"/>
          <!-- Roman Numerals (XII, VI, III, IX) -->
          <text x="200" y="152" font-family="serif" font-weight="bold" font-size="12" text-anchor="middle" fill="#111">XII</text>
          <text x="200" y="240" font-family="serif" font-weight="bold" font-size="12" text-anchor="middle" fill="#111">VI</text>
          <text x="235" y="194" font-family="serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#111">III</text>
          <text x="165" y="194" font-family="serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#111">IX</text>
          <!-- Blue Steel Sword Hands -->
          <line x1="200" y1="190" x2="200" y2="160" stroke="#002366" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="200" y1="190" x2="225" y2="190" stroke="#002366" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;

    case 'cartier_love':
      return `
        <svg width="420" height="370" viewBox="0 0 420 370" fill="none">
          <!-- Cartier LOVE Bracelet 18K Yellow Gold -->
          <ellipse cx="210" cy="185" rx="130" ry="85" fill="none" stroke="url(#goldGradLove)" stroke-width="28"/>
          <!-- Screw Motifs Along Bangle -->
          <g fill="#997A15">
            <circle cx="95" cy="185" r="7"/>
            <line x1="90" y1="185" x2="100" y2="185" stroke="#FFE082" stroke-width="2"/>
            <circle cx="325" cy="185" r="7"/>
            <line x1="320" y1="185" x2="330" y2="185" stroke="#FFE082" stroke-width="2"/>
            <circle cx="150" cy="115" r="7"/>
            <line x1="145" y1="115" x2="155" y2="115" stroke="#FFE082" stroke-width="2"/>
            <circle cx="270" cy="115" r="7"/>
            <line x1="265" y1="115" x2="275" y2="115" stroke="#FFE082" stroke-width="2"/>
            <circle cx="150" cy="255" r="7"/>
            <line x1="145" y1="255" x2="155" y2="255" stroke="#FFE082" stroke-width="2"/>
            <circle cx="270" cy="255" r="7"/>
            <line x1="265" y1="255" x2="275" y2="255" stroke="#FFE082" stroke-width="2"/>
          </g>
          <defs>
            <linearGradient id="goldGradLove" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FFF3B0"/>
              <stop offset="50%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#8C6D08"/>
            </linearGradient>
          </defs>
        </svg>
      `;

    case 'goyard_tote':
      return `
        <svg width="400" height="350" viewBox="0 0 400 350" fill="none">
          <!-- Goyard Saint Louis PM Tote in Black & Tan Chevron -->
          <path d="M140 80 C 140 10, 260 10, 260 80" stroke="#A86E3C" stroke-width="10" stroke-linecap="round" fill="none"/>
          <!-- Trapeze Tote Body -->
          <polygon points="70,80 110,290 290,290 330,80" fill="#242120" stroke="#141212" stroke-width="2"/>
          <!-- Tan Leather Trim on Rim & Base Corners -->
          <line x1="70" y1="80" x2="330" y2="80" stroke="#A86E3C" stroke-width="5"/>
          <!-- Goyardine Chevron Pointillism Dots Pattern -->
          <g fill="#A86E3C" opacity="0.75">
            <polygon points="130,120 140,135 150,120"/>
            <polygon points="170,120 180,135 190,120"/>
            <polygon points="210,120 220,135 230,120"/>
            <polygon points="250,120 260,135 270,120"/>
            <polygon points="150,170 160,185 170,170"/>
            <polygon points="190,170 200,185 210,170"/>
            <polygon points="230,170 240,185 250,170"/>
          </g>
        </svg>
      `;

    default:
      return `<rect width="300" height="300" fill="#222" rx="20"/>`;
  }
}

async function run() {
  console.log(`Starting master asset generation for ${assetsToGenerate.length} luxury catalog assets...`);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });

  for (const item of assetsToGenerate) {
    const fullPath = path.join(publicDir, item.dest);
    console.log(`Rendering [${item.brand}] ${item.model} -> ${item.dest}...`);
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: fullPath, type: 'jpeg', quality: 95 });
  }

  await browser.close();
  console.log('Master asset generation completed successfully!');
}

run().catch(console.error);

