-- M5.2: TEST-ONLY synthetic payment state records. ONLY lr_test via migrate-test.ts guard.
-- Not a production orders/payments schema, never handles cards/real funds.
CREATE TABLE IF NOT EXISTS lr_demo_orders (
 id VARCHAR(40) PRIMARY KEY,
 actor_id VARCHAR(40) NOT NULL,
 hold_id VARCHAR(40) NOT NULL UNIQUE,
 unit_id VARCHAR(40) NOT NULL,
 rental_fee_krw BIGINT UNSIGNED NOT NULL,
 deposit_krw BIGINT UNSIGNED NOT NULL,
 payable_krw BIGINT UNSIGNED NOT NULL,
 policy_version VARCHAR(30) NOT NULL DEFAULT 'demo-only',
 status ENUM('PENDING_SIMULATION','SIMULATED_PAID','FAILED','CANCELED','REVIEW_REQUIRED') NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 CONSTRAINT fk_demo_order_hold FOREIGN KEY(hold_id) REFERENCES lr_inventory_holds(id),
 CONSTRAINT fk_demo_order_unit FOREIGN KEY(unit_id) REFERENCES lr_inventory_units(id),
 CONSTRAINT ck_demo_order_amount CHECK(payable_krw=rental_fee_krw+deposit_krw),
 CONSTRAINT ck_demo_only_policy CHECK(policy_version='demo-only')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_demo_payment_events (
 event_id VARCHAR(80) PRIMARY KEY,
 order_id VARCHAR(40) NOT NULL,
 provider_payment_id VARCHAR(80) NOT NULL,
 status ENUM('DONE','FAILED','CANCELED') NOT NULL,
 verified_amount_krw BIGINT UNSIGNED NOT NULL,
 result_status ENUM('SIMULATED_PAID','FAILED','CANCELED','REVIEW_REQUIRED') NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 KEY ix_demo_event_provider(provider_payment_id),
 CONSTRAINT fk_demo_payment_event_order FOREIGN KEY(order_id) REFERENCES lr_demo_orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_demo_payment_audit (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 order_id VARCHAR(40) NOT NULL,
 event_id VARCHAR(80) NULL,
 action ENUM('CREATED','SIMULATED_PAID','FAILED','CANCELED','REVIEW_REQUIRED') NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 KEY ix_demo_audit_order(order_id,id),
 CONSTRAINT fk_demo_payment_audit_order FOREIGN KEY(order_id) REFERENCES lr_demo_orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
