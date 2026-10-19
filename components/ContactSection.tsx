'use client';

import { Phone, Mail, Check, ShieldCheck, Sparkles, Clock, MessageSquare } from 'lucide-react';

export default function ContactSection() {
  return (
    <section className="order-section" id="kontakt">
      <span id="zlecenie" style={{ position: 'relative', top: '-90px', display: 'block', visibility: 'hidden' }} />
      <div className="wrap order-grid">
        <div className="order-story">
          <p className="eyebrow">Bezpośredni kontakt telefoniczny</p>
          <h2>
            Zadzwoń do nas.
            <br />
            Zadbamy o Twoją
            <br />
            wizytówkę<span className="accent">.</span>
          </h2>
          <p>
            Nie trać czasu na wypełnianie formularzy i oczekiwanie na odpowiedź. Zadzwoń do nas — podczas krótkiej rozmowy sprawdzimy profil Twojej firmy i odpowiemy na każde pytanie.
          </p>

          <ol className="steps">
            <li>
              <span>1</span>
              <div>
                <h3>Dzwonisz do nas</h3>
                <p>Przedstawiasz profil swojej firmy i mówisz, co wymaga naszej uwagi.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Bezpłatna analiza na żywo</h3>
                <p>Weryfikujemy wizytówkę w Google Maps lub portalu podczas rozmowy.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Konkretny plan działania</h3>
                <p>Poznajesz możliwe rozwiązania i jasne zasady współpracy. Bez zobowiązań.</p>
              </div>
            </li>
          </ol>

          <div className="hand-note">
            Jasno, szybko, po ludzku.<span>↗</span>
          </div>
        </div>

        <div className="order-form phone-lead-card">
          <div className="form-heading">
            <span className="pill mint">
              <Phone size={14} /> Szybka rozmowa
            </span>
            <span className="form-dot" title="Infolinia czynna" />
          </div>

          <h3>Zadzwoń i zapytaj o swoją firmę</h3>
          <p className="muted">
            Nasz doradca bezpłatnie przeanalizuje sytuację Twojej wizytówki i wskaże najszybszą drogę do rozwiązania problemu.
          </p>

          {/* Big Phone Badge */}
          <div className="contact-phone-cta-wrapper">
            <a
              href="tel:+48572275002"
              className="contact-phone-main-badge"
              aria-label="Zadzwoń teraz: 572 275 002"
            >
              <span className="phone-pulse-icon">
                <Phone size={26} />
              </span>
              <div className="phone-badge-text">
                <small>Kliknij, aby połączyć</small>
                <strong>572 275 002</strong>
              </div>
            </a>
            <span className="phone-availability-tag">
              <Clock size={14} /> Dostępni: poniedziałek – piątek w godz. 8:00 – 18:00
            </span>
          </div>

          {/* Key Advantages */}
          <div className="contact-card-perks">
            <div className="contact-perk-item">
              <Check size={18} className="perk-check" />
              <span>Bezpłatna weryfikacja profilu podczas rozmowy</span>
            </div>
            <div className="contact-perk-item">
              <Check size={18} className="perk-check" />
              <span>Bezpośredni kontakt z przydzielonym specjalistą</span>
            </div>
            <div className="contact-perk-item">
              <Check size={18} className="perk-check" />
              <span>Pełna dyskrecja i bezpieczeństwo Twoich danych</span>
            </div>
          </div>

          {/* Email fallback */}
          <div className="contact-alt-box">
            <Mail size={16} />
            <span>
              Wolisz napisać? Wyślij wiadomość na: <a href="mailto:kontakt@wizytowkigoogle.pl">kontakt@wizytowkigoogle.pl</a>
            </span>
          </div>

          <small className="form-safety">
            <ShieldCheck size={16} /> Legalne działania. Dedykowana obsługa wizytówek Google w całej Polsce.
          </small>
        </div>
      </div>
    </section>
  );
}
