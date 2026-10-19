import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { formatPln } from './reputation-pricing';

const credentials = () => {
  const env = process.env.PAYU_ENV;
  if (env !== 'sandbox' && env !== 'production') throw new Error('PAYU_ENV must be sandbox or production');
  const posId = process.env.PAYU_POS_ID;
  const clientId = process.env.PAYU_CLIENT_ID;
  const clientSecret = process.env.PAYU_CLIENT_SECRET;
  const secondKey = process.env.PAYU_SECOND_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!posId || !clientId || !clientSecret || !secondKey || !siteUrl) throw new Error('PAYU_NOT_CONFIGURED');
  const origin = new URL(siteUrl);
  if (origin.protocol !== 'https:') {
    throw new Error('PAYU_SITE_URL_MUST_USE_HTTPS');
  }
  return {
    env, posId, clientId, clientSecret, secondKey,
    baseUrl: env === 'sandbox' ? 'https://secure.snd.payu.com' : 'https://secure.payu.com',
    siteUrl: origin.origin,
  };
};

export function hasPayuConfiguration() {
  try { credentials(); return true; } catch { return false; }
}

export async function createPayuPayment(input: {
  reference: string;
  description: string;
  totalCents: number;
  email: string;
  phone: string;
  company: string;
  accessToken: string;
  customerIp: string;
}) {
  const config = credentials();
  const tokenResponse = await fetch(`${config.baseUrl}/pl/standard/user/oauth/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!tokenResponse.ok) throw new Error(`PAYU_AUTH_HTTP_${tokenResponse.status}`);
  const access = z.object({ access_token: z.string().min(1) }).parse(await tokenResponse.json()).access_token;

  const amount = String(input.totalCents);
  const paymentResponse = await fetch(`${config.baseUrl}/api/v2_1/orders`, {
    method: 'POST',
    redirect: 'manual',
    headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      notifyUrl: `${config.siteUrl}/api/payments/payu/notify`,
      continueUrl: `${config.siteUrl}/status#${input.accessToken}`,
      customerIp: input.customerIp,
      merchantPosId: config.posId,
      description: input.description,
      currencyCode: 'PLN',
      totalAmount: amount,
      extOrderId: input.reference,
      buyer: { email: input.email, phone: input.phone, firstName: input.company.slice(0, 100), lastName: 'Klient', language: 'pl' },
      products: [{ name: input.description, unitPrice: amount, quantity: '1' }],
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  const raw = await paymentResponse.text();
  let data: unknown = {};
  if (raw) {
    try { data = JSON.parse(raw); } catch { if (paymentResponse.status !== 302) throw new Error('PAYU_INVALID_RESPONSE'); }
  }
  const parsed = z.object({ status: z.object({ statusCode: z.string().optional() }).optional(), redirectUri: z.string().url().optional(), orderId: z.string().min(1).optional() }).parse(data);
  const redirectUri = parsed.redirectUri || paymentResponse.headers.get('location') || '';
  if (![200, 201, 302].includes(paymentResponse.status) || (parsed.status?.statusCode && parsed.status.statusCode !== 'SUCCESS')) {
    throw new Error(`PAYU_ORDER_HTTP_${paymentResponse.status}`);
  }
  const checkout = new URL(redirectUri);
  if (checkout.protocol !== 'https:' || !checkout.hostname.endsWith('.payu.com')) throw new Error('PAYU_INVALID_CHECKOUT_URL');
  if (!parsed.orderId) throw new Error('PAYU_MISSING_ORDER_ID');
  return { orderId: parsed.orderId, redirectUri: checkout.toString() };
}

export function validPayuNotification(body: string, signature: string | null) {
  let secondKey: string;
  try { secondKey = credentials().secondKey; } catch { return false; }
  const supplied = signature?.match(/(?:^|;\s*)signature=([a-fA-F0-9]{32})(?:;|$)/)?.[1];
  if (!supplied) return false;
  const expected = createHash('md5').update(body + secondKey).digest();
  const actual = Buffer.from(supplied, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function payuEnvironment() {
  return credentials().env;
}

export function priceDescription(netCents: number, totalCents: number) {
  return `${formatPln(netCents)} netto (${formatPln(totalCents)} brutto)`;
}
