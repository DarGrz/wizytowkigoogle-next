import { randomUUID, createHmac } from 'node:crypto';
import { pool, hasDatabase, rows } from '@/lib/db';
import { orderSchema } from '@/lib/validation';
import { body, fail } from '@/lib/http';
import { sameOrigin, ipHash, rateLimit, sha, trustedClientIp } from '@/lib/security';
import { hasPayuConfiguration, createPayuPayment, priceDescription } from '@/lib/payu';
import { isOutcomeService, reputationPortalsQuote, type ReviewPortal, type ReputationTarget } from '@/lib/reputation-pricing';
import { isEligiblePortalProfileCompany } from '@/lib/company';
import { searchGus } from '@/lib/gus';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: 'Nieprawidłowe źródło formularza.' }, { status: 403 });
  if (!hasDatabase()) return Response.json({ error: 'Formularz nie jest jeszcze uruchomiony. Wymaga podłączenia bazy danych.' }, { status: 503 });
  try {
    const parsed = orderSchema.safeParse(await body(req));
    if (!parsed.success) return Response.json({ error: 'Sprawdź wymagane pola i poprawność danych.' }, { status: 400 });
    const d = parsed.data;
    const ip = ipHash(req);
    if (!await rateLimit('order:' + ip.hash, 8, 600)) return Response.json({ error: 'Zbyt wiele zgłoszeń. Spróbuj za kilka minut.' }, { status: 429 });
    if (d.context === 'reputation' && d.businessSource === 'portals' && d.target === 'profile') {
      if (!d.registryCompany) {
        return Response.json({ error: 'Aby zgłosić usunięcie profilu na portalu, musimy potwierdzić firmę w GUS.' }, { status: 400 });
      }
      try {
        const registeredCompanies = await searchGus(d.registryCompany.nip);
        const verified = registeredCompanies.find((company) =>
          company.nip === d.registryCompany?.nip &&
          company.regon === d.registryCompany?.regon &&
          company.name === d.company
        );
        if (!verified) {
          return Response.json({ error: 'Nie udało się potwierdzić danych firmy w GUS. Sprawdź NIP i wybierz firmę ponownie.' }, { status: 422 });
        }
        if (!isEligiblePortalProfileCompany(verified)) {
          return Response.json({
            error: `Przykro nam — realizacja usunięcia profilu nie jest możliwa dla tej formy prawnej (${verified.legalFormLabel || 'według danych GUS'}). Obsługujemy wyłącznie JDG i spółki cywilne zarejestrowane w CEIDG.`,
          }, { status: 422 });
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : 'GUS profile eligibility check failed');
        return Response.json({ error: 'Nie udało się sprawdzić formy prawnej firmy w GUS. Spróbuj ponownie później.' }, { status: 503 });
      }
    }
    const secret = process.env.IP_HASH_SECRET;
    if (!secret) return Response.json({ error: 'Brak konfiguracji zabezpieczeń formularza.' }, { status: 503 });
    const accessToken = createHmac('sha256', secret).update('order:' + d.requestId).digest('hex');
    const existing = await rows<{ reference: string; payment_status: string; payment_redirect_url: string | null }>(
      'SELECT reference,payment_status,payment_redirect_url FROM orders WHERE request_id=?', [d.requestId]
    );
    if (existing.length) {
      const saved = existing[0];
      if (['creating', 'failed'].includes(saved.payment_status) && d.target === 'profile') {
        return Response.json({ error: `Zgłoszenie ${saved.reference} zapisano, ale płatność wymaga sprawdzenia. Skontaktuj się z nami i podaj numer sprawy.` }, { status: 409 });
      }
      if (saved.payment_status === 'cancelled' && d.target === 'profile') {
        return Response.json({ error: `Płatność za zgłoszenie ${saved.reference} została anulowana. Skontaktuj się z nami, aby kontynuować.` }, { status: 409 });
      }
      return Response.json({
        reference: saved.reference,
        accessToken,
        ...(saved.payment_status === 'pending' && saved.payment_redirect_url ? { checkoutUrl: saved.payment_redirect_url } : {}),
        ...(saved.payment_status === 'paid' ? { paymentStatus: 'paid' } : {}),
      });
    }

    const isReputation = d.context === 'reputation' && d.target && d.portal;
    const outcome = Boolean(isReputation && d.target === 'reviews' && isOutcomeService(d.service));
    const quote = isReputation
      ? reputationPortalsQuote(d.target as ReputationTarget, (d.portals?.length ? d.portals : [d.portal]) as ReviewPortal[])
      : null;
    const requiresPayment = Boolean(isReputation && d.target === 'profile');
    if (requiresPayment && !hasPayuConfiguration()) {
      return Response.json({ error: 'Płatności PayU nie są jeszcze skonfigurowane. Zgłoszenie nie zostało zapisane.' }, { status: 503 });
    }
    const customerIp = requiresPayment ? trustedClientIp(req) : null;
    if (requiresPayment && !customerIp) {
      return Response.json({ error: 'Płatność wymaga zaufanego reverse proxy przekazującego adres klienta. Zgłoszenie nie zostało zapisane.' }, { status: 503 });
    }

    const id = randomUUID();
    const reference = 'WG-' + new Date().toISOString().slice(0, 10).replaceAll('-', '') + '-' + id.slice(0, 8).toUpperCase();
    const statusLink = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/status#' + accessToken;
    const conn = await pool().getConnection();
    try {
      await conn.beginTransaction();
      const [prices] = await conn.execute('SELECT price_cents FROM services WHERE id=?', [d.service]);
      const catalogPrice = (prices as { price_cents: number | null }[])[0]?.price_cents ?? null;
      const price = quote ? quote.totalCents : catalogPrice;
      const paymentStatus = requiresPayment ? 'creating' : outcome ? 'after_result' : 'not_required';
      const attr = d.analyticsConsent ? JSON.stringify(d.attribution || {}) : null;
      await conn.execute(
        'INSERT INTO orders(id,reference,request_id,token_hash,service_id,company,email,phone,profile_url,keywords,description,billing_name,billing_nip,billing_address,price_cents,payment_status,attribution,ip_hash,raw_ip,user_agent,privacy_version,analytics_consent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [id, reference, d.requestId, sha(accessToken), d.service, d.company, d.email, d.phone, d.profileUrl, d.keywords, d.description, d.billingDetails?.name || null, d.billingDetails?.nip || null, d.billingDetails?.address || null, price, paymentStatus, attr, ip.hash, ip.raw, d.analyticsConsent ? (req.headers.get('user-agent') || '').slice(0, 512) : null, '2026-10-v1', d.analyticsConsent]
      );
      await conn.execute('INSERT INTO order_history(order_id,status,message,actor) VALUES (?,?,?,?)', [
        id, 'nowe', requiresPayment ? 'Zgłoszenie zapisane. Przygotowujemy bezpieczną płatność PayU.' : outcome ? 'Zgłoszenie zapisane. Rozliczenie nastąpi po osiągnięciu rezultatu.' : 'Zgłoszenie zapisane. Oczekuje na weryfikację.', 'system'
      ]);
      if (!requiresPayment) {
        const text = outcome
          ? `Dziękujemy za zgłoszenie ${reference}.\n\nZa usunięcie opinii rozliczamy się dopiero po osiągnięciu uzgodnionego rezultatu. Nie pobraliśmy płatności przy zgłoszeniu.\n\nStatus: ${statusLink}\nZachowaj ten link dla siebie.\n\nwizytowkigoogle.pl`
          : `Dziękujemy za zgłoszenie ${reference}.\n\nSprawdzimy możliwość realizacji i potwierdzimy warunki przed rozpoczęciem. Wysłanie formularza nie powoduje pobrania płatności.\n\nStatus: ${statusLink}\nZachowaj ten link dla siebie.\n\nwizytowkigoogle.pl`;
        await conn.execute('INSERT INTO mail_outbox(id,recipient,subject,body) VALUES (?,?,?,?)', [randomUUID(), d.email, `Przyjęliśmy zgłoszenie ${reference}`, text]);
        if (process.env.ADMIN_NOTIFY_EMAIL) {
          await conn.execute('INSERT INTO mail_outbox(id,recipient,subject,body) VALUES (?,?,?,?)', [randomUUID(), process.env.ADMIN_NOTIFY_EMAIL, `Nowe zgłoszenie ${reference}`, `Nowe zgłoszenie: ${d.company}. Szczegóły w panelu /admin.`]);
        }
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    if (requiresPayment && quote?.kind === 'payu') {
      try {
        const payment = await createPayuPayment({
          reference,
          description: quote.serviceName,
          totalCents: quote.totalCents,
          email: d.email,
          phone: d.phone,
          company: d.company,
          accessToken,
          customerIp: customerIp!,
        });
        const paymentConn = await pool().getConnection();
        try {
          await paymentConn.beginTransaction();
          await paymentConn.execute(
            'UPDATE orders SET payment_status=?,payment_provider_order_id=?,payment_redirect_url=? WHERE id=? AND payment_status=?',
            ['pending', payment.orderId, payment.redirectUri, id, 'creating']
          );
          await paymentConn.execute('INSERT INTO mail_outbox(id,recipient,subject,body) VALUES (?,?,?,?)', [
            randomUUID(), d.email, `Płatność za zgłoszenie ${reference}`,
            `Dziękujemy za zgłoszenie ${reference}.\n\nUsługa: ${quote.serviceName}\nCena: ${priceDescription(quote.netCents, quote.totalCents)}\n\nDokończ płatność w PayU: ${payment.redirectUri}\nStatus sprawy: ${statusLink}\n\nwizytowkigoogle.pl`
          ]);
          if (process.env.ADMIN_NOTIFY_EMAIL) {
            await paymentConn.execute('INSERT INTO mail_outbox(id,recipient,subject,body) VALUES (?,?,?,?)', [randomUUID(), process.env.ADMIN_NOTIFY_EMAIL, `Nowe zgłoszenie ${reference}`, `Nowe zgłoszenie: ${d.company}. Oczekuje na płatność PayU. Szczegóły w panelu /admin.`]);
          }
          await paymentConn.commit();
        } catch (error) {
          await paymentConn.rollback();
          throw error;
        } finally {
          paymentConn.release();
        }
        return Response.json({ reference, accessToken, checkoutUrl: payment.redirectUri }, { status: 201 });
      } catch (error) {
        console.error(error instanceof Error ? error.message : 'PayU payment creation failed');
        await pool().execute('UPDATE orders SET payment_status=? WHERE id=? AND payment_status=?', ['failed', id, 'creating']);
        return Response.json({ error: `Zgłoszenie ${reference} zapisano, ale nie udało się potwierdzić utworzenia płatności. Skontaktuj się z nami, podając numer sprawy.` }, { status: 502 });
      }
    }

    return Response.json({ reference, accessToken }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
