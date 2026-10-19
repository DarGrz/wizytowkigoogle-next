"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { normalizeNip, validNip, type RegistryCompany } from '@/lib/company';
import type { LandingSelection } from '@/lib/service-landings';
import type { GmbLocation } from '@/app/api/gmb-search/route';

interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  googleMapsUrl?: string;
  website?: string;
  phoneNumber?: string;
  rating?: number;
  user_ratings_total?: number;
  businessStatus?: string;
  hasOpeningHours?: boolean;
  hasPhotos?: boolean;
}

export default function ReputationOrder({
  enabled: _enabled,
  initialSelection,
}: {
  enabled?: boolean;
  initialSelection?: LandingSelection;
}) {
  const trigger = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'google' | 'nip'>(
    initialSelection?.source === 'portals' ? 'nip' : 'google'
  );

  // Google Maps State
  const [queryGoogle, setQueryGoogle] = useState('');
  const [googleResults, setGoogleResults] = useState<GmbLocation[]>([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [isLoadingGoogleDetails, setIsLoadingGoogleDetails] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // NIP / GUS State
  const [queryNip, setQueryNip] = useState('');
  const [isSearchingNip, setIsSearchingNip] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<RegistryCompany | null>(null);
  const [nipError, setNipError] = useState<string | null>(null);

  // Open & trigger handlers
  useEffect(() => {
    function launch(element?: HTMLElement) {
      trigger.current = element || null;
      setMode(initialSelection?.source === 'portals' ? 'nip' : 'google');
      setSelectedPlace(null);
      setSelectedCompany(null);
      setGoogleError(null);
      setNipError(null);
      setOpen(true);
    }

    const onClick = (event: MouseEvent) => {
      if (
        !(event.target instanceof Element) ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const element = event.target.closest<HTMLElement>(
        'a[href="#zlecenie"], [data-open-reputation]'
      );
      if (!element?.closest('.reputation-page')) return;
      event.preventDefault();
      launch(element);
    };

    const onHash = () => {
      if (location.hash === '#zlecenie') launch();
    };

    const onOpen = (event: Event) =>
      launch(
        event instanceof CustomEvent && event.detail instanceof HTMLElement
          ? event.detail
          : undefined
      );

    document.addEventListener('click', onClick, true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('open-reputation-order', onOpen);
    onHash();

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('open-reputation-order', onOpen);
    };
  }, [initialSelection]);

  // Modal control & Escape listener
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus();
    };
  }, [open]);

  // Debounced Google search
  useEffect(() => {
    if (!open || mode !== 'google' || selectedPlace) return;
    const trimmed = queryGoogle.trim();
    if (trimmed.length < 2) {
      setGoogleResults([]);
      setGoogleError(null);
      setIsSearchingGoogle(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGoogle(true);
      setGoogleError(null);
      try {
        const res = await fetch(`/api/gmb-search?query=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('Błąd wyszukiwania w Google');
        const data = await res.json();
        setGoogleResults(data.results || []);
        if (!data.results || data.results.length === 0) {
          setGoogleError('Nie znaleziono profilu w Google Maps. Dodaj miasto lub sprawdź nazwę.');
        }
      } catch {
        setGoogleResults([]);
        setGoogleError('Wystąpił problem z wyszukiwaniem. Spróbuj ponownie.');
      } finally {
        setIsSearchingGoogle(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [queryGoogle, open, mode, selectedPlace]);

  // Google Place select
  const handleSelectGooglePlace = useCallback(async (location: GmbLocation) => {
    setIsLoadingGoogleDetails(true);
    setGoogleError(null);
    try {
      const res = await fetch(`/api/places-details?placeId=${encodeURIComponent(location.placeId)}`);
      if (!res.ok) throw new Error('Nie udało się pobrać szczegółów wizytówki');
      const data = await res.json();
      if (data.details) {
        setSelectedPlace(data.details);
      } else {
        setSelectedPlace({
          id: location.placeId,
          name: location.name,
          address: location.address,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            location.name + ' ' + location.address
          )}&query_place_id=${location.placeId}`,
        });
      }
    } catch {
      setSelectedPlace({
        id: location.placeId,
        name: location.name,
        address: location.address,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location.name + ' ' + location.address
        )}&query_place_id=${location.placeId}`,
      });
    } finally {
      setIsLoadingGoogleDetails(false);
    }
  }, []);

  // NIP Search via GUS
  const handleSearchNip = async () => {
    const raw = queryNip.trim();
    if (!validNip(raw)) {
      setNipError('Wpisz poprawny, 10-cyfrowy numer NIP firmy.');
      return;
    }
    const nip = normalizeNip(raw);
    setIsSearchingNip(true);
    setNipError(null);
    setSelectedCompany(null);
    try {
      const res = await fetch('/api/gus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nie udało się pobrać danych firmy.');
      }
      if (!data.results || data.results.length === 0) {
        setNipError('Nie znaleziono firmy o podanym numerze NIP.');
        return;
      }
      setSelectedCompany(data.results[0]);
    } catch (err) {
      setNipError(err instanceof Error ? err.message : 'Wystąpił błąd podczas sprawdzania NIP.');
    } finally {
      setIsSearchingNip(false);
    }
  };

  // Missing fields for Google diagnostics
  const getMissingFields = (place: PlaceDetails) => {
    const missing: { label: string; tip: string }[] = [];
    if (!place.phoneNumber) {
      missing.push({
        label: 'Brak numeru telefonu',
        tip: 'Klienci nie mogą zadzwonić jednym kliknięciem z poziomu Map Google.',
      });
    }
    if (!place.website) {
      missing.push({
        label: 'Brak strony internetowej WWW',
        tip: 'Wizytówka traci autorytet SEO i potencjalne zamówienia ze strony.',
      });
    }
    if (place.hasOpeningHours === false) {
      missing.push({
        label: 'Brak zdefiniowanych godzin otwarcia',
        tip: 'Google i klienci nie wiedzą, czy firma jest aktualnie otwarta.',
      });
    }
    if (place.hasPhotos === false) {
      missing.push({
        label: 'Brak zdjęć profilowych',
        tip: 'Wizytówki bez zdjęć generują mniej kliknięć i zapytań o trasę.',
      });
    }
    return missing;
  };

  const isLowRating = selectedPlace?.rating !== undefined && selectedPlace.rating < 4.1;
  const missingFields = selectedPlace ? getMissingFields(selectedPlace) : [];

  return (
    <>
      <section id="zlecenie" className="rep-start-section">
        <div className="wrap rep-start">
          <div>
            <p className="eyebrow">Zacznijmy od Twojej sprawy</p>
            <h2>
              Sprawdź wizytówkę lub NIP.<br />Zadzwoń do specjalisty.
            </h2>
            <p>
              Wskaż swoją firmę w Mapach Google lub podaj NIP. Bezpłatnie przeanalizujemy możliwości
              usunięcia negatywnych opinii lub całych profili.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="button dark"
              data-open-reputation
              onClick={() => {
                setOpen(true);
                setSelectedPlace(null);
                setSelectedCompany(null);
                setGoogleError(null);
                setNipError(null);
              }}
            >
              Zgłoś swoją sprawę <ArrowUpRight size={21} />
            </button>
            <small>
              <ShieldCheck size={16} /> Bezpłatna analiza sprawy i bezpośredni kontakt z opiekunem.
            </small>
          </div>
        </div>
      </section>

      {open && (
        <div
          className="gmb-modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reputation-dialog-title"
        >
          <div
            className="gmb-modal"
            style={{ width: 'min(680px, 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gmb-modal-header" style={{ padding: '20px 24px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div className="gmb-modal-pill" style={{ margin: 0 }}>
                  <ShieldCheck size={16} />
                  <span>Ochrona wizerunku — Bezpłatna analiza</span>
                </div>
                <button
                  type="button"
                  className="gmb-close-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Zamknij"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="gmb-modal-body">
              {/* Tab Switcher */}
              <div className="rep-tab-switch" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'google'}
                  className={`rep-tab-btn ${mode === 'google' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('google');
                    setSelectedCompany(null);
                    setNipError(null);
                  }}
                >
                  <MapPin size={17} />
                  <span>Mapy Google</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'nip'}
                  className={`rep-tab-btn ${mode === 'nip' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('nip');
                    setSelectedPlace(null);
                    setGoogleError(null);
                  }}
                >
                  <Building2 size={17} />
                  <span>Profil firmy po NIP</span>
                </button>
              </div>

              {/* MODE 1: GOOGLE MAPS SEARCH & DIAGNOSTIC */}
              {mode === 'google' && (
                <>
                  {!selectedPlace ? (
                    <div>
                      <h2 id="reputation-dialog-title">Znajdź firmę w Google Maps</h2>
                      <p className="rep-dialog-intro">
                        Wpisz nazwę swojej firmy oraz miejscowość. Pobierzemy dane profilu i sprawdzimy opinie.
                      </p>

                      <div className="lookup-input-row">
                        <input
                          type="text"
                          value={queryGoogle}
                          onChange={(e) => setQueryGoogle(e.target.value)}
                          placeholder="Np. Kawiarnia Relaks Warszawa"
                          aria-label="Wyszukaj wizytówkę w Google Maps"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="button dark small"
                          disabled={isSearchingGoogle || queryGoogle.trim().length < 2}
                        >
                          {isSearchingGoogle ? (
                            <LoaderCircle size={18} className="spin" />
                          ) : (
                            <Search size={18} />
                          )}
                          Szukaj
                        </button>
                      </div>

                      {googleError && (
                        <p className="lookup-message error" role="alert" style={{ color: '#b91c1c' }}>
                          {googleError}
                        </p>
                      )}

                      {isLoadingGoogleDetails && (
                        <div style={{ textAlign: 'center', padding: '30px' }}>
                          <LoaderCircle size={32} className="spin" />
                          <p style={{ marginTop: '10px', fontSize: '14px' }}>
                            Pobieramy szczegóły i statystyki wizytówki…
                          </p>
                        </div>
                      )}

                      {googleResults.length > 0 && !isLoadingGoogleDetails && (
                        <ul className="lookup-results" style={{ marginTop: '16px' }}>
                          {googleResults.map((item) => (
                            <li key={item.placeId || item.id}>
                              <button
                                type="button"
                                onClick={() => handleSelectGooglePlace(item)}
                              >
                                <span>
                                  <strong>{item.name}</strong>
                                  <small>{item.address}</small>
                                </span>
                                <span aria-hidden="true">↗</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    /* Google Maps Diagnostics View */
                    <div className="gmb-preview-body">
                      {/* Top Business Card */}
                      <div className="gmb-preview-card">
                        <div className="gmb-preview-header">
                          <div className="gmb-preview-badge">
                            <ShieldCheck size={16} />
                            <span>Znaleziono w Google Maps</span>
                          </div>
                          {selectedPlace.businessStatus && (
                            <span className="gmb-status-tag">
                              {selectedPlace.businessStatus === 'OPERATIONAL'
                                ? 'Działalność otwarta'
                                : selectedPlace.businessStatus}
                            </span>
                          )}
                        </div>

                        <h3 className="gmb-preview-title">{selectedPlace.name}</h3>
                        <p className="gmb-preview-address">
                          <MapPin size={16} />
                          <span>{selectedPlace.address}</span>
                        </p>

                        {/* Rating and Metrics */}
                        <div className="gmb-metrics-row">
                          {selectedPlace.rating !== undefined ? (
                            <div className="gmb-metric-box">
                              <div className="gmb-stars-row">
                                <Star size={18} fill="#f59e0b" color="#f59e0b" />
                                <strong>{selectedPlace.rating.toFixed(1)}</strong>
                                <span className="gmb-metric-muted">/ 5.0</span>
                              </div>
                              <span className="gmb-metric-label">
                                {selectedPlace.user_ratings_total
                                  ? `${selectedPlace.user_ratings_total} opinii Google`
                                  : 'Ocena profilu'}
                              </span>
                            </div>
                          ) : (
                            <div className="gmb-metric-box">
                              <span className="gmb-metric-label">Brak publicznych opinii</span>
                            </div>
                          )}

                          <div className="gmb-metric-box">
                            <span className="gmb-metric-val">
                              {selectedPlace.phoneNumber || 'Brak w profilu'}
                            </span>
                            <span className="gmb-metric-label">Telefon w wizytówce</span>
                          </div>
                        </div>

                        {/* External Links */}
                        <div className="gmb-preview-links">
                          {selectedPlace.googleMapsUrl && (
                            <a
                              href={selectedPlace.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="gmb-ext-link"
                            >
                              <span>Zobacz w Google Maps</span>
                              <ExternalLink size={14} />
                            </a>
                          )}
                          {selectedPlace.website && (
                            <a
                              href={selectedPlace.website}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="gmb-ext-link"
                            >
                              <span>Strona WWW</span>
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Condition 1: Low Rating (< 4.1) Alert */}
                      {isLowRating && selectedPlace.rating !== undefined && (
                        <div className="gmb-alert-box low-rating">
                          <div className="gmb-alert-top">
                            <AlertTriangle size={22} className="gmb-alert-icon" />
                            <div>
                              <h4>Niska średnia ocen: {selectedPlace.rating.toFixed(1)} / 5.0</h4>
                              <p>
                                Średnia ocen poniżej 4.1 obniża zaufanie klientów i sprawia, że większość z nich wybiera konkurencję. Dla Twojego profilu rekomendujemy:
                              </p>
                            </div>
                          </div>
                          <div className="gmb-alert-actions">
                            <a href="tel:+48572275002" className="gmb-choice-pill">
                              🛡️ Usuwanie negatywnych opinii — zadzwoń: 572 275 002
                            </a>
                            <a href="tel:+48572275002" className="gmb-choice-pill">
                              🔄 Resetowanie wizytówki (czysty profil) — zadzwoń: 572 275 002
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Condition 2: Completeness Check */}
                      {missingFields.length > 0 ? (
                        <div className="gmb-completeness-box warning">
                          <div className="gmb-completeness-header">
                            <AlertCircle size={18} />
                            <span>
                              Wykryto {missingFields.length}{' '}
                              {missingFields.length === 1
                                ? 'brakujący element'
                                : missingFields.length < 5
                                ? 'brakujące elementy'
                                : 'brakujących elementów'}{' '}
                              w profilu:
                            </span>
                          </div>
                          <ul className="gmb-missing-list">
                            {missingFields.map((field, idx) => (
                              <li key={idx}>
                                <span className="badge-missing">Brak</span>
                                <div>
                                  <strong>{field.label}</strong>
                                  <small>{field.tip}</small>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="gmb-completeness-box success">
                          <CheckCircle2 size={18} />
                          <span>
                            Wizytówka posiada uzupełnione podstawowe pola (telefon, WWW, godziny, zdjęcia).
                          </span>
                        </div>
                      )}

                      {/* Direct Phone Call Card */}
                      <div className="gmb-phone-direct-card">
                        <div className="gmb-phone-direct-badge">
                          <Phone size={14} /> Bezpłatna konsultacja telefoniczna
                        </div>
                        <h4>Zadzwoń i omów swoją sprawę z ekspertem</h4>
                        <p>
                          Nasz doradca bezpłatnie przeanalizuje profil Twojej firmy, omówi negatywne opinie i przedstawi skuteczne kroki prawne.
                        </p>
                        <div className="gmb-modal-phone-wrap">
                          <a
                            href="tel:+48572275002"
                            className="gmb-modal-phone-btn"
                            aria-label="Zadzwoń do specjalisty: 572 275 002"
                          >
                            <span className="phone-pulse-icon">
                              <Phone size={24} />
                            </span>
                            <div className="phone-badge-text">
                              <small>Kliknij i połącz się</small>
                              <strong>572 275 002</strong>
                            </div>
                          </a>
                        </div>
                        <div className="gmb-phone-direct-perks">
                          <span>✓ Bezpłatna wstępna analiza profilu</span>
                          <span>✓ Doradztwo prawne w usuwaniu nieprawdziwych ocen</span>
                          <span>✓ Bez zobowiązań i bez formularzy</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="button outline full small gmb-back-btn"
                        onClick={() => {
                          setSelectedPlace(null);
                          setGoogleError(null);
                        }}
                      >
                        <RotateCcw size={16} /> Wyszukaj inną firmę w Google Maps
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* MODE 2: NIP / GUS SEARCH & SMART PHONE INVITATION */}
              {mode === 'nip' && (
                <>
                  {!selectedCompany ? (
                    <div>
                      <h2 id="reputation-dialog-title">Sprawdź firmę po NIP</h2>
                      <p className="rep-dialog-intro">
                        Wpisz 10-cyfrowy NIP firmy. Pobierzemy dane i sprawdzimy możliwości usunięcia profili z portali.
                      </p>

                      <div className="lookup-input-row">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={12}
                          value={queryNip}
                          onChange={(e) => setQueryNip(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void handleSearchNip();
                            }
                          }}
                          placeholder="Np. 5261040828"
                          aria-label="Wpisz NIP firmy"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="button dark small"
                          onClick={() => void handleSearchNip()}
                          disabled={isSearchingNip || queryNip.trim().length < 8}
                        >
                          {isSearchingNip ? (
                            <LoaderCircle size={18} className="spin" />
                          ) : (
                            <Search size={18} />
                          )}
                          Szukaj
                        </button>
                      </div>

                      {nipError && (
                        <p className="lookup-message error" role="alert" style={{ color: '#b91c1c' }}>
                          {nipError}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* NIP Company Card & Smart Phone Invitation */
                    <div>
                      {/* Company Card */}
                      <div className="rep-nip-company-card">
                        <div className="rep-nip-company-header">
                          <span className="pill mint">
                            <ShieldCheck size={14} /> Dane firmy
                          </span>
                          <span className="rep-nip-legal-pill">
                            {selectedCompany.legalFormLabel ||
                              (selectedCompany.legalForm === 'sole-trader'
                                ? 'Jednoosobowa działalność gospodarcza (CEIDG)'
                                : selectedCompany.legalForm === 'civil-partnership'
                                ? 'Spółka cywilna'
                                : 'Spółka prawa handlowego')}
                          </span>
                        </div>

                        <h3>{selectedCompany.name}</h3>

                        <div className="rep-nip-details-grid">
                          <div>
                            <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>
                              NUMER NIP
                            </span>
                            <strong>{selectedCompany.nip}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>
                              NUMER REGON
                            </span>
                            <strong>{selectedCompany.regon}</strong>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>
                              ADRES REJESTROWY
                            </span>
                            <span>{selectedCompany.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Smart Phone Invitation Card */}
                      <div className="rep-nip-smart-card">
                        <div className="rep-nip-smart-badge">
                          <ShieldCheck size={15} /> Ochrona wizerunku i danych firmy
                        </div>

                        <h4>Zadzwoń i sprawdź możliwości usunięcia profili z portali</h4>

                        <p>
                          {selectedCompany.legalForm === 'sole-trader' ||
                          selectedCompany.legalForm === 'civil-partnership' ? (
                            <>
                              Dla <strong>jednoosobowej działalności gospodarczej</strong> dane rejestrowe (NIP,
                              nazwa, adres) podlegają ochronie przepisów o ochronie danych osobowych (RODO).
                              Oznacza to <strong>silne podstawy prawne</strong> do żądania trwałego usunięcia
                              profilu firmy i niechcianych wpisów z portali takich jak <strong>GoWork, Aleo,
                              Panorama Firm, Cylex</strong> i innych baz. Zadzwoń do naszego doradcy —
                              bezpłatnie zweryfikujemy Twoją sytuację i wskażemy najszybszą ścieżkę interwencji.
                            </>
                          ) : (
                            <>
                              Dla podmiotów prawa handlowego usunięcie profili oraz nieprawdziwych wpisów
                              realizujemy w oparciu o <strong>regulaminy serwisów (GoWork, Aleo, Panorama
                              Firm)</strong>, ochronę dóbr osobistych oraz przepisy o zwalczaniu nieuczciwej
                              konkurencji. Zadzwoń do nas — bezpłatnie przeanalizujemy sytuację Twojej spółki i
                              przedstawimy realne opcje prawne.
                            </>
                          )}
                        </p>

                        <div className="gmb-modal-phone-wrap">
                          <a
                            href="tel:+48572275002"
                            className="gmb-modal-phone-btn"
                            aria-label="Zadzwoń do opiekuna: 572 275 002"
                          >
                            <span className="phone-pulse-icon">
                              <Phone size={24} />
                            </span>
                            <div className="phone-badge-text">
                              <small>Kliknij i połącz się ze specjalistą</small>
                              <strong>572 275 002</strong>
                            </div>
                          </a>
                        </div>

                        <div className="rep-nip-smart-perks">
                          <span>✓ Bezpłatna weryfikacja podstaw prawnych dla NIP: {selectedCompany.nip}</span>
                          <span>✓ Weryfikacja obecności w portalach: GoWork, Aleo, Panorama Firm i inne</span>
                          <span>✓ Zero opłat z góry i brak skomplikowanych formularzy</span>
                          <span>✓ Bezpośrednia rozmowa z dedykowanym opiekunem prawnym</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="button outline full small gmb-back-btn"
                        onClick={() => {
                          setSelectedCompany(null);
                          setNipError(null);
                        }}
                      >
                        <RotateCcw size={16} /> Sprawdź inny NIP
                      </button>
                    </div>
                  )}
                </>
              )}

              <p className="rep-dialog-safety">
                <ShieldCheck size={15} /> Analizujemy możliwości. Nie obiecujemy usunięcia każdej treści.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
