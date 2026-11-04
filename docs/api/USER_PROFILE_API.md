# luxuryRental 사용자 프로필 및 환경설정 REST API 명세서 (USER_PROFILE_API)

모든 `/api/v1/users/*` 엔드포인트는 `Authorization: Bearer <token>` 헤더를 필수로 요구합니다.

---

## 1. 내 프로필 및 종합 정보 조회

- **엔드포인트**: `GET /api/v1/users/me`
- **응답 본문**:
```json
{
  "success": true,
  "profile": {
    "id": 2,
    "email": "customer@luxuryrental.com",
    "name": "김명품",
    "role": "USER",
    "phone": "010-1234-5678",
    "avatar_url": "",
    "created_at": "2026-11-04 10:00:00",
    "settings": {
      "service_notifications": true,
      "marketing_notifications": false,
      "product_notifications": true,
      "reduce_animations": false,
      "theme": "light"
    },
    "stats": {
      "favorites_count": 3,
      "sell_requests_count": 1,
      "rentals_count": 0
    }
  }
}
```

---

## 2. 프로필 정보 수정

- **엔드포인트**: `PATCH /api/v1/users/me`
- **보안 검증**: `role` 필드는 입력되어도 무시되며, 오직 `name`, `phone`, `avatar_url`만 수정됩니다.
- **요청 본문**:
```json
{
  "name": "김럭셔리",
  "phone": "010-5555-6666",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

---

## 3. 비밀번호 변경

- **엔드포인트**: `PATCH /api/v1/users/me/password`
- **요청 본문**:
```json
{
  "currentPassword": "luxury1234!",
  "newPassword": "newLuxuryPassword2026!"
}
```
- **실패 응답 (현재 비밀번호 불일치 시)**: `HTTP 400 Bad Request`
```json
{
  "success": false,
  "error": "현재 비밀번호가 일치하지 않습니다."
}
```

---

## 4. 환경설정 조회 및 저장

- **조회 엔드포인트**: `GET /api/v1/users/me/settings`
- **수정 엔드포인트**: `PATCH /api/v1/users/me/settings`
- **요청 본문**:
```json
{
  "service_notifications": true,
  "marketing_notifications": true,
  "product_notifications": true,
  "reduce_animations": true,
  "theme": "light"
}
```

---

## 5. 위시리스트 (찜한 상품) 관리

- **목록 조회**: `GET /api/v1/users/me/favorites`
- **찜 추가**: `POST /api/v1/users/me/favorites/:productId`
- **찜 해제**: `DELETE /api/v1/users/me/favorites/:productId`

---

## 6. 내 판매 신청 내역 조회

- **엔드포인트**: `GET /api/v1/users/me/sell-requests`
- **응답 본문**:
```json
{
  "success": true,
  "sellRequests": [
    {
      "id": 1,
      "brand_name": "샤넬",
      "user_name": "김명품",
      "status": "접수완료",
      "created_at": "2026-11-04 10:30:00"
    }
  ]
}
```
