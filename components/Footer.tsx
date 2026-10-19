import Link from 'next/link';
import Image from 'next/image';
import { defaultPages as pages } from '@/lib/service-landings';

export default function Footer() {
  return (
    <footer className="footer wrap">
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
        <Link href="/#kontakt">Kontakt</Link>
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
