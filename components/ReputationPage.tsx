import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Building2, Check, Globe2, MapPin, MessageSquareWarning, Phone, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import type { ContentPage } from '@/lib/types';
import ReputationOrder from './ReputationOrder';
import { hasDatabase } from '@/lib/db';
import ReputationMotion from './ReputationMotion';

const offer = [
  { icon: MapPin, color: 'lavender', label: 'Mapy Google', title: 'Usuwanie opinii Google', text: 'Spam, podszywanie się, konflikt interesów lub treści naruszające zasady? Analizujemy opinię, zbieramy uzasadnienie i przygotowujemy zgłoszenie.', tags: ['Analiza treści', 'Zgłoszenia i odwołania'] },
  { icon: MessageSquareWarning, color: 'peach', label: 'Portale z opiniami', title: 'Usuwanie opinii z portali', text: 'Pomagamy w sprawach wpisów na GoWork, Aleo i innych portalach. Sprawdzamy regulamin danego serwisu oraz podstawy do interwencji.', tags: ['Weryfikacja naruszeń', 'Kontakt z portalem'] },
  { icon: Building2, color: 'mint', label: 'Google i portale firmowe', title: 'Usuwanie wizytówek i profili', text: 'Duplikaty, nieaktualne dane lub profil utworzony bez Twojej wiedzy? Oceniamy możliwość korekty, połączenia lub usunięcia profilu zgodnie z zasadami platformy.', tags: ['Wizytówki Google', 'Profile firmowe'] },
  { icon: RotateCcw, color: 'yellow', label: 'Mapy Google', title: 'Resetowanie wizytówki', text: 'Sprawdzamy możliwość uporządkowania i ponownej konfiguracji profilu. Reset nie oznacza wyzerowania ocen ani usunięcia prawidłowych opinii.', tags: ['Ocena możliwości', 'Zgodność z zasadami'] },
];

