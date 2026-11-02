-- M5-3B additive test-only transactional outbox. Do not run against operational databases.
-- Minimal event metadata only. No contact details, item descriptions, customer photos, or ERP credentials.
CREATE TABLE IF NOT EXISTS lr_demo_erp_outbox (
 event_id VARCHAR(40) NOT NULL PRIMARY KEY,
 audit_id BIGINT UNSIGNED NOT NULL,
 request_id VARCHAR(40) NOT NULL,
 actor_id VARCHAR(40) NOT NULL,
 kind ENUM('REPAIR','CONSIGNMENT') NOT NULL,
 from_status ENUM('SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED','CANCELED') NULL,
 to_status ENUM('SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED','CANCELED') NOT NULL,
 event_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
 state ENUM('PENDING','LEASED','DELIVERED','DEAD') NOT NULL DEFAULT 'PENDING',
 attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
 available_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 lease_token VARCHAR(40) NULL,
 lease_until DATETIME(3) NULL,
 delivered_at DATETIME(3) NULL,
 last_error_code VARCHAR(40) NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_demo_erp_outbox_audit(audit_id),
 KEY ix_demo_erp_outbox_due(state,available_at,audit_id),
 KEY ix_demo_erp_outbox_order(request_id,audit_id,state),
 CONSTRAINT fk_demo_erp_outbox_audit FOREIGN KEY(audit_id) REFERENCES lr_demo_service_audit(id),
 CONSTRAINT fk_demo_erp_outbox_request FOREIGN KEY(request_id) REFERENCES lr_demo_service_requests(id),
 CONSTRAINT fk_demo_erp_outbox_actor FOREIGN KEY(actor_id) REFERENCES lr_users(id),
 CONSTRAINT ck_demo_erp_outbox_version CHECK(event_version=1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
