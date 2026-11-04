# [API 명세서] 약관 문서 및 회원 동의 감사 RESTful API

**작성일**: 2026-11-04  
**버전**: v3.0  
**베이스 URL**: `/api/v1/legal`  

---

## 1. 약관 문서 조회 API

### 1.1 전체 약관 목록 조회
- **엔드포인트**: `GET /api/v1/legal`
- **인증 필요 여부**: 불필요 (공개)
- **응답 (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "doc_type": "TERMS_OF_SERVICE",
      "title": "LUXURYRENTAL 서비스 이용약관",
      "short_title": "서비스 이용약관",
      "version": "v2.1",
      "effective_date": "2026년 1월 1일",
      "is_required": 1,
      "summary": "명품 렌트, 구매 및 위탁 판매 서비스 이용과 관련한 이용자와 회사의 권리, 의무 및 책임사항을 규정합니다.",
      "created_at": "2026-11-04 03:00:00"
    },
    {
      "id": 2,
      "doc_type": "PRIVACY_COLLECTION",
      "title": "개인정보 수집 및 이용 동의",
      "short_title": "개인정보 수집·이용 동의",
      "version": "v2.1",
      "effective_date": "2026년 1월 1일",
      "is_required": 1,
      "summary": "회원 식별, 고가 명품 렌탈 계약 체결, 배송 및 고객 상담을 위해 필요한 최소한의 개인정보를 수집·이용합니다.",
      "created_at": "2026-11-04 03:00:00"
    }
  ]
}
```

### 1.2 단일 약관 전문 조회
- **엔드포인트**: `GET /api/v1/legal/:docType`
- **인증 필요 여부**: 불필요 (공개)
- **응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "doc_type": "TERMS_OF_SERVICE",
    "title": "LUXURYRENTAL 서비스 이용약관",
    "version": "v2.1",
    "content": "제1조(목적)..."
  }
}
```
- **응답 (404 Not Found)**:
```json
{
  "success": false,
  "error": "요청하신 약관 문서(UNKNOWN_DOC)를 찾을 수 없습니다."
}
```

---

## 2. 회원 동의 감사(Audit) API

### 2.1 내 동의 이력 조회
- **엔드포인트**: `GET /api/v1/legal/user/consents`
- **인증 필요 여부**: 필요 (`Bearer <session_token>`)
- **응답 (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "doc_type": "MARKETING_CONSENT",
      "version": "v2.1",
      "agreed": 0,
      "ip_address": "127.0.0.1",
      "created_at": "2026-11-04 03:20:00"
    },
    {
      "id": 3,
      "doc_type": "MARKETING_CONSENT",
      "version": "v2.1",
      "agreed": 1,
      "ip_address": "127.0.0.1",
      "created_at": "2026-11-04 03:15:00"
    }
  ]
}
```

### 2.2 동의 상태 업데이트 (마케팅 동의 철회/재동의)
- **엔드포인트**: `PUT /api/v1/legal/user/consents`
- **인증 필요 여부**: 필요 (`Bearer <session_token>`)
- **요청 본문**:
```json
{
  "docType": "MARKETING_CONSENT",
  "agreed": false
}
```
- **응답 (200 OK)**:
```json
{
  "success": true,
  "message": "MARKETING_CONSENT 동의 상태가 성공적으로 변경되었습니다.",
  "consent": {
    "docType": "MARKETING_CONSENT",
    "agreed": false,
    "updatedAt": "2026-11-04T03:20:00.000Z"
  }
}
```

