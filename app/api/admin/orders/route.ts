import { admin } from '@/lib/security';
import { rows } from '@/lib/db';
import { fail } from '@/lib/http';

export async function GET() {
  try {
    if (!(await admin())) return new Response(null, { status: 401 });

    const orders = await rows('SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000');
    const mail = await rows('SELECT status, COUNT(*) AS total FROM mail_outbox GROUP BY status');
    const traffic = await rows(
      'SELECT event, COUNT(*) AS total FROM analytics_events WHERE created_at > UTC_TIMESTAMP() - INTERVAL 30 DAY GROUP BY event'
    );
    const visits = await rows('SELECT * FROM visits ORDER BY id DESC LIMIT 2000');

    return Response.json(
      { orders, mail, traffic, visits },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return fail(e);
  }
}