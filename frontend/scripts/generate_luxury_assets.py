import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_studio_canvas(w=1000, h=1000, theme='warm'):
    if theme == 'warm':
        top_c, bot_c = (248, 246, 242), (218, 214, 208)
    elif theme == 'dark':
        top_c, bot_c = (38, 38, 42), (18, 18, 20)
    elif theme == 'kids':
        top_c, bot_c = (246, 248, 252), (225, 230, 238)
    elif theme == 'rose':
        top_c, bot_c = (252, 246, 246), (235, 222, 222)
    else:
        top_c, bot_c = (245, 245, 245), (220, 220, 220)

    base = Image.new('RGB', (w, h), top_c)
    draw = ImageDraw.Draw(base)
    for y in range(h):
        f = y / h
        r = int(top_c[0] * (1 - f) + bot_c[0] * f)
        g = int(top_c[1] * (1 - f) + bot_c[1] * f)
        b = int(top_c[2] * (1 - f) + bot_c[2] * f)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Center soft ambient light
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.ellipse([w * 0.1, h * 0.15, w * 0.9, h * 0.85], fill=(255, 255, 255, 45 if theme != 'dark' else 15))
    overlay = overlay.filter(ImageFilter.GaussianBlur(90))
    base.paste(overlay, (0, 0), overlay)
    return base

