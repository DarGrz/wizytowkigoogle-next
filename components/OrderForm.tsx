"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Check, ShieldCheck, LoaderCircle, MapPin } from 'lucide-react';
import { orderServices, portalServices, type BusinessSource, type OrderContext } from '@/lib/order-services';
import type { RegistryCompany } from '@/lib/company';
import BusinessLookup, { type BusinessSelection } from './BusinessLookup';
import { consent, track } from './Consent';
import type { ReputationTarget, ReviewPortal } from '@/lib/reputation-pricing';

export type OrderPreset = { source: BusinessSource; service: string; business: BusinessSelection; target?: ReputationTarget; portal?: ReviewPortal; portals?: ReviewPortal[] };

export default function OrderForm({ service = '', enabled = true, context = 'google', preset, onBusyChange, onComplete }: { service?: string; enabled?: boolean; context?: OrderContext; preset?: OrderPreset; onBusyChange?: (busy: boolean) => void; onComplete?: () => void }) {
  const initialSource = preset?.source || (portalServices.some((item) => item.id === service) ? 'portals' : 'google');
  const [source, setSource] = useState<BusinessSource>(initialSource);
  const [selectedService, setSelectedService] = useState(preset?.service || (service === 'ochrona-wizerunku' ? '' : service));
  const [registryCompany, setRegistryCompany] = useState<RegistryCompany | undefined>(preset?.business.registryCompany);
  const options = orderServices(context, source, service);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; accessToken: string; checkoutUrl?: string; paymentStatus?: string } | null>(null);
  const [company, setCompany] = useState(preset?.business.company || '');
  const [profileUrl, setProfileUrl] = useState(preset?.business.profileUrl || '');
  const [preselectedInfo, setPreselectedInfo] = useState<string | null>(null);
  const [billingEnabled, setBillingEnabled] = useState(Boolean(preset?.business.registryCompany));
  const [billingSource, setBillingSource] = useState<'registry' | 'other'>(preset?.business.registryCompany ? 'registry' : 'other');
  const [billingName, setBillingName] = useState(preset?.business.registryCompany?.name || '');
  const [billingNip, setBillingNip] = useState(preset?.business.registryCompany?.nip || '');
  const [billingAddress, setBillingAddress] = useState(preset?.business.registryCompany?.address || '');

  const request = useRef('');
  const started = useRef(false);

  useEffect(() => {
    if (preset) return;
    // Listen for pre-fill event from SearchBusinessModal
    const handleSetBusiness = (e: Event) => {
      const customEvent = e as CustomEvent<{ company?: string; profileUrl?: string; website?: string }>;
      if (customEvent.detail) {
        setSource('google');
        setRegistryCompany(undefined);
        setSelectedService((value) => portalServices.some((item) => item.id === value) ? '' : value);
        request.current = '';
        if (customEvent.detail.company) setCompany(customEvent.detail.company);
        if (customEvent.detail.profileUrl) setProfileUrl(customEvent.detail.profileUrl);
        setPreselectedInfo(customEvent.detail.company || 'Wizytówka Google');
      }
    };

    window.addEventListener('set-order-business', handleSetBusiness);

    // Also check sessionStorage on mount
    try {
      const saved = sessionStorage.getItem('wg-selected-business');
      if (saved && context === 'google') {
        const parsed = JSON.parse(saved);
        if (parsed.company) {
          setCompany(parsed.company);
          if (parsed.profileUrl) setProfileUrl(parsed.profileUrl);
          setPreselectedInfo(parsed.company);
        }
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('set-order-business', handleSetBusiness);
    };
  }, [context, preset]);

  function changeSource(next: BusinessSource) {
    if (next === source) return;
    setSource(next);
    setSelectedService('');
    setCompany('');
    setProfileUrl('');
    setRegistryCompany(undefined);
    setPreselectedInfo(null);
    setError('');
    request.current = '';
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    onBusyChange?.(true);
    const f = new FormData(e.currentTarget);
    request.current ||= crypto.randomUUID();

    try {
      const analyticsConsent = consent();
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: f.get('service'),
          context,
          businessSource: source,
          target: preset?.target,
          portal: preset?.portal,
          portals: preset?.portals,
          registryCompany,
          company: f.get('company'),
          email: f.get('email'),
          phone: f.get('phone'),
          profileUrl: f.get('profileUrl'),
          billingDetails: billingEnabled ? {
            name: billingName,
            nip: billingNip,
            address: billingAddress,
          } : null,
          keywords: f.get('keywords') || '',
          description: f.get('description'),
          website: f.get('website'),
          privacy: f.get('privacy') === 'on',
          requestId: request.current,
          analyticsConsent,
          attribution: analyticsConsent ? JSON.parse(sessionStorage.getItem('wg-attribution') || '{}') : {},
        }),
      });

      const data = await r.json();
      if (!r.ok) throw Error(data.error || 'Nie udało się zapisać zgłoszenia.');
      setResult(data);
      onComplete?.();
      if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
      track('order_created');
      try {
        sessionStorage.removeItem('wg-selected-business');
      } catch {
        // ignore
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd.');
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  if (result) {
    return (
      <div className="order-form success" role="status">
        <span className="success-icon">
          <Check size={40} />
        </span>
        <p className="eyebrow">Dziękujemy za zgłoszenie!</p>
        <h3>Zgłoszenie przyjęte</h3>
        <p>Numer Twojej sprawy:</p>
        <strong className="reference">{result.reference}</strong>
        <p style={{ marginTop: '14px', fontSize: '15px', lineHeight: '1.5' }}>
          Wkrótce skontaktuje się z Tobą przydzielony opiekun, aby omówić szczegóły i potwierdzić realizację.
        </p>
        <small style={{ marginTop: '14px', display: 'block' }}>Potwierdzenie wysłaliśmy także na Twój adres e-mail.</small>
      </div>
    );
  }

  return (
    <form
      className="order-form"
      onSubmit={submit}
      onChange={() => { request.current = ''; }}
      onFocus={() => {
        if (!started.current) {
          track('form_start');
          started.current = true;
        }
      }}
    >
      {!preset && <><div className="form-heading">
        <h3>{context === 'reputation' ? 'Zadbajmy o Twój wizerunek' : 'Zleć usługę'}</h3>
        <span className="form-dot" />
      </div>
      <p className="muted">Kilka informacji i możemy zacząć.</p></>}

      {preselectedInfo && (
        <div className="preselected-badge">
          <MapPin size={16} />
          <span>
            {registryCompany ? 'Firma z GUS: ' : 'Wizytówka Google: '}
            <strong>{preselectedInfo}</strong>
            {registryCompany && <small>NIP: {registryCompany.nip} · REGON: {registryCompany.regon}<br />{registryCompany.address}</small>}
          </span>
        </div>
      )}

      {!enabled && (
        <div className="notice">Podgląd projektu. Wysyłanie zgłoszeń będzie dostępne po podłączeniu bazy.</div>
      )}

      {!preset && context === 'reputation' && <fieldset className="source-picker">
        <legend>Gdzie potrzebujesz pomocy?</legend>
        <div>{([['google', 'Mapy Google'], ['portals', 'Portale z opiniami']] as const).map(([value, label]) => (
          <label key={value} className={source === value ? 'selected' : ''}>
            <input type="radio" name="businessSource" value={value} checked={source === value} onChange={() => changeSource(value)} />
            {label}
          </label>
        ))}</div>
      </fieldset>}

      {preset ? <input type="hidden" name="service" value={preset.service} /> : <label>
        Wybierz usługę
        <select name="service" required value={selectedService} onChange={(event) => setSelectedService(event.target.value)}>
          <option value="">Czego potrzebujesz?</option>
          {options.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>}

      {selectedService === 'resetowanie-wizytowki' && <p className="notice">Najpierw sprawdzamy możliwość uporządkowania lub ponownej konfiguracji profilu zgodnie z zasadami Google. Reset nie oznacza wyzerowania ocen ani gwarancji usunięcia opinii.</p>}

      {!preset && <BusinessLookup key={source} source={source} onSelect={(selection) => {
        setCompany(selection.company);
        setProfileUrl(selection.profileUrl);
        setRegistryCompany(selection.registryCompany);
        setPreselectedInfo(selection.company);
        request.current = '';
      }} />}

      <label>
        Nazwa firmy
        <input
          name="company"
          required
          minLength={2}
          maxLength={200}
          autoComplete="organization"
          value={company}
          readOnly={Boolean(preset)}
          onChange={(e) => { setCompany(e.target.value); setRegistryCompany(undefined); setPreselectedInfo(null); }}
          placeholder="Np. Kwiaciarnia Róża"
        />
      </label>

      {!(preset?.target === 'profile' && source === 'portals') && <label>
        {source === 'portals' ? 'Link do opinii lub profilu na portalu' : 'Link do wizytówki Google'} <span className="optional">opcjonalnie</span>
        <input
          name="profileUrl"
          type="url"
          maxLength={1500}
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          placeholder={source === 'portals' ? 'https://www.gowork.pl/...' : 'https://maps.google.com/...'}
        />
      </label>}
      {preset?.target === 'profile' && source === 'portals' && <input type="hidden" name="profileUrl" value="" />}

      <div className="form-row">
        <label>
          E-mail
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="jan@twojafirma.pl"
          />
        </label>
        <label>
          Telefon
          <input
            name="phone"
            type="tel"
            required
            minLength={7}
            maxLength={30}
            autoComplete="tel"
            placeholder="123 456 789"
          />
        </label>
      </div>

      <fieldset className="invoice-details">
        <legend>Dane do faktury</legend>
        <label className="checkbox">
          <input type="checkbox" checked={billingEnabled} onChange={(event) => setBillingEnabled(event.target.checked)} />
          <span>Podaję dane do faktury</span>
        </label>
        {billingEnabled && <>
          {registryCompany && <div className="billing-source">
            <label className="checkbox">
              <input type="radio" name="billingSource" checked={billingSource === 'registry'} onChange={() => {
                setBillingSource('registry');
                setBillingName(registryCompany.name);
                setBillingNip(registryCompany.nip);
                setBillingAddress(registryCompany.address);
              }} />
              <span>Użyj danych firmy znalezionej w GUS</span>
            </label>
            <label className="checkbox">
              <input type="radio" name="billingSource" checked={billingSource === 'other'} onChange={() => {
                setBillingSource('other');
                setBillingName('');
                setBillingNip('');
                setBillingAddress('');
              }} />
              <span>Wpisz inne dane do faktury</span>
            </label>
          </div>}
          {billingSource === 'registry' && registryCompany
            ? <p className="notice">{registryCompany.name}<br />NIP: {registryCompany.nip}<br />{registryCompany.address}</p>
            : <>
              <label>
                Nazwa firmy lub imię i nazwisko
                <input name="billingName" required maxLength={200} autoComplete="organization" value={billingName} onChange={(event) => setBillingName(event.target.value)} />
              </label>
              <div className="form-row">
                <label>
                  NIP <span className="optional">opcjonalnie</span>
                  <input name="billingNip" inputMode="numeric" maxLength={20} value={billingNip} onChange={(event) => setBillingNip(event.target.value)} placeholder="10 cyfr" />
                </label>
                <label>
                  Adres do faktury
                  <input name="billingAddress" required maxLength={500} autoComplete="street-address" value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} />
                </label>
              </div>
            </>}
        </>}
      </fieldset>

      {context === 'google' && <label>
        Słowa kluczowe i miejscowość <span className="optional">opcjonalnie</span>
        <input name="keywords" maxLength={1000} placeholder="Np. fryzjer, Warszawa" />
      </label>}

      <label>
        Co warto wiedzieć? <span className="optional">opcjonalnie</span>
        <textarea
          name="description"
          rows={3}
          maxLength={5000}
          placeholder={context === 'reputation' ? 'Podaj nazwę portalu, opisz opinię lub profil i powód zgłoszenia. Nie podawaj haseł ani danych wrażliwych.' : 'Opisz swoją sprawę. Nie podawaj haseł ani kodów logowania.'}
        />
      </label>

      <label className="honeypot" aria-hidden="true">
        Strona
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="checkbox">
        <input type="checkbox" name="privacy" required />
        <span>
          Zapoznałem/am się z{' '}
          <a href="/polityka-prywatnosci" target="_blank" rel="noreferrer">
            polityką prywatności
          </a>{' '}
          i proszę o kontakt w sprawie zgłoszenia.
        </span>
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button className="button dark full" disabled={busy || !enabled}>
        {busy ? (
          <>
            <LoaderCircle className="spin" size={20} /> Zapisujemy zgłoszenie…
          </>
        ) : (
          <>
            Wyślij zgłoszenie <ArrowUpRight size={22} />
          </>
        )}
      </button>

      <small className="form-safety">
        <ShieldCheck size={16} /> Zakres i warunki współpracy potwierdzamy przed rozpoczęciem. Wkrótce skontaktuje się z Tobą przydzielony opiekun.
      </small>
    </form>
  );
}
