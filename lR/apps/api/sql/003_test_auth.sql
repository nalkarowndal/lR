-- Additive M3.3 auth tables. Migration scripts reject any database other than lr_test.
CREATE TABLE IF NOT EXISTS lr_users (
 id VARCHAR(40) NOT NULL PRIMARY KEY,
 email VARCHAR(255) NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_lr_users_email(email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_user_roles (
 user_id VARCHAR(40) NOT NULL,
 role ENUM('CUSTOMER','ADMIN') NOT NULL,
 PRIMARY KEY(user_id,role),
 CONSTRAINT fk_lr_role_user FOREIGN KEY(user_id) REFERENCES lr_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS lr_sessions (
 id VARCHAR(40) NOT NULL PRIMARY KEY,
 user_id VARCHAR(40) NOT NULL,
 token_hash CHAR(64) NOT NULL,
 expires_at DATETIME(3) NOT NULL,
 revoked_at DATETIME(3) NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_lr_session_hash(token_hash),
 KEY ix_lr_session_user(user_id,revoked_at),
 CONSTRAINT fk_lr_session_user FOREIGN KEY(user_id) REFERENCES lr_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
