-- M5-2C4-D1: isolated TEST editorial and rights-only media registry.
-- Do not run outside lr_test. This schema is NOT a commercial CMS or image upload system.
CREATE TABLE IF NOT EXISTS lr_demo_editorial_home (
 id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
 draft JSON NOT NULL,
 published JSON NOT NULL,
 revision INT UNSIGNED NOT NULL DEFAULT 1,
 published_revision INT UNSIGNED NOT NULL DEFAULT 1,
 updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 CONSTRAINT ck_lr_demo_editorial_singleton CHECK(id=1),
 CONSTRAINT ck_lr_demo_editorial_revision CHECK(revision>=published_revision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_demo_editorial_audit (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 actor_id VARCHAR(40) NOT NULL,
 action ENUM('DRAFT_EDIT','PUBLISH') NOT NULL,
 revision INT UNSIGNED NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 KEY ix_lr_demo_editorial_actor(actor_id,created_at),
 CONSTRAINT fk_lr_demo_editorial_audit_actor FOREIGN KEY(actor_id) REFERENCES lr_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_demo_product_media (
 id VARCHAR(40) NOT NULL PRIMARY KEY,
 product_id VARCHAR(40) NOT NULL,
 asset_url VARCHAR(2048) NOT NULL,
 alt VARCHAR(160) NOT NULL,
 sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
 rights_status ENUM('PENDING','APPROVED','REVOKED') NOT NULL DEFAULT 'PENDING',
 rights_evidence_ref VARCHAR(255) NULL,
 rights_reviewed_by VARCHAR(40) NULL,
 rights_reviewed_at DATETIME(3) NULL,
 UNIQUE KEY uq_lr_media_product_order(product_id,sort_order),
 KEY ix_lr_media_publish(product_id,rights_status,sort_order),
 CONSTRAINT fk_lr_media_product FOREIGN KEY(product_id) REFERENCES lr_products(id),
 CONSTRAINT fk_lr_media_reviewer FOREIGN KEY(rights_reviewed_by) REFERENCES lr_users(id),
 CONSTRAINT ck_lr_media_alt CHECK(CHAR_LENGTH(alt) BETWEEN 2 AND 160),
 CONSTRAINT ck_lr_media_review CHECK(rights_status<>'APPROVED' OR
 (rights_evidence_ref IS NOT NULL AND rights_reviewed_by IS NOT NULL AND rights_reviewed_at IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
