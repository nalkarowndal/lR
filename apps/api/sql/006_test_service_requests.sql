-- M5-3A: additive TEST ONLY workflow; never apply outside lr_test.
-- No actual item intake, pickup, repair contract, photos or consignment sales.
CREATE TABLE IF NOT EXISTS lr_demo_service_requests (
 id VARCHAR(40) PRIMARY KEY,
 owner_id VARCHAR(40) NOT NULL,
 kind ENUM('REPAIR','CONSIGNMENT') NOT NULL,
 idempotency_key VARCHAR(80) NOT NULL,
 input_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 item_name VARCHAR(120) NOT NULL,
 details VARCHAR(1000) NOT NULL,
 policy_version VARCHAR(30) NOT NULL DEFAULT 'demo-only',
 status ENUM('SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED','CANCELED') NOT NULL DEFAULT 'SUBMITTED',
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_demo_service_idempotency(owner_id,kind,idempotency_key),
 KEY ix_demo_service_owner_created(owner_id,created_at,id),
 KEY ix_demo_service_admin_status(status,created_at,id),
 CONSTRAINT fk_demo_service_owner FOREIGN KEY(owner_id) REFERENCES lr_users(id),
 CONSTRAINT ck_demo_service_policy CHECK(policy_version='demo-only')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lr_demo_service_audit (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 request_id VARCHAR(40) NOT NULL,
 actor_id VARCHAR(40) NOT NULL,
 from_status ENUM('SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED','CANCELED') NULL,
 to_status ENUM('SUBMITTED','UNDER_REVIEW','INFO_REQUESTED','DEMO_CLOSED','CANCELED') NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 KEY ix_demo_service_audit_request(request_id,id),
 CONSTRAINT fk_demo_service_audit_request FOREIGN KEY(request_id) REFERENCES lr_demo_service_requests(id),
 CONSTRAINT fk_demo_service_audit_actor FOREIGN KEY(actor_id) REFERENCES lr_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
