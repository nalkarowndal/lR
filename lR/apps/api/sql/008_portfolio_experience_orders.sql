-- M5-2C3: synthetic intake-only customer orders. Not a sale, payment, rental or booking.
-- Executable ONLY from the guarded lr_test migration script.
CREATE TABLE IF NOT EXISTS lr_portfolio_orders (
 id VARCHAR(40) PRIMARY KEY,
 actor_id VARCHAR(40) NOT NULL,
 product_id VARCHAR(40) NOT NULL,
 start_date DATE NOT NULL,
 return_date DATE NOT NULL,
 payment_method ENUM('CARD','TRANSFER','EASY_PAY') NOT NULL,
 delivery_method ENUM('COURIER','PICKUP') NOT NULL,
 delivery_preset ENUM('SAMPLE_SEOUL','SHOWROOM') NOT NULL,
 rental_fee_krw BIGINT UNSIGNED NOT NULL,
 deposit_krw BIGINT UNSIGNED NOT NULL,
 payable_krw BIGINT UNSIGNED NOT NULL,
 status ENUM('RECEIVED') NOT NULL DEFAULT 'RECEIVED',
 payment_status ENUM('NOT_CHARGED') NOT NULL DEFAULT 'NOT_CHARGED',
 idempotency_key CHAR(36) NOT NULL,
 input_fingerprint CHAR(64) NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_lr_portfolio_order_intent(actor_id,idempotency_key),
 KEY ix_lr_portfolio_order_actor(actor_id,created_at,id),
 CONSTRAINT fk_lr_portfolio_user FOREIGN KEY(actor_id) REFERENCES lr_users(id),
 CONSTRAINT fk_lr_portfolio_product FOREIGN KEY(product_id) REFERENCES lr_products(id),
 CONSTRAINT ck_lr_portfolio_amount CHECK(payable_krw=rental_fee_krw+deposit_krw),
 CONSTRAINT ck_lr_portfolio_dates CHECK(return_date>start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
