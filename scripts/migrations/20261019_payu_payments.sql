ALTER TABLE orders
  ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'not_required',
  ADD COLUMN payment_provider_order_id VARCHAR(64) NULL,
  ADD COLUMN payment_redirect_url VARCHAR(2000) NULL,
  ADD INDEX payment_status (payment_status),
  ADD INDEX payment_provider_order_id (payment_provider_order_id);
