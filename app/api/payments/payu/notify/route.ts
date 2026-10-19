import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { hasDatabase, pool } from '@/lib/db';
import { validPayuNotification } from '@/lib/payu';

const notificationSchema = z.object({
  order: z.object({
    orderId: z.string().min(1).max(64),
    extOrderId: z.string().min(1).max(30),
    totalAmount: z.string().regex(/^\d+$/),
    currencyCode: z.literal('PLN'),
    status: z.enum(['PENDING', 'WAITING_FOR_CONFIRMATION', 'COMPLETED', 'CANCELED']),
  }),
});

export async function POST(req: Request) {
  if (!hasDatabase()) return Response.json({ error: 'Baza danych nie jest skonfigurowana.' }, { status: 503 });
  const raw = await req.text();
  if (Buffer.byteLength(raw) > 20000) return new Response(null, { status: 413 });
  if (!validPayuNotification(raw, req.headers.get('openpayu-signature'))) return new Response(null, { status: 400 });

  let notification: z.infer<typeof notificationSchema>;
  try {
    notification = notificationSchema.parse(JSON.parse(raw));
  } catch {
    return new Response(null, { status: 400 });
  }

  const { order } = notification;
  const conn = await pool().getConnection();
  try {
    await conn.beginTransaction();
    const [data] = await conn.execute(
      'SELECT id,reference,email,price_cents,payment_status,payment_provider_order_id FROM orders WHERE reference=? FOR UPDATE',
      [order.extOrderId]
    );
    const saved = (data as { id: string; reference: string; email: string; price_cents: number | null; payment_status: string; payment_provider_order_id: string | null }[])[0];
    if (!saved) {
      await conn.rollback();
      return new Response(null, { status: 404 });
    }
    if (!['creating', 'pending', 'failed', 'paid', 'cancelled'].includes(saved.payment_status)) {
      await conn.rollback();
      return new Response(null, { status: 400 });
    }
    if (saved.price_cents === null || String(saved.price_cents) !== order.totalAmount) {
      await conn.rollback();
      console.error(`PayU notification amount mismatch for order ${saved.reference}`);
      return new Response(null, { status: 400 });
    }
    if (saved.payment_status === 'paid') {
      await conn.commit();
      return new Response(null, { status: 200 });
    }
    const nextStatus = order.status === 'COMPLETED'
      ? 'paid'
      : order.status === 'CANCELED' ? 'cancelled' : 'pending';
    if (saved.payment_provider_order_id && saved.payment_provider_order_id !== order.orderId) {
      await conn.rollback();
      console.error(`PayU order ID mismatch for order ${saved.reference}`);
      return new Response(null, { status: 400 });
    }
    if (saved.payment_status === 'paid' || saved.payment_status === 'cancelled' || saved.payment_status === nextStatus) {
      await conn.commit();
      return new Response(null, { status: 200 });
    }
    await conn.execute(
      'UPDATE orders SET payment_status=?,payment_provider_order_id=? WHERE id=?',
      [nextStatus, order.orderId, saved.id]
    );
    if (nextStatus === 'paid' || nextStatus === 'cancelled') {
      const message = nextStatus === 'paid' ? 'Płatność PayU została potwierdzona.' : 'Płatność PayU została anulowana.';
      await conn.execute('INSERT INTO order_history(order_id,status,message,actor) VALUES (?,?,?,?)', [saved.id, 'nowe', message, 'PayU']);
      if (nextStatus === 'paid') {
        await conn.execute('INSERT INTO mail_outbox(id,recipient,subject,body) VALUES (?,?,?,?)', [
          randomUUID(), saved.email, `Potwierdzenie płatności ${saved.reference}`,
          `Otrzymaliśmy płatność PayU za zgłoszenie ${saved.reference}. Skontaktujemy się w sprawie dalszych działań.`
        ]);
      }
    }
    await conn.commit();
    return new Response(null, { status: 200 });
  } catch (error) {
    await conn.rollback();
    console.error(error instanceof Error ? error.message : 'PayU notification processing failed');
    return new Response(null, { status: 503 });
  } finally {
    conn.release();
  }
}
