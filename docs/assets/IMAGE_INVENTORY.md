# luxuryRental 상품 및 비주얼 이미지 인벤토리 (IMAGE_INVENTORY)

## 1. 개요

본 인벤토리는 `luxuryRental` 서비스 내 모든 명품 렌탈 및 구매 상품, 브랜드, 카테고리, 배너 영역에 적용된 비주얼 에셋의 전수 목록과 경로, 연결 상품 ID, 파일 규격을 관리합니다.

---

## 2. 카테고리별 이미지 에셋 매핑 목록

| 상품명 / 카테고리 | 브랜드 | 로컬 에셋 경로 | 연결 상품 ID | 포맷 / 규격 | 용도 및 상태 |
|:---|:---|:---|:---:|:---:|:---|
| **블랙 페이던트 Le 5 A 7 호보백** | 생로랑 | `/assets/products/bags/saint_laurent_le5a7.jpg` | ID 1 | JPG / 1024x1024 | 20대 여성 맞춤 추천 대표 이미지 |
| **블랙 르 시티 모토 스몰 숄더백** | 발렌시아가 | `/assets/products/bags/balenciaga_le_city.jpg` | ID 2 | JPG / 1024x1024 | 20대 여성 맞춤 추천 대표 이미지 |
| **블랙 캐비어 호보 미니 토트백** | 샤넬 | `/assets/products/bags/chanel_caviar_hobo.jpg` | ID 3 | JPG / 1024x1024 | 20대 여성 맞춤 추천 대표 이미지 |
| **블랙 클래식 플랩 흑장 체인백** | 샤넬 | `/assets/products/bags/chanel_classic_flap.jpg` | ID 4 | JPG / 1024x1024 | 20대 여성 맞춤 추천 대표 이미지 |
| **하트 로고 크루넥 남성 니트** | 아미 | `/assets/products/clothing/ami_heart_knit.jpg` | ID 8 | JPG / 1024x1024 | 20대 남성 맞춤 추천 대표 이미지 |
| **오이스터 서브마리너 블랙 데이트** | 롤렉스 | `/assets/products/watches/rolex_submariner.jpg` | ID 15 | JPG / 1024x1024 | 30대 남성 맞춤 추천 대표 이미지 |
| **버킨 25 토고 골드 하드웨어** | 에르메스 | `/assets/products/bags/hermes_birkin_25.jpg` | ID 17 | JPG / 1024x1024 | 40대 여성 맞춤 추천 대표 이미지 |
| **빈티지 알함브라 펜던트 옐로골드** | 반클리프 아펠 | `/assets/products/jewelry/vancleef_alhambra.jpg` | ID 20 | JPG / 1024x1024 | 40대 여성 맞춤 추천 대표 이미지 |
| **루이비통 M41526 모노그램 토트백** | 루이비통 | `/assets/products/bags/louisvuitton_speedy.jpg` | ID 22 | JPG / 1024x1024 | 루이비통 브랜드 탭 대표 상품 |

---

## 3. 디렉터리 아키텍처

```text
frontend/public/assets/
├── products/
│   ├── bags/           # 하이엔드 핸드백/숄더백/토트백 스튜디오 컷
│   ├── clothing/       # 명품 니트/자켓/웨어 룩북
│   ├── shoes/          # 명품 스니커즈/힐
│   ├── jewelry/        # 파인 주얼리/목걸이/브레이슬릿
│   ├── watches/        # 명품 타임피스/손목시계
│   └── wallets/        # 카드홀더/지갑
├── banners/            # 메인 기획전 및 회원가입 프로모션 배너
└── placeholders/       # 오프라인 및 에러 대응 Fallback SVG
```

