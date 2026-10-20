import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, MapPin, Megaphone, Sparkles, Phone } from 'lucide-react';
import ServiceCards from '@/components/ServiceCards';
import ContactSection from '@/components/ContactSection';
import { services } from '@/lib/content';

export const dynamic = 'force-dynamic';

const homepageFaqs: [string, string][] = [
  [
    'Jak wygląda rozpoczęcie współpracy?',
    'Wystarczy do nas zadzwonić lub przesłać zapytanie. Bezpłatnie analizujemy profil i sytuację Twojej firmy w Google, a następnie przedstawiamy konkretne możliwości działania i wycenę.',
  ],
  [
    'W jakich obszarach wspieracie lokalne firmy?',
    'Kompleksowo dbamy o obecność w Google: od profesjonalnego pozycjonowania wizytówki w Mapach, przez skuteczne kampanie reklamowe Google Ads, aż po bieżące wsparcie techniczne i bezpieczeństwo profilu.',
  ],
  [
    'Jak długo trwa realizacja usługi pozycjonowania lub reklamy?',
    'Wstępną analizę wykonujemy zazwyczaj w ciągu 24–48 godzin. Kampanie Google Ads uruchamiamy natychmiast, a pierwsze efekty pozycjonowania w Mapach widoczne są zazwyczaj w ciągu kilku tygodni.',
  ],
  [
    'Czy muszę podawać hasło do konta Google?',
    'Nie. Nigdy nie prosimy o hasła ani wrażliwe dane logowania do Twojego konta prywatnego czy firmowego.',
  ],
  [
    'Czy wystawiacie faktury VAT?',
    'Tak. Za wszystkie świadczone usługi wystawiamy pełną fakturę VAT 23%.',
  ],
  [
    'Czy moje dane i treść zapytania są bezpieczne?',
    'Zdecydowanie tak. Każde zapytanie traktujemy z najwyższą poufnością. Twoje dane nie są przekazywane osobom trzecim ani wykorzystywane do celów marketingowych.',
  ],
];

export default async function Home() {
  const s = await services();

  return (
    <main id="main">
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="pill">Twoja firma. Lepiej widoczna.</span>
          <div className="hero-heading">
            <MapBadge className="mobile-badge" />
            <h1>
              Daj się znaleźć.
              <br />
              Zyskaj nowych
              <br />
              <span className="underlined">klientów.</span>
            </h1>
          </div>
          <p>
            Wszystko dla Twojej wizytówki Google.
            <br className="desktop-break" /> Pozycjonowanie, reklama i usuwanie opinii.
          </p>

          <div className="hero-pillars">
            <Link href="/pozycjonowanie-wizytowki-google.html" className="hero-pillar-item">
              <span className="pillar-icon-box lavender-box">
                <MapPin size={15} />
              </span>
              <strong>Pozycjonowanie wizytówki</strong>
            </Link>
            <Link href="/reklama-google-ads.html" className="hero-pillar-item">
              <span className="pillar-icon-box yellow-box">
                <Megaphone size={15} />
              </span>
              <strong>Reklama Google Ads</strong>
            </Link>
            <Link href="/ochrona-wizerunku.html" className="hero-pillar-item">
              <span className="pillar-icon-box mint-box">
                <ShieldCheck size={15} />
              </span>
              <strong>Usuwanie opinii</strong>
            </Link>
          </div>

          <div className="hero-actions">
            <div className="hero-main-cta">
              <a href="tel:+48572275002" className="hero-phone-badge-large" aria-label="Zadzwoń: 572 275 002">
                <span className="hero-phone-badge-icon">
                  <Phone size={22} />
                </span>
                <span className="hero-phone-badge-content">
                  <small>Zadzwoń i zapytaj</small>
                  <strong>572 275 002</strong>
                </span>
                <span className="hero-phone-badge-action" aria-hidden="true">
                  <span>Zadzwoń</span>
                  <ArrowUpRight size={18} />
                </span>
              </a>
              <a className="button primary hero-check-btn" data-open-gmb-search href="#kontakt">
                Sprawdź swoją wizytówkę <ArrowUpRight size={22} />
              </a>
            </div>
            <a className="text-link" href="#jak-to-dziala">
              Jak to działa?
            </a>
          </div>

          <div className="hero-trust">
            <ShieldCheck size={21} /> Jasne zasady. Kompleksowa obsługa wizytówki.
          </div>
        </div>

        <div className="hero-art">
          <Image
            src="/images/owners.webp"
            alt="Uśmiechnięci właściciele małej firmy"
            width={1200}
            height={1200}
            priority
          />
          <MapBadge className="desktop-badge" />
          <span className="floating-star">✦</span>
        </div>
      </section>

      <div className="promise">
        <span aria-hidden="true">✳</span>
        <p>
          Najpierw rozmowa i analiza.
          <br className="mobile-break" /> Potem konkretne efekty.
        </p>
        <span aria-hidden="true">↗</span>
      </div>

      <section className="services-section wrap" id="uslugi">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dobre rzeczy dla Twojej firmy</p>
            <h2>
              Czego potrzebuje
              <br />
              Twoja firma?
            </h2>
          </div>
          <p>
            Wybierz kierunek.
            <br />
            Resztę ustalimy razem.
          </p>
          <Sparkles className="section-spark" size={44} />
        </div>
        <ServiceCards items={s} />
      </section>

      <section className="why wrap" id="jak-to-dziala">
        <div className="why-title">
          <span className="pill mint">Bez zgadywania</span>
          <h2>
            Najpierw rozmowa.
            <br />
            Potem konkrety.
          </h2>
        </div>
        <div className="why-content">
          <p>
            Każda firma ma inną sytuację. Dlatego zanim zaczniemy, sprawdzamy profil, ustalamy zakres i przedstawiamy jasną wycenę.
          </p>
          <div className="why-points">
            <span>✓ Jasna wycena przed startem</span>
            <span>✓ Dedykowana opieka i dyskrecja</span>
            <span>✓ Pełna obsługa wizytówki Google</span>
          </div>
          <Link className="text-link" href="/pozycjonowanie-wizytowki-google.html">
            Poznaj pozycjonowanie wizytówki <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <ContactSection />

      <section className="faq-section wrap">
        <p className="eyebrow">Często zadawane pytania (FAQ)</p>
        <h2>Krótko i na temat.</h2>
        {homepageFaqs.map(([q, a]) => (
          <details className="faq" key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}

function MapBadge({ className }: { className: string }) {
  return (
    <div className={'map-float ' + className}>
      <span>
        <MapPin size={16} /> Twoja firma w Google
      </span>
      <div className="map-lines">
        <MapPin size={42} fill="#ffb5a0" />
      </div>
      <small>Bliżej Twoich klientów</small>
    </div>
  );
}
