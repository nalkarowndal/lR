-- Explicit TEST database only. Never run against the original luxuryRental website DB.
CREATE TABLE IF NOT EXISTS lr_products (
 id VARCHAR(40) NOT NULL PRIMARY KEY,
 legacy_product_id BIGINT UNSIGNED NULL UNIQUE,
 title VARCHAR(255) NOT NULL,
 brand VARCHAR(120) NOT NULL,
 category VARCHAR(100) NOT NULL,
 condition_grade VARCHAR(12) NOT NULL,
 published TINYINT(1) NOT NULL DEFAULT 0,
 is_demo TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_product_offers (
 id VARCHAR(40) PRIMARY KEY,
 product_id VARCHAR(40) NOT NULL,
 channel ENUM('RENTAL','STORE') NOT NULL,
 day_rate_krw BIGINT UNSIGNED NULL,
 sale_price_krw BIGINT UNSIGNED NULL,
 deposit_krw BIGINT UNSIGNED NOT NULL DEFAULT 0,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 UNIQUE KEY uq_offer_channel(product_id,channel),
 CONSTRAINT fk_offer_product FOREIGN KEY(product_id) REFERENCES lr_products(id),
 CONSTRAINT ck_offer_price CHECK ((channel='RENTAL' AND day_rate_krw IS NOT NULL)
 OR (channel='STORE' AND sale_price_krw IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_inventory_units (
 id VARCHAR(40) PRIMARY KEY,
 product_id VARCHAR(40) NOT NULL,
 serial VARCHAR(100) NOT NULL UNIQUE,
 condition_grade VARCHAR(12) NOT NULL,
 physical_state ENUM('INTAKE','READY','SHIPPED','RETURNED_PENDING_INSPECTION','CLEANING','REPAIR','SOLD','RETIRED') NOT NULL DEFAULT 'INTAKE',
 KEY ix_unit_product_state(product_id,physical_state),
 CONSTRAINT fk_unit_product FOREIGN KEY(product_id) REFERENCES lr_products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_inventory_holds (
 id VARCHAR(40) PRIMARY KEY,
 unit_id VARCHAR(40) NOT NULL,
 kind ENUM('RENTAL','SALE') NOT NULL,
 blocked_start_date DATE NULL,
 blocked_end_exclusive DATE NULL,
 expires_at DATETIME(3) NOT NULL,
 status ENUM('ACTIVE','CONSUMED','RELEASED','EXPIRED') NOT NULL,
 checkout_id VARCHAR(40) NOT NULL,
 UNIQUE KEY uq_hold_unit_checkout(unit_id,checkout_id),
 KEY ix_hold_unit_blocked(unit_id,status,blocked_start_date,blocked_end_exclusive),
 CONSTRAINT fk_hold_unit FOREIGN KEY(unit_id) REFERENCES lr_inventory_units(id),
 CONSTRAINT ck_hold_date_order CHECK (
 (kind='RENTAL' AND blocked_start_date IS NOT NULL AND blocked_end_exclusive>blocked_start_date)
 OR (kind='SALE' AND blocked_start_date IS NULL AND blocked_end_exclusive IS NULL)
 )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_rentals (
 id VARCHAR(40) PRIMARY KEY,
 user_id VARCHAR(40) NOT NULL,
 product_id VARCHAR(40) NOT NULL,
 unit_id VARCHAR(40) NOT NULL,
 blocked_start_date DATE NOT NULL,
 blocked_end_exclusive DATE NOT NULL,
 status ENUM('PENDING_PAYMENT','CONFIRMED','PREPARING','SHIPPED','ACTIVE','RETURN_REQUESTED','RETURNED','INSPECTING','COMPLETED','CANCELED','REFUND_PENDING') NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 KEY ix_rental_unit_dates(unit_id,status,blocked_start_date,blocked_end_exclusive),
 CONSTRAINT fk_rental_unit FOREIGN KEY(unit_id) REFERENCES lr_inventory_units(id),
 CONSTRAINT fk_rental_product FOREIGN KEY(product_id) REFERENCES lr_products(id),
 CONSTRAINT ck_rental_dates CHECK(blocked_end_exclusive>blocked_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
