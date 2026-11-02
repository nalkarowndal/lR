-- M5-2B2B: additive, strictly isolated lr_test reconciliation journal.
-- A MATCHED inspection is NOT a confirmed payment or a rental.
CREATE TABLE IF NOT EXISTS lr_demo_toss_payment_claims (
  provider_payment_id VARCHAR(200) NOT NULL PRIMARY KEY,
  order_id VARCHAR(40) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY ix_demo_toss_claim_order(order_id),
  CONSTRAINT fk_demo_toss_claim_order FOREIGN KEY(order_id) REFERENCES lr_demo_orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lr_demo_toss_reconciliation (
  logical_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  order_id VARCHAR(40) NOT NULL,
  provider_payment_id VARCHAR(200) NOT NULL,
  reported_status VARCHAR(40) NOT NULL,
  last_decision ENUM('MATCHED','REVIEW_REQUIRED') NOT NULL,
  reason VARCHAR(64) NOT NULL,
  seen_count INT UNSIGNED NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_seen_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY ix_demo_toss_reconcile_order(order_id,provider_payment_id),
  CONSTRAINT fk_demo_toss_reconcile_order FOREIGN KEY(order_id) REFERENCES lr_demo_orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lr_demo_toss_reconcile_audit (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  logical_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  order_id VARCHAR(40) NOT NULL,
  decision ENUM('MATCHED','REVIEW_REQUIRED') NOT NULL,
  reason VARCHAR(64) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY ix_demo_toss_audit_order(order_id,id),
  CONSTRAINT fk_demo_toss_audit_logical FOREIGN KEY(logical_key) REFERENCES lr_demo_toss_reconciliation(logical_key),
  CONSTRAINT fk_demo_toss_audit_order FOREIGN KEY(order_id) REFERENCES lr_demo_orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
