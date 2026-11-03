-- M5-2C4-B: STORE channel receipt-only intake; no payment, stock hold or delivery.
-- Only in isolated lr_test, additive alongside rental portfolio intake.
CREATE TABLE IF NOT EXISTS lr_portfolio_store_orders (
 id VARCHAR(40) PRIMARY KEY,
 actor_id VARCHAR(40) NOT NULL,
 payment_method ENUM('CARD','TRANSFER','EASY_PAY') NOT NULL,
 delivery_method ENUM('COURIER','PICKUP') NOT NULL,
 delivery_preset ENUM('SAMPLE_SEOUL','SHOWROOM') NOT NULL,
 total_krw BIGINT UNSIGNED NOT NULL,
 status ENUM('RECEIVED') NOT NULL DEFAULT 'RECEIVED',
 payment_status ENUM('NOT_CHARGED') NOT NULL DEFAULT 'NOT_CHARGED',
 idempotency_key CHAR(36) NOT NULL,
 input_fingerprint CHAR(64) NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_lr_store_intent(actor_id,idempotency_key),
 KEY ix_lr_store_actor_created(actor_id,created_at,id),
 CONSTRAINT fk_lr_store_actor FOREIGN KEY(actor_id) REFERENCES lr_users(id),
 CONSTRAINT ck_lr_store_delivery CHECK (
  (delivery_method='COURIER' AND delivery_preset='SAMPLE_SEOUL') OR
  (delivery_method='PICKUP' AND delivery_preset='SHOWROOM')
 )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_portfolio_store_order_items (
 order_id VARCHAR(40) NOT NULL,
 product_id VARCHAR(40) NOT NULL,
 title_snapshot VARCHAR(255) NOT NULL,
 unit_price_krw BIGINT UNSIGNED NOT NULL,
 quantity TINYINT UNSIGNED NOT NULL DEFAULT 1,
 PRIMARY KEY(order_id,product_id),
 CONSTRAINT fk_lr_store_order_item FOREIGN KEY(order_id) REFERENCES lr_portfolio_store_orders(id),
 CONSTRAINT fk_lr_store_item_product FOREIGN KEY(product_id) REFERENCES lr_products(id),
 CONSTRAINT ck_lr_store_item_qty CHECK (quantity=1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
