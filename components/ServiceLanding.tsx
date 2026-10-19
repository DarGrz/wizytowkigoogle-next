import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, ShieldCheck, MessageSquare, MapPin } from 'lucide-react';
import type { ContentPage } from '@/lib/types';
import { landingFor } from '@/lib/service-landings';
import { hasDatabase } from '@/lib/db';
import ReputationOrder from './ReputationOrder';
import OrderSection from './OrderSection';
import '../app/service-landing.css';
import aleoHero from '@/public/images/usuwanie-aleo.webp';
import firmHero from '@/public/images/usuwanie-firmy-z-google.webp';
import goworkHero from '@/public/images/usuwanie-gowork.webp';
import formHero from '@/public/images/usuwanie-opinii-formularz.webp';
import priceHero from '@/public/images/usuwanie-opinii-google-cena.webp';
import reviewsHero from '@/public/images/usuwanie-opinii-google.webp';
import panoramaHero from '@/public/images/usuwanie-panorama-firm.webp';
import profileHero from '@/public/images/usuwanie-wizytowki-google.webp';
import verificationHero from '@/public/images/weryfikacja-wizytowek-google.webp';
import suspensionHero from '@/public/images/odwieszanie-wizytowek-google.webp';
import guideHero from '@/public/images/jak-usunac-firme-z-google.webp';

const heroImages = {
  'usuwanie-aleo': aleoHero,
  'usuwanie-firmy-z-google': firmHero,
  'usuwanie-gowork': goworkHero,
  'usuwanie-opinii-formularz': formHero,
  'usuwanie-opinii-google-cena': priceHero,
  'usuwanie-opinii-google': reviewsHero,
  'usuwanie-panorama-firm': panoramaHero,
  'usuwanie-wizytowki-google': profileHero,
  'weryfikacja-wizytowek-google': verificationHero,
  'odwieszanie-wizytowek-google': suspensionHero,
  'jak-usunac-firme-z-google': guideHero,
  'usuwanie-opinii': reviewsHero,
};

export default function ServiceLanding({ page, landing, pages }: {
  page: ContentPage; landing: NonNullable<ReturnType<typeof landingFor>>; pages: ContentPage[];
}) {
  const support = ['weryfikacja', 'odwieszanie'].includes(page.service);
  const reviews = page.service === 'usuwanie-opinii';
  const portal = landing.selection?.source === 'portals';
  const related = landing.related.map(slug => pages.find(other => other.slug === slug)).filter((other): other is ContentPage => Boolean(other));
  const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wizytowkigoogle.pl').origin;
  const url = `${siteUrl}/${page.slug}`;
  if (!(landing.slug in heroImages)) throw new Error(`Brak grafiki hero: ${landing.slug}`);
  const hero = heroImages[landing.slug as keyof typeof heroImages];
  const schema = [
    { '@context': 'https://schema.org', '@type': 'Service', '@id': `${url}#service`, name: page.eyebrow, description: page.intro, url,
      provider: { '@type': 'Organization', name: 'wizytowkigoogle.pl', url: siteUrl }, areaServed: { '@type': 'Country', name: 'Polska' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: page.eyebrow, item: url },
    ] },
  ];
  return <main id="main" className={`service-landing${support ? '' : ' reputation-page'}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <div className="wrap breadcrumbs"><Link href="/">Strona główna</Link><span>/</span>{page.eyebrow}</div>
    <section className="wrap sl-hero">
      <div>
        <span className="pill">{support ? <MapPin size={16} /> : <ShieldCheck size={16} />}{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p className="sl-intro">{page.intro}</p>
        <div className="sl-actions"><a className="button dark" href="#zlecenie">{landing.cta}<ArrowUpRight size={21} /></a><a href="#zakres" className="text-link">Poznaj zakres usługi</a></div>
        <p className="sl-reassurance"><Check size={17} />{support ? 'Zakres i wycena ustalane przed startem.' : reviews ? 'Bezpłatna weryfikacja i wycena przed startem.' : 'Zakres i wycena widoczne przed decyzją.'}</p>
      </div>
      <div className="sl-art">
        <Image src={hero} alt={`Ilustracja usługi: ${page.eyebrow}`} priority sizes="(max-width: 800px) min(500px, 92vw), 45vw" />
        <div className="sl-art-note"><ShieldCheck size={23} /><span>Twoja firma.<br /><strong>Sprawa pod kontrolą.</strong></span></div>
      </div>
    </section>
    <div className="sl-benefit-band"><div className="wrap sl-benefits">
      <span><Check size={19} />{reviews ? 'Indywidualna wycena' : support ? 'Indywidualna ocena profilu' : 'Przejrzyste warunki'}</span>
      <span><Check size={19} />{portal ? 'Wyszukanie firmy po NIP' : 'Obsługa konkretnej sprawy'}</span>
      <span><Check size={19} />Poufna i bezpieczna pomoc</span>
    </div></div>
    <section className="wrap sl-content" id="zakres">
      <div className="sl-section-heading"><p className="eyebrow">Zrozum problem. Wybierz właściwy zakres.</p><h2>Konkretny plan dla Twojej firmy.</h2><p>Nie musisz poznawać procedur platform. Warto wiedzieć, co obejmuje usługa i na jakich warunkach zaczynamy.</p></div>
      <div className="sl-articles">{page.sections.map((section, index) => <article key={index}><span className="sl-number">{String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2><p>{section.text}</p></article>)}</div>
    </section>
    <section className="wrap sl-process" aria-labelledby="sl-process-title">
      <div><p className="eyebrow">Bez zbędnego komplikowania</p><h2 id="sl-process-title">Od problemu<br />do obsługi sprawy.</h2><a href="#zlecenie" className="button dark">{landing.cta}<ArrowUpRight size={20} /></a></div>
      <ol>{[
        ['Wskazujesz firmę i zakres', portal ? 'Zacznij od NIP. Po weryfikacji wybierzesz portale i zobaczysz ich ceny.' : 'Znajdź firmę lub wskaż profil i opisz, co wymaga naszej uwagi.'],
        ['Poznajesz warunki', reviews ? 'Potwierdzamy zakres i indywidualną wycenę przed rozpoczęciem pracy.' : support ? 'Ustalamy zakres pomocy i cenę przed rozpoczęciem współpracy.' : 'Sprawdzasz podsumowanie i cenę. Płatność za profil odbywa się przez PayU w formularzu.'],
        ['Realizacja zgłoszenia', 'Przystępujemy do formalnych działań i kontaktu z portalem. O wyniku informujemy bezpośrednio po zakończeniu prac.'],
      ].map(([title, text], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
    </section>
    {support ? <OrderSection service={page.service} /> : <ReputationOrder enabled={hasDatabase()} initialSelection={landing.selection} />}
    <section className="wrap faq-section sl-faq"><p className="eyebrow">Przed podjęciem decyzji</p><h2>Pytania o {reviews ? 'usuwanie opinii' : support ? 'obsługę wizytówki' : 'usuwanie profilu'}.</h2>{page.faq.map((faq, index) => <details className="faq" key={index}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</section>
    <section className="wrap sl-related"><p className="eyebrow">Dopasuj usługę do problemu</p><h2>Sprawdź także.</h2><div>{related.map(other => <Link key={other.slug} href={`/${other.slug}`}><MessageSquare size={23} /><h3>{other.eyebrow}</h3><span>Poznaj zakres <ArrowUpRight size={18} /></span></Link>)}</div><Link className="text-link" href="/ochrona-wizerunku.html">Wszystkie usługi ochrony wizerunku <ArrowUpRight size={18} /></Link></section>
  </main>;
}
