import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { defaultPages as pages } from '@/lib/service-landings';

export default function Footer() {
  return (
    <footer className="footer wrap">
      <div className="footer-contact">
        <div className="footer-contact-intro">
          <span className="pill yellow">
            <Phone size={13} /> Bezpośredni kontakt
          </span>
          <h3>Masz pytania dotyczące wizytówki lub profilu?</h3>
          <p>Zadzwoń lub napisz e-mail — bezpłatnie przeanalizujemy Twoją sprawę i doradzimy najlepsze rozwiązanie.</p>
        </div>

        <div className="footer-contact-actions">
          <a href="tel:+48527275002" className="footer-phone-btn" aria-label="Zadzwoń: 527 275 002">
            <span className="footer-icon-pulse">
              <Phone size={22} />
            </span>
            <div className="footer-phone-text">
              <small>Zadzwoń i zapytaj</small>
              <strong>527 275 002</strong>
            </div>
            <ArrowUpRight size={18} className="footer-arrow" />
          </a>

          <a href="mailto:kontakt@wizytowkigoogle.pl" className="footer-email-btn" aria-label="Napisz do nas: kontakt@wizytowkigoogle.pl">
            <span className="footer-mail-icon">
              <Mail size={20} />
            </span>
            <div className="footer-email-text">
              <small>Napisz do nas</small>
              <strong>kontakt@wizytowkigoogle.pl</strong>
            </div>
          </a>
        </div>
      </div>

      <div className="footer-top">
        <Link className="footer-brand" href="/" aria-label="wizytowkigoogle.pl — strona główna">
          <Image
            src="/images/wizytowkigoogle-logo-new.png"
            alt="wizytowkigoogle.pl"
            width={130}
            height={87}
            className="footer-logo"
          />
        </Link>
        <p>Widoczność, która pracuje na Twój biznes.</p>
        <a href="tel:+48527275002">tel. 527 275 002</a>
        <a href="mailto:kontakt@wizytowkigoogle.pl">kontakt@wizytowkigoogle.pl</a>
        <Link href="/polityka-prywatnosci">Prywatność</Link>
      </div>

      <details className="footer-links">
        <summary>Usługi i poradniki</summary>
        <div>
          {pages.map((p) => (
            <Link key={p.slug} href={'/' + p.slug}>
              {p.eyebrow}
            </Link>
          ))}
        </div>
      </details>

      <div className="footer-bottom">
        <span>© 2023–{new Date().getFullYear()} wizytowkigoogle.pl</span>
        <span>Niezależny serwis. Nie jesteśmy częścią Google.</span>
        <Link href="/admin">Panel obsługi</Link>
      </div>
    </footer>
  );
}
