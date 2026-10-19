import { z } from 'zod';
import { body } from '@/lib/http';
import { sameOrigin } from '@/lib/security';
import { normalizeNip, validNip } from '@/lib/company';
import { searchGus } from '@/lib/gus';

export const runtime = 'nodejs';
const schema = z.object({ nip: z.string().max(20).transform(normalizeNip).refine(validNip) });
let windowStart = 0;
let requests = 0;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Nieprawidłowe źródło formularza.' }, { status: 403 });
  let input: unknown;
  try {
    input = await body(request);
  } catch {
    return Response.json({ error: 'Nieprawidłowe dane zapytania.' }, { status: 400 });
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return Response.json({ error: 'Podaj poprawny, 10-cyfrowy NIP firmy.' }, { status: 400 });
  if (!process.env.BIR_API_KEY || !process.env.BIR_API_URL) {
    console.error('GUS_NOT_CONFIGURED');
    return Response.json({ error: 'Wyszukiwarka GUS jest chwilowo niedostępna. Wpisz dane firmy ręcznie.' }, { status: 503 });
  }
  if (Date.now() - windowStart >= 60000) {
    windowStart = Date.now();
    requests = 0;
  }
  if (++requests > 40) return Response.json({ error: 'Limit wyszukiwań GUS. Spróbuj ponownie za minutę.' }, { status: 429, headers: { 'Retry-After': '60' } });
  try {
    const results = await searchGus(parsed.data.nip);
    return Response.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    console.error('GUS_LOOKUP_FAILED');
    return Response.json({ error: 'Nie udało się pobrać danych z GUS. Spróbuj ponownie lub wpisz firmę ręcznie.' }, { status: 502 });
  }
}
