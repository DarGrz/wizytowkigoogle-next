import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, service, message, honeypot } = body;

    // Bot detection via honeypot field
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const cleanCompany = typeof company === 'string' ? company.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    const cleanName = (typeof name === 'string' && name.trim().length >= 2)
      ? name.trim()
      : (cleanCompany ? `Opiekun: ${cleanCompany}` : 'Zgłoszenie z wizytówki');

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Proszę podać poprawny adres e-mail.' }, { status: 400 });
    }

    // Require either phone or valid message
    const cleanMessage = (typeof message === 'string' && message.trim().length >= 3)
      ? message.trim()
      : `Zgłoszenie ze strony wizytowkigoogle.pl dot. firmy: ${cleanCompany || 'Niewskazana'}. Prośba o kontakt telefoniczny (${cleanPhone || 'brak telefonu'}) lub mailowy.`;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user || 'kontakt@wizytowkigoogle.pl';
    const to = process.env.CONTACT_EMAIL_TO || 'kontakt@wizytowkigoogle.pl';

    if (!host || !user || !pass) {
      console.warn('SMTP is not configured — contact form notification skipped');
      return NextResponse.json({ ok: true });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const subject = `Nowa wiadomość ze strony: ${cleanCompany ? cleanCompany + ' — ' : ''}${cleanName}`;
    const cleanService = typeof service === 'string' && service.trim() ? service.trim() : 'Ogólne zapytanie';
    const receivedAt = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 24px; background-color: #f8fafc; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0b192c; color: #ffffff; padding: 24px 32px; }
    .header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 6px 0 0; color: #94a3b8; font-size: 14px; }
    .content { padding: 32px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
    .value { font-size: 16px; color: #0f172a; font-weight: 500; }
    .message-box { background: #f1f5f9; padding: 20px; border-radius: 12px; border-left: 4px solid #ff7a59; margin-top: 12px; white-space: pre-wrap; font-size: 15px; color: #1e293b; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>Nowa wiadomość z formularza</h2>
      <p>Data otrzymania: ${receivedAt}</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Osoba kontaktowa</div>
        <div class="value">${cleanName}</div>
      </div>
      <div class="field">
        <div class="label">Adres e-mail</div>
        <div class="value"><a href="mailto:${cleanEmail}" style="color: #ff7a59; text-decoration: none;">${cleanEmail}</a></div>
      </div>
      <div class="field">
        <div class="label">Numer telefonu</div>
        <div class="value"><a href="tel:${cleanPhone.replace(/\s+/g, '')}" style="color: #0f172a; text-decoration: none;">${cleanPhone}</a></div>
      </div>
      <div class="field">
        <div class="label">Firma / Wizytówka Google</div>
        <div class="value">${cleanCompany}</div>
      </div>
      <div class="field">
        <div class="label">Interesujący temat / usługa</div>
        <div class="value"><strong>${cleanService}</strong></div>
      </div>
      <div class="field">
        <div class="label">Wiadomość</div>
        <div class="message-box">${cleanMessage}</div>
      </div>
    </div>
    <div class="footer">
      Wiadomość wysłana z formularza kontaktowego serwisu wizytowkigoogle.pl
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
Nowa wiadomość z formularza wizytowkigoogle.pl
Data: ${receivedAt}

Osoba: ${cleanName}
Email: ${cleanEmail}
Telefon: ${cleanPhone}
Firma / Wizytówka: ${cleanCompany}
Usługa: ${cleanService}

Wiadomość:
${cleanMessage}
    `.trim();

    await transporter.sendMail({
      from: `"Wizytówki Google" <${from}>`,
      to,
      replyTo: cleanEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    return NextResponse.json({ ok: true, message: 'Dziękujemy! Twoja wiadomość została wysłana.' });
  } catch (error: any) {
    console.error('Contact form email error:', error);
    return NextResponse.json(
      { error: 'Wystąpił problem podczas wysyłania wiadomości. Spróbuj ponownie lub zadzwoń bezpośrednio.' },
      { status: 500 }
    );
  }
}
