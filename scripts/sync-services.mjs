import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

if (!process.env.DATABASE_URL) throw new Error('Ustaw DATABASE_URL');
const catalog = JSON.parse(await readFile(new URL('../lib/order-services.json', import.meta.url), 'utf8'));
const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  for (const service of [...catalog.google, ...catalog.portals, ...catalog.legacy]) {
    await db.execute('INSERT IGNORE INTO services(id,name,content) VALUES (?,?,?)', [service.id, service.name, 'Wycena po weryfikacji']);
  }
  console.log('Usługi uzupełnione. Istniejące ceny, treści i konto administratora bez zmian.');
} finally {
  await db.end();
}
