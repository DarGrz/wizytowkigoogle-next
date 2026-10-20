import { z } from 'zod';
import { createHmac } from 'node:crypto';
import { hasDatabase, exec } from '@/lib/db';
import { sameOrigin, ipHash, rateLimit } from '@/lib/security';
import { body } from '@/lib/http';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  if (!hasDatabase()) return new Response(null, { status: 204 });

  try {
    const raw = await body(req);
    const d = z
      .object({
        consent: z.literal(true),
        session: z.string().min(1).max(120),
        event: z.enum(['page_view', 'form_start', 'order_created']),
        path: z.string().max(500),
        attribution: z.record(z.string().max(100), z.string().max(2000)),
        device: z.string().max(2000),
      })
      .parse(raw);

    const ip = ipHash(req);
    if (!(await rateLimit('event:' + ip.hash, 120, 60))) {
      return new Response(null, { status: 429 });
    }

    const secret = process.env.IP_HASH_SECRET || 'default-ip-hash-secret-2026';
    const hash = createHmac('sha256', secret).update(d.device).digest('hex');

    await exec(
      'INSERT INTO analytics_events(session_id,event,path,attribution,device_hash,ip_hash) VALUES (?,?,?,?,?,?)',
      [d.session, d.event, d.path, JSON.stringify(d.attribution), hash, ip.hash]
    );

    return new Response(null, { status: 204 });
  } catch (err) {
    // Return 204 so client tracking calls never fail in browser console
    return new Response(null, { status: 204 });
  }
}