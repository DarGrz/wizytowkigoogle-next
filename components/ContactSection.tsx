'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Check, LoaderCircle, Mail, Phone, Send, ShieldCheck, Sparkles } from 'lucide-react';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [service, setService] = useState('Pozycjonowanie wizytówki Google');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Listen to search modal selection
  useEffect(() => {
    const handleSetBusiness = (e: Event) => {
      const customEvent = e as CustomEvent<{ company?: string; profileUrl?: string; website?: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.company) {
          setCompany(customEvent.detail.company);
        }
        if (customEvent.detail.profileUrl) {
          setMessage((prev) =>
            prev
              ? `${prev}\n\nWizytówka Google Maps: ${customEvent.detail.profileUrl}`
              : `Wizytówka Google Maps: ${customEvent.detail.profileUrl}`
          );
        }
      }
    };

    window.addEventListener('set-order-business', handleSetBusiness);

    // Also check session storage fallback
    try {
      const stored = sessionStorage.getItem('wg-selected-business');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.company) setCompany(parsed.company);
        if (parsed.profileUrl && !message) {
          setMessage(`Wizytówka Google Maps: ${parsed.profileUrl}`);
        }
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('set-order-business', handleSetBusiness);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setError(null);
    setBusy(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          service,
          message,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Nie udało się wysłać wiadomości.');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie lub zadzwoń.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="order-section" id="kontakt">
      <span id="zlecenie" style={{ position: 'relative', top: '-90px', display: 'block', visibility: 'hidden' }} />
      <div className="wrap order-grid">
        <div className="order-story">
          <p className="eyebrow">Porozmawiajmy o Twojej firmie</p>
          <h2>
            Napisz do nas.
            <br />
            Zadbamy o Twoją
            <br />
            wizytówkę<span className="accent">.</span>
          </h2>
          <p>
            Opisz w czym możemy Ci pomóc. Przeanalizujemy sytuację Twojej firmy i wrócimy z bezpłatną wyceną oraz konkretnym planem działania.
          </p>

          <ol className="steps">
            <li>
              <span>1</span>
              <div>
                <h3>Wypełniasz formularz</h3>
                <p>Podaj dane kontaktowe i opisz krótko, co wymaga naszej uwagi.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Bezpłatna analiza</h3>
                <p>Weryfikujemy profil w Google Maps lub portalu i dobieramy optymalne rozwiązanie.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Plan i konkretna wycena</h3>
                <p>Przedstawiamy jasne warunki współpracy. Decyzję podejmujesz na spokojnie.</p>
              </div>
            </li>
          </ol>

          <div style={{ marginTop: '35px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <a
              href="tel:+48527275002"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: 750,
                fontSize: '17px',
                color: 'var(--ink)',
              }}
            >
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--yellow)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Phone size={18} />
              </span>
              <span>
                Telefon: <strong>+48 527 275 002</strong>
              </span>
            </a>
            <a
              href="mailto:kontakt@wizytowkigoogle.pl"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: 750,
                fontSize: '17px',
                color: 'var(--ink)',
              }}
            >
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--mint)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mail size={18} />
              </span>
              <span>
                E-mail: <strong>kontakt@wizytowkigoogle.pl</strong>
              </span>
            </a>
          </div>

          <div className="hand-note">
            Jasno, szybko, po ludzku.<span>↗</span>
          </div>
        </div>

        <div className="order-form">
          <div className="form-heading">
            <h3>Napisz do nas</h3>
            <span className="form-dot" title="Formularz aktywny" />
          </div>
          <p className="muted">Wypełnij poniższe pola. Odpowiadamy zazwyczaj w ciągu 24–48h.</p>

          {success ? (
            <div className="success">
              <div className="success-icon">
                <Check size={38} color="#0f5132" strokeWidth={2.5} />
              </div>
              <h3>Wiadomość wysłana!</h3>
              <p>
                Dziękujemy za kontakt. Przeanalizujemy Twoje zapytanie i odpowiemy tak szybko, jak to możliwe.
              </p>
              <button
                type="button"
                className="button outline small"
                onClick={() => setSuccess(false)}
                style={{ marginTop: '20px' }}
              >
                Wyślij kolejną wiadomość
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="honeypot" aria-hidden="true">
                <input
                  type="text"
                  name="website_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label>
                  Imię i nazwisko / Osoba kontaktowa *
                  <input
                    type="text"
                    required
                    placeholder="np. Jan Kowalski"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Adres e-mail *
                  <input
                    type="email"
                    required
                    placeholder="np. jan@twojadomena.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Numer telefonu <span className="optional">(opcjonalnie)</span>
                  <input
                    type="tel"
                    placeholder="np. +48 527 275 002"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label>
                  Nazwa firmy lub link do wizytówki <span className="optional">(opcjonalnie)</span>
                  <input
                    type="text"
                    placeholder="np. Salon Urody Warszawa"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Czym możemy się zająć?
                <select value={service} onChange={(e) => setService(e.target.value)}>
                  <option value="Pozycjonowanie wizytówki Google">Pozycjonowanie wizytówki Google</option>
                  <option value="Reklama Google Ads">Reklama Google Ads</option>
                  <option value="Usuwanie nieprawdziwych opinii">Usuwanie nieprawdziwych opinii</option>
                  <option value="Usuwanie wizytówki / profilu z katalogu">Usuwanie wizytówki / profilu z katalogu</option>
                  <option value="Pomoc w weryfikacji / odwieszeniu wizytówki">Pomoc w weryfikacji / odwieszeniu wizytówki</option>
                  <option value="Inne zapytanie">Inne zapytanie</option>
                </select>
              </label>

              <label>
                Treść wiadomości *
                <textarea
                  rows={4}
                  required
                  placeholder="Opisz swoją sytuację, podaj szczegóły problemu lub wpisów, które wymagają weryfikacji..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>

              {error && <p className="error">{error}</p>}

              <button type="submit" className="button dark full" disabled={busy}>
                {busy ? (
                  <>
                    <LoaderCircle className="spin" size={20} /> Wysyłanie wiadomości…
                  </>
                ) : (
                  <>
                    Wyślij wiadomość <ArrowUpRight size={22} />
                  </>
                )}
              </button>

              <small className="form-safety">
                <ShieldCheck size={16} /> Bezpieczne połączenie. Odpowiadamy bezpośrednio na Twój adres e-mail.
              </small>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