def draw_pedestal(img, y_pos=750, rx=380, ry=65, is_dark=False):
    w, h = img.size
    shadow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.ellipse([w//2 - rx - 20, y_pos - ry + 20, w//2 + rx + 20, y_pos + ry + 35], fill=(0, 0, 0, 45 if not is_dark else 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(25))
    img.paste(shadow, (0, 0), shadow)

    draw = ImageDraw.Draw(img)
    p_color = (210, 206, 200) if not is_dark else (45, 45, 50)
    p_outline = (190, 185, 178) if not is_dark else (65, 65, 72)
    draw.ellipse([w//2 - rx, y_pos - ry, w//2 + rx, y_pos + ry], fill=p_color, outline=p_outline, width=1)

def add_luxury_card(img, brand, title, tag="ATELIER ARCHIVE", is_dark=False):
    w, h = img.size
    card_w, card_h = 440, 115
    cx1 = (w - card_w) // 2
    cy1 = h - 165
    cx2 = cx1 + card_w
    cy2 = cy1 + card_h

    card = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(card)
    bg_color = (15, 15, 18, 225) if not is_dark else (10, 10, 12, 235)
    border_color = (212, 175, 55, 190)
    c_draw.rounded_rectangle([cx1, cy1, cx2, cy2], radius=16, fill=bg_color, outline=border_color, width=1)
    img.paste(card, (0, 0), card)

    draw = ImageDraw.Draw(img)
    draw.text((w // 2, cy1 + 24), brand.upper(), fill=(235, 200, 100), anchor="mm")
    draw.text((w // 2, cy1 + 58), title, fill=(255, 255, 255), anchor="mm")
    draw.text((w // 2, cy1 + 88), tag, fill=(160, 160, 165), anchor="mm")

def draw_luxury_silhouette(img, item_type='bag', primary_color=(40, 40, 45), accent_color=(212, 175, 55)):
    """Draws a stylized, high-aesthetic luxury item silhouette on the pedestal."""
    w, h = img.size
    cx, cy = w // 2, 530
    draw = ImageDraw.Draw(img)

    if item_type == 'bag':
        # Main bag body
        bx1, by1, bx2, by2 = cx - 210, cy - 130, cx + 210, cy + 170
        draw.rounded_rectangle([bx1, by1, bx2, by2], radius=24, fill=primary_color, outline=accent_color, width=3)
        # Quilted / flap lines
        draw.arc([bx1 + 10, by1 + 10, bx2 - 10, by1 + 160], start=0, end=180, fill=accent_color, width=2)
        # Lock clasp in center
        draw.rounded_rectangle([cx - 28, by1 + 130, cx + 28, by1 + 175], radius=6, fill=accent_color, outline=(255, 230, 130), width=2)
        # Chain handle
        draw.arc([cx - 140, cy - 290, cx + 140, cy - 110], start=180, end=360, fill=accent_color, width=5)

    elif item_type == 'trench' or item_type == 'apparel':
        # Coat / Jacket silhouette
        points = [
            (cx - 70, cy - 230),  # Collar L
            (cx - 210, cy - 140), # Shoulder L
            (cx - 230, cy + 120), # Sleeve L
            (cx - 170, cy + 120), # Inner sleeve L
            (cx - 150, cy + 20),  # Underarm L
            (cx - 180, cy + 200), # Bottom hem L
            (cx + 180, cy + 200), # Bottom hem R
            (cx + 150, cy + 20),  # Underarm R
            (cx + 170, cy + 120), # Inner sleeve R
            (cx + 230, cy + 120), # Sleeve R
            (cx + 210, cy - 140), # Shoulder R
            (cx + 70, cy - 230),  # Collar R
        ]
        draw.polygon(points, fill=primary_color, outline=accent_color)
        # Double breasted buttons
        for by in [cy - 80, cy - 20, cy + 40, cy + 100]:
            draw.ellipse([cx - 45, by - 8, cx - 29, by + 8], fill=accent_color)
            draw.ellipse([cx + 29, by - 8, cx + 45, by + 8], fill=accent_color)
        # Belt
        draw.rounded_rectangle([cx - 165, cy + 50, cx + 165, cy + 80], radius=4, fill=(primary_color[0]+20, primary_color[1]+20, primary_color[2]+20), outline=accent_color, width=2)
        draw.rectangle([cx - 25, cy + 45, cx + 25, cy + 85], outline=accent_color, width=3)

    elif item_type == 'shoes' or item_type == 'sneakers':
        # Luxury sneaker / shoe silhouette
        sx1, sy1 = cx - 220, cy - 20
        points = [
            (sx1 + 40, sy1 - 100), # Ankle collar
            (sx1 + 100, sy1 - 90),
            (sx1 + 190, sy1 - 10), # Instep
            (sx1 + 330, sy1 + 40), # Toe curve top
            (sx1 + 380, sy1 + 90), # Toe tip
            (sx1 + 370, sy1 + 130),# Outsole front
            (sx1 + 20, sy1 + 130), # Outsole rear
            (sx1, sy1 + 50),       # Heel rear
            (sx1 + 10, sy1 - 60),  # Heel collar
        ]
        draw.polygon(points, fill=primary_color, outline=accent_color)
        # Outsole layer
        draw.rounded_rectangle([sx1 + 15, sy1 + 115, sx1 + 375, sy1 + 150], radius=10, fill=(245, 245, 248), outline=accent_color, width=2)
        # Iconic stripe / accent
        draw.arc([sx1 + 120, sy1, sx1 + 280, sy1 + 100], start=210, end=350, fill=accent_color, width=6)

    elif item_type == 'watch':
        # Watch case and bezel
        draw.ellipse([cx - 140, cy - 140, cx + 140, cy + 140], fill=(25, 25, 28), outline=accent_color, width=6)
        # Dial face
        draw.ellipse([cx - 105, cy - 105, cx + 105, cy + 105], fill=(12, 12, 14), outline=(70, 70, 75), width=2)
        # Hour markers
        for angle in range(0, 360, 30):
            import math
            rad = math.radians(angle)
            mx = int(cx + 85 * math.cos(rad))
            my = int(cy + 85 * math.sin(rad))
            draw.ellipse([mx - 4, my - 4, mx + 4, my + 4], fill=accent_color)
        # Hands (10:10 luxury watch classic pose)
        draw.line([(cx, cy), (cx - 45, cy - 50)], fill=(255, 255, 255), width=5)
        draw.line([(cx, cy), (cx + 55, cy - 40)], fill=(255, 255, 255), width=4)
        draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=accent_color)
        # Bracelet straps (top & bottom)
        draw.rectangle([cx - 65, cy - 240, cx + 65, cy - 140], fill=(50, 50, 55), outline=accent_color, width=2)
        draw.rectangle([cx - 65, cy + 140, cx + 65, cy + 240], fill=(50, 50, 55), outline=accent_color, width=2)

    elif item_type == 'kids_backpack':
        # Cute rounded luxury kids backpack
        bx1, by1, bx2, by2 = cx - 180, cy - 150, cx + 180, cy + 160
        draw.rounded_rectangle([bx1, by1, bx2, by2], radius=60, fill=primary_color, outline=accent_color, width=3)
        # Front pocket
        draw.rounded_rectangle([bx1 + 35, cy, bx2 - 35, by2 - 20], radius=30, fill=(primary_color[0]+25, primary_color[1]+25, primary_color[2]+25), outline=accent_color, width=2)
        # Cute bear ear tabs or top handle
        draw.arc([cx - 60, by1 - 70, cx + 60, by1 + 20], start=180, end=360, fill=accent_color, width=5)
        draw.ellipse([cx - 150, by1 - 35, cx - 90, by1 + 25], fill=primary_color, outline=accent_color, width=3)
        draw.ellipse([cx + 90, by1 - 35, cx + 150, by1 + 25], fill=primary_color, outline=accent_color, width=3)

    elif item_type == 'kids_dress':
        # Little luxury pleated dress
        draw.polygon([
            (cx - 50, cy - 200), (cx - 120, cy - 130), (cx - 70, cy - 60),
            (cx - 190, cy + 180), (cx + 190, cy + 180),
            (cx + 70, cy - 60), (cx + 120, cy - 130), (cx + 50, cy - 200)
        ], fill=primary_color, outline=accent_color, width=2)
        # Peter pan collar
        draw.ellipse([cx - 75, cy - 215, cx - 10, cy - 165], fill=(255, 255, 255), outline=accent_color, width=2)
        draw.ellipse([cx + 10, cy - 215, cx + 75, cy - 165], fill=(255, 255, 255), outline=accent_color, width=2)
        # Bow ribbon
        draw.polygon([(cx - 20, cy - 165), (cx + 20, cy - 165), (cx, cy - 150)], fill=accent_color)

    elif item_type == 'puffer':
        # Glossy puffer jacket silhouette
        draw.rounded_rectangle([cx - 190, cy - 180, cx + 190, cy + 180], radius=40, fill=primary_color, outline=accent_color, width=3)
        # Horizontal baffle stitchings
        for y_stitch in [cy - 100, cy - 20, cy + 60, cy + 140]:
            draw.line([(cx - 180, y_stitch), (cx + 180, y_stitch)], fill=(accent_color[0], accent_color[1], accent_color[2], 180), width=3)
        # Arm patch emblem
        draw.ellipse([cx - 165, cy - 80, cx - 125, cy - 40], fill=(245, 245, 250), outline=(200, 30, 40), width=2)

def generate_tile_from_real_or_vector(source_path, target_path, brand, title, item_type, theme='warm'):
    canvas = create_studio_canvas(1000, 1000, theme)
    is_dark = (theme == 'dark')
    draw_pedestal(canvas, y_pos=740, rx=370, ry=65, is_dark=is_dark)

    if source_path and os.path.exists(source_path):
        src = Image.open(source_path).convert('RGBA')
        src.thumbnail((680, 680), Image.Resampling.LANCZOS)
        pos_x = (1000 - src.width) // 2
        pos_y = 700 - src.height
        # Drop shadow
        sh = Image.new('RGBA', (1000, 1000), (0, 0, 0, 0))
        sh_draw = ImageDraw.Draw(sh)
        sh_draw.ellipse([pos_x + 30, 690, pos_x + src.width - 30, 740], fill=(0, 0, 0, 60))
        sh = sh.filter(ImageFilter.GaussianBlur(16))
        canvas.paste(sh, (0, 0), sh)
        canvas.paste(src, (pos_x, pos_y), src)
    else:
        # Fallback to luxury stylized silhouette vector render
        p_col = (20, 20, 25) if not is_dark else (40, 42, 48)
        if 'burberry' in title.lower() or 'trench' in title.lower():
            p_col = (195, 160, 115) # Honey beige
        elif 'moncler' in title.lower():
            p_col = (15, 25, 45) # Lacquered Navy
        elif 'kids' in title.lower():
            p_col = (45, 55, 75)
        draw_luxury_silhouette(canvas, item_type=item_type, primary_color=p_col, accent_color=(212, 175, 55))

    add_luxury_card(canvas, brand, title, is_dark=is_dark)
    canvas.save(target_path, quality=92)
    print(f"Generated tile: {target_path}")

# Run generation
os.makedirs('frontend/public/assets/categories', exist_ok=True)
os.makedirs('frontend/public/assets/products/kids', exist_ok=True)

# 1. Category Tiles (9 items)
tiles_spec = [
    # 여성 (Women)
    ('frontend/public/assets/products/bags/chanel_classic_flap.jpg', 'frontend/public/assets/categories/women_bag_tile.jpg', 'CHANEL', '아이코닉 플랩백', 'bag', 'warm'),
    ('frontend/public/assets/products/shoes/prada_monolith_loafer.jpg', 'frontend/public/assets/categories/women_shoes_tile.jpg', 'PRADA', '슬링백 & 슈즈', 'shoes', 'warm'),
    ('frontend/public/assets/categories/jewelry_tile.jpg', 'frontend/public/assets/categories/women_jewelry_tile.jpg', 'VAN CLEEF & ARPELS', '파인 주얼리 & 링', 'jewelry', 'warm'),
    # 남성 (Men)
    ('frontend/public/assets/categories/apparel_tile.jpg', 'frontend/public/assets/categories/men_apparel_tile.jpg', 'STONE ISLAND', '밀리터리 테크웨어', 'apparel', 'dark'),
    ('frontend/public/assets/products/watches/rolex_submariner.jpg', 'frontend/public/assets/categories/men_watch_tile.jpg', 'ROLEX', '마스터피스 워치', 'watch', 'dark'),
    ('frontend/public/assets/categories/sneaker_tile.jpg', 'frontend/public/assets/categories/men_sneakers_tile.jpg', 'BALENCIAGA', '럭셔리 스니커즈', 'sneakers', 'dark'),
    # 아동 (Kids)
    (None, 'frontend/public/assets/categories/kids_apparel_tile.jpg', 'BURBERRY CHILDREN', '리틀 럭셔리 룩북', 'trench', 'kids'),
    (None, 'frontend/public/assets/categories/kids_bag_tile.jpg', 'GUCCI KIDS', '미니 백팩 & 토트', 'kids_backpack', 'kids'),
    (None, 'frontend/public/assets/categories/kids_shoes_tile.jpg', 'BABY DIOR', '베이비 & 주니어 슈즈', 'shoes', 'kids'),
]

for src, dst, brand, title, itype, th in tiles_spec:
    generate_tile_from_real_or_vector(src, dst, brand, title, itype, th)

# 2. Kids Products (12 items)
kids_spec = [
    ('gucci_kids_star_tote.jpg', '구찌 키즈', '키즈 GG 수프림 스타 토트백', 'bag', 'kids'),
    ('gucci_kids_ace_sneakers.jpg', '구찌 키즈', '키즈 에이스 GG 웹 스니커즈', 'shoes', 'kids'),
    ('gucci_kids_polo.jpg', '구찌 키즈', '키즈 웹 스트라이프 폴로셔츠', 'apparel', 'kids'),
    ('burberry_kids_trench.jpg', '버버리 칠드런', '칠드런 빈티지 체크 트렌치코트', 'trench', 'warm'),
    ('burberry_kids_backpack.jpg', '버버리 칠드런', '토마스 베어 체크 백팩', 'kids_backpack', 'warm'),
    ('burberry_kids_dress.jpg', '버버리 칠드런', '체크 플리츠 코튼 원피스', 'kids_dress', 'warm'),
    ('moncler_kids_down_jacket.jpg', '몽클레르 앙팡', '앙팡 바디 다운 패딩 네이비', 'puffer', 'dark'),
    ('moncler_kids_sweatpants.jpg', '몽클레르 앙팡', '키즈 펠트 로고 트랙 팬츠', 'apparel', 'kids'),
    ('baby_dior_b23_sneakers.jpg', '베이비 디올', '오블리크 B23 하이탑 슈즈', 'shoes', 'kids'),
    ('baby_dior_teddy_charm.jpg', '베이비 디올', '오블리크 테디베어 플러시 참', 'kids_backpack', 'kids'),
    ('fendi_kids_beltbag.jpg', '펜디 키즈', '키즈 FF 자카드 미니 벨트백', 'bag', 'warm'),
    ('fendi_kids_windbreaker.jpg', '펜디 키즈', '주니어 FF 올오버 윈드브레이커', 'puffer', 'warm')
]

for fname, brand, title, itype, th in kids_spec:
    dst = os.path.join('frontend/public/assets/products/kids', fname)
    generate_tile_from_real_or_vector(None, dst, brand, title, itype, th)

print("All 21 luxury assets successfully generated!")
