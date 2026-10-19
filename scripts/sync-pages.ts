import mysql from 'mysql2/promise';
import { defaultPages } from '../lib/service-landings';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Ustaw DATABASE_URL');
  const db = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    await db.beginTransaction();
    for (const page of defaultPages) {
      await db.execute('INSERT IGNORE INTO pages(slug,content) VALUES (?,?)', [page.slug, JSON.stringify(page)]);
    }
    const [saved] = await db.query<mysql.RowDataPacket[]>('SELECT slug FROM pages');
    const slugs = new Set(saved.map(page => page.slug));
    for (const page of defaultPages) {
      if (!slugs.has(page.slug)) throw new Error(`Brak podstrony: ${page.slug}`);
    }
    await db.commit();
    console.log(`Zweryfikowano ${defaultPages.length} podstron. Istniejące treści, zlecenia i konta pozostały bez zmian.`);
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}

main().catch(error => {
  console.error('Synchronizacja podstron nie powiodła się:', error instanceof Error && 'code' in error ? error.code : 'Sprawdź konfigurację i schemat bazy.');
  process.exitCode = 1;
});
