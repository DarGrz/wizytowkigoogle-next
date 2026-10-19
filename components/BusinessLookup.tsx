"use client";

import { useEffect, useRef, useState } from 'react';
import { Building2, LoaderCircle, MapPin, Search } from 'lucide-react';
import { normalizeNip, validNip, type RegistryCompany } from '@/lib/company';
import type { BusinessSource } from '@/lib/order-services';
import type { GmbLocation } from '@/app/api/gmb-search/route';

export type BusinessSelection = { company: string; profileUrl: string; address: string; registryCompany?: RegistryCompany };

export default function BusinessLookup({ source, onSelect, onClearSelection, autoSelectSingle = false, allowManualEntry = true }: { source: BusinessSource; onSelect: (company: BusinessSelection) => void; onClearSelection?: () => void; autoSelectSingle?: boolean; allowManualEntry?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BusinessSelection[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const controller = useRef<AbortController | null>(null);
  const isGus = source === 'portals';

  useEffect(() => () => controller.current?.abort(), []);

  async function search() {
    controller.current?.abort();
    onClearSelection?.();
    setResults([]);
    const term = query.trim();
    if (isGus ? !validNip(term) : term.length < 2) {
      setMessage(isGus ? 'Podaj poprawny, 10-cyfrowy NIP firmy.' : 'Wpisz co najmniej 2 znaki nazwy firmy.');
      return;
    }
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(isGus ? '/api/gus' : `/api/gmb-search?query=${encodeURIComponent(term)}`, {
        ...(isGus ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nip: normalizeNip(term) }) } : {}),
        signal: current.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Nie udało się wyszukać firmy.');
      if (!Array.isArray(data.results)) throw new Error('Wyszukiwarka zwróciła nieprawidłowe dane.');
      const found: BusinessSelection[] = isGus
        ? (data.results as RegistryCompany[]).map((company) => ({ company: company.name, profileUrl: '', address: company.address, registryCompany: company }))
        : (data.results as GmbLocation[]).map((place) => ({
          company: place.name,
          address: place.address,
          profileUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}&query_place_id=${encodeURIComponent(place.placeId)}`,
        }));
      if (current.signal.aborted) return;
      if (autoSelectSingle && found.length === 1) {
        onSelect(found[0]);
        setResults([]);
        setMessage('Dane wybranej firmy zostały uzupełnione.');
        return;
      }
      setResults(found);
      setMessage(found.length ? `Znaleziono: ${found.length}. Wybierz firmę poniżej.` : 'Nie znaleziono firmy. Sprawdź dane lub uzupełnij formularz ręcznie.');
    } catch (error) {
      if (!current.signal.aborted) setMessage(error instanceof Error ? error.message : 'Wyszukiwarka jest niedostępna. Spróbuj ponownie.');
    } finally {
      if (!current.signal.aborted) setBusy(false);
    }
  }

  return (
    <div className="business-lookup">
      <label htmlFor="business-query">{isGus ? <Building2 size={16} /> : <MapPin size={16} />}{isGus ? 'Znajdź firmę w GUS' : 'Znajdź wizytówkę w Google Maps'}</label>
      <div className="lookup-input-row">
        <input id="business-query" value={query} inputMode={isGus ? 'numeric' : 'text'} maxLength={isGus ? 20 : 200}
          placeholder={isGus ? 'NIP firmy, np. 5261040828' : 'Nazwa firmy i miejscowość'}
          aria-describedby="lookup-help"
          onChange={(event) => { controller.current?.abort(); onClearSelection?.(); setBusy(false); setQuery(event.target.value); setResults([]); setMessage(''); }}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} />
        <button type="button" className="button dark small" onClick={search} disabled={busy} aria-label={isGus ? 'Szukaj w GUS' : 'Szukaj w Google Maps'}>
          {busy ? <LoaderCircle size={18} className="spin" /> : <Search size={18} />} Szukaj
        </button>
      </div>
      <small id="lookup-help">{isGus ? 'GUS identyfikuje firmę po NIP. Link do opinii lub profilu na portalu podasz osobno.' : 'Wybierz swoją firmę — uzupełnimy nazwę i link do wizytówki.'}</small>
      <p className="lookup-message" role="status">{busy ? 'Wyszukujemy firmę…' : message}</p>
      {results.length > 0 && <ul className="lookup-results">{results.map((item) => (
        <li key={item.registryCompany?.regon || item.profileUrl}>
          <button type="button" onClick={() => { onSelect(item); setResults([]); setMessage('Dane wybranej firmy zostały uzupełnione.'); }}>
            <span><strong>{item.company}</strong><small>{item.registryCompany ? `${item.address} · NIP ${item.registryCompany.nip}` : `${item.address} · Google Maps`}</small></span><span aria-hidden="true">↗</span>
          </button>
        </li>
      ))}</ul>}
      {allowManualEntry && <small className="muted">Nie możesz znaleźć firmy? Możesz wpisać jej dane ręcznie poniżej.</small>}
    </div>
  );
}
