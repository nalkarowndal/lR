-- M5-2C4A: per-account saved lists, only in isolated lr_test demo DB.
-- No real reservation, inventory changes, payment, addresses, or customer shipping data.
CREATE TABLE IF NOT EXISTS lr_user_wishlist (
 actor_id VARCHAR(40) NOT NULL,
 product_id VARCHAR(40) NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(actor_id,product_id),
 KEY ix_wishlist_actor_recent(actor_id,created_at,product_id),
 CONSTRAINT fk_wishlist_actor FOREIGN KEY(actor_id) REFERENCES lr_users(id),
 CONSTRAINT fk_wishlist_product FOREIGN KEY(product_id) REFERENCES lr_products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_user_cart (
 actor_id VARCHAR(40) NOT NULL,
 product_id VARCHAR(40) NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(actor_id,product_id),
 KEY ix_cart_actor_recent(actor_id,created_at,product_id),
 CONSTRAINT fk_cart_actor FOREIGN KEY(actor_id) REFERENCES lr_users(id),
 CONSTRAINT fk_cart_product FOREIGN KEY(product_id) REFERENCES lr_products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
