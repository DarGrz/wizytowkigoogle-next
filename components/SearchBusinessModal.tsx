"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  MapPin,
  Star,
  ArrowUpRight,
  LoaderCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import type { GmbLocation } from '@/app/api/gmb-search/route';
import type { PlaceDetails } from '@/app/api/places-details/route';

interface SearchBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBusinessModal({ isOpen, onClose }: SearchBusinessModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GmbLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input and reset when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setSelectedPlace(null);
      setError(null);
      setIsSearching(false);
      setIsLoadingDetails(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!isOpen || selectedPlace) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const res = await fetch(`/api/gmb-search?query=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('Błąd wyszukiwania');
        const data = await res.json();
        setResults(data.results || []);
        if (!data.results || data.results.length === 0) {
          setError('Nie znaleziono wizytówki. Wpisz dokładniejszą nazwę lub dodaj miasto.');
        }
      } catch {
        setResults([]);
        setError('Wystąpił problem z wyszukiwaniem. Spróbuj ponownie.');
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [query, isOpen, selectedPlace]);

  // Fetch place details on select
  const handleSelectPlace = useCallback(async (location: GmbLocation) => {
    setIsLoadingDetails(true);
    setError(null);

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
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + location.address)}&query_place_id=${location.placeId}`,
        });
      }
    } catch {
      setSelectedPlace({
        id: location.placeId,
        name: location.name,
        address: location.address,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + location.address)}&query_place_id=${location.placeId}`,
      });
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // Calculate missing fields
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
        tip: 'Wizytówka traci autorytet SEO i potencjalne zamówienia z witryny.',
      });
    }
    if (place.hasOpeningHours === false) {
      missing.push({
        label: 'Brak zdefiniowanych godzin otwarcia',
        tip: 'Google i klienci nie wiedzą, czy firma jest obecnie czynna.',
      });
    }
    if (place.hasPhotos === false) {
      missing.push({
        label: 'Brak zdjęć profilowych',
        tip: 'Profile z aktualnymi zdjęciami uzyskują do 42% więcej zapytań o trasę.',
      });
    }
    if (place.hasDescription === false) {
      missing.push({
        label: 'Brak opisu działalności',
        tip: 'Opis profilu to kluczowe miejsce na słowa kluczowe podnoszące pozycję.',
      });
    }
    return missing;
  };

  const missingFields = selectedPlace ? getMissingFields(selectedPlace) : [];
  const isLowRating = Boolean(
    selectedPlace && typeof selectedPlace.rating === 'number' && selectedPlace.rating < 4.1
  );

  if (!isOpen) return null;

  return (
    <div
      className="gmb-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gmb-modal-title"
    >
      <div className="gmb-modal" ref={modalRef}>
        {/* Header */}
        <div className="gmb-modal-header">
          <div>
            <div className="gmb-modal-pill">
              <Sparkles size={14} />
              <span>Weryfikacja profilu Google Maps</span>
            </div>
            <h2 id="gmb-modal-title">Sprawdź swoją wizytówkę</h2>
            <p>Sprawdź aktualne dane profilu, wykryj błędy i poznaj rekomendacje dla swojej firmy.</p>
          </div>
          <button
            type="button"
            className="gmb-close-btn"
            onClick={onClose}
            aria-label="Zamknij okno"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar or Diagnostic view */}
        {!selectedPlace ? (
          <div className="gmb-modal-body">
            <div className="gmb-search-input-wrap">
              <Search className="gmb-search-icon" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Wpisz nazwę firmy lub branżę i miasto..."
                className="gmb-search-input"
                aria-label="Szukaj wizytówki w Google Maps"
              />
              {isSearching ? (
                <LoaderCircle className="gmb-search-loader spin" size={20} />
              ) : query ? (
                <button
                  type="button"
                  className="gmb-clear-btn"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  aria-label="Wyczyść pole wyszukiwania"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            {/* Results or Hints */}
            <div className="gmb-results-container">
              {isLoadingDetails ? (
                <div className="gmb-loading-details">
                  <LoaderCircle className="spin" size={32} />
                  <p>Pobieramy aktualne dane i parametry wizytówki...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="gmb-results-list">
                  <div className="gmb-results-heading">
                    <span>Wybierz swoją firmę z wyników Google Maps ({results.length}):</span>
                  </div>
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="gmb-result-card"
                      onClick={() => handleSelectPlace(item)}
                    >
                      <div className="gmb-result-icon">
                        <MapPin size={20} />
                      </div>
                      <div className="gmb-result-info">
                        <span className="gmb-result-name">{item.name}</span>
                        <span className="gmb-result-address">{item.address}</span>
                      </div>
                      <div className="gmb-result-arrow">
                        <span>Sprawdź</span>
                        <ArrowUpRight size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim().length >= 2 && error ? (
                <div className="gmb-empty-state">
                  <MapPin className="gmb-empty-icon" size={36} />
                  <p>{error}</p>
                  <small>Wpisz pełną nazwę zarejestrowaną w Google lub dodaj ulicę.</small>
                </div>
              ) : (
                <div className="gmb-hints-state">
                  <div className="gmb-hint-item">
                    <span className="gmb-hint-bullet">1</span>
                    <p>Wpisz <strong>nazwę swojej firmy</strong> oraz miejscowość.</p>
                  </div>
                  <div className="gmb-hint-item">
                    <span className="gmb-hint-bullet">2</span>
                    <p>Wybierz właściwy profil z listy wyników Google Maps.</p>
                  </div>
                  <div className="gmb-hint-item">
                    <span className="gmb-hint-bullet">3</span>
                    <p>Sprawdź ocenę, wykryj nieuzupełnione pola i skonsultuj profil bezpośrednio z naszym specjalistą.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Diagnostic & Direct Call View inside Modal */
          <div className="gmb-modal-body gmb-preview-body">
            {/* Top Business Card */}
            <div className="gmb-preview-card">
              <div className="gmb-preview-header">
                <div className="gmb-preview-badge">
                  <ShieldCheck size={16} />
                  <span>Znaleziono w Google Maps</span>
                </div>
                {selectedPlace.businessStatus && (
                  <span className="gmb-status-tag">
                    {selectedPlace.businessStatus === 'OPERATIONAL' ? 'Działalność otwarta' : selectedPlace.businessStatus}
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
                    <span>Zobacz profil w Google Maps</span>
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

            {/* Condition 1: Low Rating (< 4.1) Alert & Recommendations */}
            {isLowRating && selectedPlace.rating !== undefined && (
              <div className="gmb-alert-box low-rating">
                <div className="gmb-alert-top">
                  <AlertTriangle size={22} className="gmb-alert-icon" />
                  <div>
                    <h4>Niska średnia ocen: {selectedPlace.rating.toFixed(1)} / 5.0</h4>
                    <p>
                      Średnia ocen poniżej 4.1 obniża zaufanie klientów i sprawia, że większość z nich wybiera konkurencję.
                      Dla Twojego profilu rekomendujemy podjęcie natychmiastowych kroków:
                    </p>
                  </div>
                </div>
                <div className="gmb-alert-actions">
                  <a href="tel:+48527275002" className="gmb-choice-pill">
                    🛡️ Usuwanie negatywnych opinii — zadzwoń
                  </a>
                  <a href="tel:+48527275002" className="gmb-choice-pill">
                    🔄 Resetowanie wizytówki (czysty profil) — zadzwoń
                  </a>
                </div>
              </div>
            )}

            {/* Condition 2: Completeness Check */}
            {missingFields.length > 0 ? (
              <div className="gmb-completeness-box warning">
                <div className="gmb-completeness-header">
                  <AlertCircle size={18} />
                  <span>Wykryto {missingFields.length} {missingFields.length === 1 ? 'brakujący element' : missingFields.length < 5 ? 'brakujące elementy' : 'brakujących elementów'} w profilu Google:</span>
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
                <p className="gmb-completeness-note">
                  Niekompletna wizytówka traci pozycje w lokalnych wynikach wyszukiwania i budzi mniejsze zaufanie klientów.
                </p>
              </div>
            ) : (
              <div className="gmb-completeness-box success">
                <CheckCircle2 size={18} />
                <span>Wizytówka posiada uzupełnione podstawowe pola (telefon, strona WWW, godziny i zdjęcia).</span>
              </div>
            )}

            {/* Condition 3: Direct Phone Call CTA */}
            <div className="gmb-phone-direct-card">
              <div className="gmb-phone-direct-badge">
                <Phone size={14} /> Bezpłatna konsultacja telefoniczna
              </div>
              <h4>Zadzwoń i omów swoją wizytówkę</h4>
              <p>
                Nasz doradca bezpłatnie przeanalizuje profil Twojej firmy, omówi wykryte braki i podpowie jak poprawić pozycję lub usunąć niechciane opinie.
              </p>
              <div className="gmb-modal-phone-wrap">
                <a
                  href="tel:+48527275002"
                  className="gmb-modal-phone-btn"
                  aria-label="Zadzwoń do specjalisty: 527 275 002"
                >
                  <span className="phone-pulse-icon">
                    <Phone size={24} />
                  </span>
                  <div className="phone-badge-text">
                    <small>Kliknij i połącz się</small>
                    <strong>527 275 002</strong>
                  </div>
                </a>
              </div>
              <div className="gmb-phone-direct-perks">
                <span>✓ Bezpłatna wstępna analiza profilu</span>
                <span>✓ Porady dostosowane do Twojej branży</span>
                <span>✓ Bez zobowiązań i bez formularzy</span>
              </div>
            </div>

            {/* Back button to search another business */}
            <button
              type="button"
              className="button outline full small gmb-back-btn"
              onClick={() => {
                setSelectedPlace(null);
                setError(null);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              <RotateCcw size={15} />
              <span>Wyszukaj inną wizytówkę</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