export default function ReputationPage({ page }: { page: ContentPage }) {
  return <main id="main" className="reputation-page">
    <ReputationMotion />
    <div className="wrap breadcrumbs"><Link href="/">Strona główna</Link><span>/</span>Ochrona wizerunku</div>
    <section className="wrap rep-hero">
      <div className="rep-hero-copy">
        <span className="pill mint"><ShieldCheck size={16} /> Ochrona wizerunku w sieci</span>
        <h1>Dobra firma.<br />Dobre imię.<br /><span>Warto je chronić.</span></h1>
        <p>{page.intro}</p>
        <div className="rep-hero-actions">
          <a href="tel:+48527275002" className="hero-phone-badge-large" aria-label="Zadzwoń: 527 275 002">
            <span className="hero-phone-badge-icon">
              <Phone size={22} />
            </span>
            <span className="hero-phone-badge-content">
              <small>Zadzwoń i zapytaj • Bezpłatna diagnoza</small>
              <strong>527 275 002</strong>
            </span>
            <span className="hero-phone-badge-action" aria-hidden="true">
              <span>Zadzwoń</span>
              <ArrowUpRight size={18} />
            </span>
          </a>
          <a href="#zlecenie" className="button dark">Zgłoś swoją sprawę <ArrowUpRight size={21} /></a>
        </div>
        <div className="rep-assurance"><ShieldCheck size={18} /> Najpierw analiza. Potem jasne warunki.</div>
      </div>
      <div className="rep-hero-art">
        <span className="rep-art-caption"><span /> Twoja reputacja zasługuje na uwagę</span>
        <Image src="/images/ochronawizerunku-hero.webp" width={1280} height={853} priority alt="Właścicielka firmy przy tarczy chroniącej jej internetowe opinie" />
      </div>
    </section>
    <section className="rep-review-stat" aria-label="Jak opinie wpływają na wybór firmy">
      <div className="wrap" data-reveal>
        <strong className="rep-stat-number">85<span>%</span></strong>
        <div><p className="eyebrow">Opinie mają znaczenie</p><h2>Dobra opinia pomaga<br />podjąć decyzję.</h2><p>85% badanych deklaruje większą skłonność do skorzystania z firmy po przeczytaniu pozytywnych opinii.</p><a href="https://www.brightlocal.com/research/local-consumer-review-survey/" target="_blank" rel="noreferrer">Źródło: BrightLocal, Local Consumer Review Survey 2026 <ArrowUpRight size={13} /></a><small>Badanie 1002 dorosłych konsumentów w USA. Wynik nie jest statystyką rynku polskiego.</small></div>
      </div>
    </section>
    <section id="zakres-ochrony" className="wrap rep-section">
      <div className="rep-section-heading" data-reveal><div><p className="eyebrow">Konkretna pomoc. W konkretnym miejscu.</p><h2>Co możemy zrobić<br />dla Twojego wizerunku?</h2></div><p>Nie każda nieprzychylna treść podlega usunięciu. Dlatego zaczynamy od sprawdzenia faktów, a nie od obietnic.</p></div>
      <div className="rep-services">{offer.map((item, index) => <article key={item.title} className={`rep-service ${item.color}`} data-reveal>
        <div className="rep-card-top"><span className="rep-icon"><item.icon size={26} /></span><span>0{index + 1} / {item.label}</span></div>
        <h3>{item.title}</h3><p>{item.text}</p>
        <ul>{item.tags.map((tag) => <li key={tag}><Check size={14} /> {tag}</li>)}</ul>
        <a href="#zlecenie" className="text-link">Zgłoś do analizy <ArrowUpRight size={19} /></a>
      </article>)}</div>
    </section>
    <section className="wrap rep-platforms" data-reveal>
      <span className="eyebrow">Jedna firma. Różne miejsca w sieci.</span>
      <div><Link href="/usuwanie-opinii-google"><MapPin size={20} /> Google Maps</Link><Link href="/usuwanie-gowork">GoWork <ArrowUpRight size={16} /></Link><Link href="/usuwanie-aleo">Aleo <ArrowUpRight size={16} /></Link><Link href="/usuwanie-panorama-firm">Panorama Firm <ArrowUpRight size={16} /></Link><Link href="/usuwanie-opinii"><Globe2 size={20} /> Inne portale</Link></div>
      <small>Działamy niezależnie od wymienionych platform. O usunięciu treści decyduje ich administrator.</small>
    </section>
    <section className="wrap rep-section rep-approach">
      <div className="rep-approach-intro" data-reveal><span className="pill yellow"><Sparkles size={16} /> Bez pustych obietnic</span><h2>Nie zamiatamy<br />problemu pod dywan.</h2><p>Porządkujemy fakty. Wskazujemy możliwe działania. Informujemy Cię o postępach i odpowiedzi serwisu.</p><a href="#zlecenie" className="button outline">Porozmawiajmy o sprawie <ArrowUpRight size={20} /></a></div>
      <div className="rep-principles">{page.sections.map((section, index) => <article key={section.title} data-reveal><span>0{index + 1}</span><div><h3>{section.title}</h3><p>{section.text}</p></div></article>)}</div>
    </section>
    <section className="rep-boundary" data-reveal><div className="wrap"><ShieldCheck size={42} /><div><h2>Chronimy reputację. Szanujemy fakty.</h2><p>Negatywna ocena sama w sobie nie jest podstawą do usunięcia. Nie obiecujemy kasowania rzetelnej krytyki ani „czystego konta”. Każde zgłoszenie musi mieć uzasadnienie w regulaminie lub przepisach.</p></div></div></section>
    <ReputationOrder enabled={hasDatabase()} />
    <section className="wrap faq-section">
      <p className="eyebrow">Jasne odpowiedzi</p><h2>Zanim zrobimy pierwszy krok.</h2>
      {[
        ...page.faq,
        { question: 'Czy usuwanie negatywnych opinii jest legalne?', answer: 'Tak. Wszystkie działania prowadzimy w oparciu o obowiązujące przepisy prawa, ochronę dóbr osobistych oraz regulaminy platform internetowych.' },
        { question: 'Jak działa formularz zgłoszenia?', answer: 'W oknie zgłoszenia wybierasz najpierw Mapy Google albo Strony z opiniami, a następnie opinię lub profil. Wizytówkę Google wyszukasz po nazwie i miejscowości. Dla stron z opiniami podajesz NIP, aby sprawdzić firmę i jej formę prawną.' },
        { question: 'Dlaczego proponujecie usunięcie całego profilu?', answer: 'Jeśli zgłaszasz profil w katalogu zewnętrznym (np. Aleo, Panorama Firm), a firma ma formę JDG lub spółki cywilnej, często najskuteczniejszym krokiem jest usunięcie całego profilu wraz z danymi. Możesz wybrać tę opcję lub skupić się na samych opiniach.' },
        { question: 'Czy zgłoszenie jest płatne?', answer: 'Wysłanie zapytania jest całkowicie bezpłatne. Wycenę oraz plan działania przedstawiamy po wstępnej analizie profilu.' },
        { question: 'Czy wystawiacie faktury VAT?', answer: 'Tak, za wszystkie wykonane usługi wystawiamy fakturę VAT.' },
      ].map((faq) => <details className="faq" key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}
    </section>
  </main>;
}
