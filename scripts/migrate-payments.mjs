import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) throw new Error('Ustaw DATABASE_URL');
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const columns = await connection.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders'");
  const names = new Set(columns[0].map((column) => column.COLUMN_NAME));
  if (!names.has('payment_status')) await connection.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'not_required'");
  if (!names.has('payment_provider_order_id')) await connection.query('ALTER TABLE orders ADD COLUMN payment_provider_order_id VARCHAR(64) NULL');
  if (!names.has('payment_redirect_url')) await connection.query('ALTER TABLE orders ADD COLUMN payment_redirect_url VARCHAR(2000) NULL');
  if (!names.has('billing_name')) await connection.query('ALTER TABLE orders ADD COLUMN billing_name VARCHAR(200) NULL');
  if (!names.has('billing_nip')) await connection.query('ALTER TABLE orders ADD COLUMN billing_nip VARCHAR(10) NULL');
  if (!names.has('billing_address')) await connection.query('ALTER TABLE orders ADD COLUMN billing_address VARCHAR(500) NULL');
  const indexes = await connection.query("SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders'");
  const indexNames = new Set(indexes[0].map((index) => index.INDEX_NAME));
  if (!indexNames.has('payment_status')) await connection.query('ALTER TABLE orders ADD INDEX payment_status (payment_status)');
  if (!indexNames.has('payment_provider_order_id')) await connection.query('ALTER TABLE orders ADD INDEX payment_provider_order_id (payment_provider_order_id)');
  console.log('Pola PayU i danych do faktury gotowe. Istniejące zlecenia pozostały bez zmian.');
} finally {
  await connection.end();
}
