-- Additive, synthetic TEST database only (DB_NAME must equal lr_test).
-- Idempotency state is locked and written in the same transaction as its hold.
CREATE TABLE IF NOT EXISTS lr_hold_requests (
  actor_id VARCHAR(40) NOT NULL,
  idempotency_key VARCHAR(40) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  hold_id VARCHAR(40) NULL,
  state ENUM('PENDING','COMPLETED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY(actor_id,idempotency_key),
  UNIQUE KEY uq_hold_request_hold(hold_id),
  CONSTRAINT fk_hold_request_hold FOREIGN KEY(hold_id) REFERENCES lr_inventory_holds(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
