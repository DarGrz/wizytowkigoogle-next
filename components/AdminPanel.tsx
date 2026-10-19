"use client";

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  ArrowUpRight,
  Inbox,
  SlidersHorizontal,
  FileText,
  ChartNoAxesCombined,
  LogOut,
  X,
  Save,
  RefreshCw,
  Building2,
  Users,
  Phone,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { statusLabels, statuses, type Order, type ContentPage } from '@/lib/types';
import { money } from '@/lib/format';
import defaults from '@/lib/services.json';
import { defaultPages } from '@/lib/service-landings';

const demoOrders: Order[] = [
  {
    id: 'demo-1',
    reference: 'DEMO-001',
    company: 'Przykładowa Kwiaciarnia',
    email: 'demo@example.com',
    phone: '572 275 002',
    profile_url: '',
    keywords: 'kwiaciarnia, Warszawa',
    description: 'Przykładowe zgłoszenie pokazujące układ panelu.',
    service_id: 'pozycjonowanie',
    status: 'weryfikacja',
    price_cents: null,
    payment_status: 'not_required',
    goal: null,
    notes: null,
    created_at: '2026-10-17 09:30:00',
    updated_at: '2026-10-17 09:30:00',
    attribution: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'przyklad' },
  },
  {
    id: 'demo-2',
    reference: 'DEMO-002',
    company: 'Przykładowy Warsztat',
    email: 'demo@example.com',
    phone: '572 275 002',
    profile_url: '',
    keywords: '',
    description: 'Dane demonstracyjne, nie są prawdziwym zleceniem.',
    service_id: 'google-ads',
    status: 'nowe',
    price_cents: null,
    payment_status: 'not_required',
    goal: null,
    notes: null,
    created_at: '2026-10-17 10:00:00',
    updated_at: '2026-10-17 10:00:00',
    attribution: null,
  },
];

type EditableService = { id: string; name: string; price_cents: number | null; content: string };

const paymentLabels: Record<string, string> = {
  creating: 'Tworzenie płatności',
  pending: 'Oczekuje na PayU',
  paid: 'Opłacone',
  cancelled: 'Anulowane',
  failed: 'Wymaga sprawdzenia',
  after_result: 'Warunki indywidualne',
  not_required: 'Nie dotyczy',
};

export default function AdminPanel({ demo }: { demo: boolean }) {
  const [tab, setTab] = useState('visits'); // Default to visits as requested
  const [orders, setOrders] = useState<Order[]>(demo ? demoOrders : []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [err, setErr] = useState('');
  const [services, setServices] = useState<EditableService[]>(
    defaults.map((s) => ({ id: s.id, name: s.name, price_cents: null, content: s.description }))
  );
  const [pages, setPages] = useState<ContentPage[]>(defaultPages);
  const [pageSlug, setPageSlug] = useState(defaultPages[0].slug);
  const [traffic, setTraffic] = useState<{ event: string; total: number }[]>([]);
  const [mail, setMail] = useState<{ status: string; total: number }[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);

  // Visits table filter & pagination states
  const [visitsQuery, setVisitsQuery] = useState('');
  const [visitsAction, setVisitsAction] = useState('');
  const [visitsDate, setVisitsDate] = useState('');
  const [visitsPage, setVisitsPage] = useState(1);
  const [visitsPerPage, setVisitsPerPage] = useState(50);

  async function load() {
    if (demo) return;
    setErr('');
    try {
      const r = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (r.status === 401) {
        location.reload();
        return;
      }
      if (!r.ok) throw Error('Nie udało się pobrać danych.');
      const d = await r.json();
      setOrders(d.orders || []);
      setTraffic(d.traffic || []);
      setMail(d.mail || []);
      setVisits(d.visits || []);

      const c = await fetch('/api/admin/content', { cache: 'no-store' });
      if (!c.ok) throw Error('Nie udało się pobrać treści.');
      const v = await c.json();
      setServices(v.services);
      setPages(
        v.pages.map((p: { content: ContentPage | string }) =>
          typeof p.content === 'string' ? JSON.parse(p.content) : p.content
        )
      );
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo || !selected) return;
    setBusy(true);
    setErr('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/admin/orders/' + selected.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: f.get('status'),
          priceCents: f.get('price') === '' ? null : Math.round(Number(f.get('price')) * 100),
          goal: f.get('goal'),
          notes: f.get('notes'),
          message: f.get('message'),
          expectedUpdatedAt: selected.updated_at,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || 'Nie udało się zapisać.');
      setSelected(null);
      setMessage('Zmiany zapisane.');
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveContent(data: unknown) {
    if (demo) return;
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setMessage('Zmiany zapisane.');
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const visibleOrders = orders.filter(
    (o) =>
      (!filter || o.status === filter) &&
      [o.company, o.reference, o.email].join(' ').toLowerCase().includes(query.toLowerCase())
  );
  const currentPage = pages.find((p) => p.slug === pageSlug);
  const serviceName = (id: string) => services.find((s) => s.id === id)?.name || id;

  // Fingerprint groups for detecting repeat visitors
  const fingerprintCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of visits) {
      const fp = v.fingerprint_hash;
      if (fp && fp !== 'Unknown' && fp !== 'fp-err') {
        counts[fp] = (counts[fp] || 0) + 1;
      }
    }
    return counts;
  }, [visits]);

  // Visits stats
  const visitStats = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const todayPL = new Date().toLocaleDateString('pl-PL');
    const uniqueIps = new Set<string>();
    const uniqueFps = new Set<string>();
    let phoneClicks = 0;
    let phoneMenus = 0;
    let searches = 0;
    let todayCount = 0;

    for (const v of visits) {
      if (v.ip_address) uniqueIps.add(v.ip_address);
      if (v.fingerprint_hash && v.fingerprint_hash !== 'Unknown' && v.fingerprint_hash !== 'fp-err') {
        uniqueFps.add(v.fingerprint_hash);
      }
      if (v.action === 'PHONE_CLICK') phoneClicks++;
      if (v.action === 'PHONE_CONTEXT_MENU') phoneMenus++;
      if (v.company_name || v.search_type || v.action?.includes('LOOKUP')) searches++;

      const dt = v.created_at || v.visit_time || '';
      if (dt.includes(todayISO) || dt.includes(todayPL)) {
        todayCount++;
      }
    }

    return {
      total: visits.length,
      phoneClicks,
      phoneMenus,
      searches,
      uniqueIps: uniqueIps.size,
      uniqueFps: uniqueFps.size,
      todayCount,
    };
  }, [visits]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      if (visitsAction) {
        if (visitsAction === 'COMPANY_SEARCH') {
          if (!v.company_name && !v.search_type && !v.action?.includes('LOOKUP')) return false;
        } else if (v.action !== visitsAction) {
          return false;
        }
      }
      if (visitsDate) {
        const dt = v.created_at || v.visit_time || '';
        if (!dt.includes(visitsDate)) return false;
      }
      if (visitsQuery) {
        const q = visitsQuery.toLowerCase();
        const haystack = [
          v.ip_address,
          v.city,
          v.region,
          v.country,
          v.company_name,
          v.company_nip,
          v.keyword,
          v.utm_source,
          v.utm_campaign,
          v.utm_term,
          v.fingerprint_hash,
          v.phone_number,
          v.platform,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [visits, visitsAction, visitsDate, visitsQuery]);

  // Paginated visits
  const totalPages = Math.ceil(filteredVisits.length / visitsPerPage) || 1;
  const paginatedVisits = useMemo(() => {
    const start = (visitsPage - 1) * visitsPerPage;
    return filteredVisits.slice(start, start + visitsPerPage);
  }, [filteredVisits, visitsPage, visitsPerPage]);

  function exportVisitsCSV() {
    const headers = [
      'Data/Czas',
      'Akcja',
      'Telefon',
      'IP',
      'Lokalizacja',
      'Fingerprint',
      'Platforma',
      'Ekran',
      'Źródło (UTM)',
      'Kampania (UTM)',
      'Fraza (UTM/Keyword)',
      'Wyszukana firma',
      'NIP',
      'Adres',
      'GCLID',
      'User Agent',
    ];
    const rowsCSV = filteredVisits.map((v) => [
      `"${v.visit_time || v.created_at || ''}"`,
      `"${v.action || 'PAGE_VISIT'}"`,
      `"${v.phone_number || ''}"`,
      `"${v.ip_address || ''}"`,
      `"${[v.city, v.region, v.country].filter(Boolean).join(', ')}"`,
      `"${v.fingerprint_hash || ''}"`,
      `"${v.platform || ''}"`,
      `"${v.screen_resolution || ''}"`,
      `"${v.utm_source || ''}"`,
      `"${v.utm_campaign || ''}"`,
      `"${v.keyword || v.utm_term || ''}"`,
      `"${(v.company_name || '').replace(/"/g, '""')}"`,
      `"${v.company_nip || ''}"`,
      `"${(v.company_address || '').replace(/"/g, '""')}"`,
      `"${v.gclid || ''}"`,
      `"${(v.user_agent || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rowsCSV.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wizyty_wizytowkigoogle_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function clearVisitsFilters() {
    setVisitsQuery('');
    setVisitsAction('');
    setVisitsDate('');
    setVisitsPage(1);
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-mark">
          w<span>✦</span>
        </div>
        <p className="eyebrow">Twoje centrum dowodzenia</p>
        {[
          ['visits', 'Wizyty i analityka', Users],
          ['orders', 'Zlecenia', Inbox],
          ['services', 'Usługi i ceny', SlidersHorizontal],
          ['pages', 'Treści podstron', FileText],
          ['analytics', 'Statystyki ogólne', ChartNoAxesCombined],
        ].map(([id, label, Icon]) => {
          const I = Icon as typeof Inbox;
          return (
            <button
              key={String(id)}
              className={tab === id ? 'active' : ''}
              onClick={() => {
                setTab(String(id));
                setMessage('');
                setErr('');
              }}
            >
              <I size={18} />
              {String(label)}
            </button>
          );
        })}
        <a href="/" target="_blank">
          Zobacz stronę <ArrowUpRight size={17} />
        </a>
        {!demo && (
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              location.reload();
            }}
          >
            <LogOut size={18} /> Wyloguj
          </button>
        )}
      </aside>

      <section className="admin-content">
        <div className="admin-title">
          <div>
            <span className="eyebrow">wizytowkigoogle.pl / panel</span>
            <h1>
              {tab === 'visits'
                ? 'Analiza odwiedzających, połączeń i wyszukiwań'
                : tab === 'orders'
                ? 'Zgłoszenia i obsługa klientów'
                : tab === 'services'
                ? 'Usługi i ceny'
                : tab === 'pages'
                ? 'Słowa, które pracują'
                : 'Skąd przychodzą klienci?'}
            </h1>
          </div>
          <button className="icon-button" aria-label="Odśwież" onClick={load}>
            <RefreshCw size={20} />
          </button>
        </div>

        {demo && (
          <div className="notice">
            Tryb demonstracyjny — przykładowe dane, bez zapisu. Po podłączeniu MySQL panel wymaga
            logowania i pokazuje prawdziwe zgłoszenia oraz wizyty.
          </div>
        )}
        {message && (
          <p className="notice mint" role="status">
            {message}
          </p>
        )}
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}

        {/* ===================== TAB: VISITS (ANALYTICS & FULL VISITOR LOGS) ===================== */}
        {tab === 'visits' && (
          <>
            <div className="stats">
              <div className="lavender">
                <small>Wszystkie zdarzenia</small>
                <strong>{visitStats.total}</strong>
                <small>{visitStats.todayCount} dzisiaj</small>
              </div>
              <div className="yellow">
                <small>Kliknięcia telefonu</small>
                <strong>{visitStats.phoneClicks}</strong>
                <small>{visitStats.phoneMenus} menu / kopii</small>
              </div>
              <div className="mint">
                <small>Wyszukania firm</small>
                <strong>{visitStats.searches}</strong>
                <small>Mapy Google & rejestry</small>
              </div>
              <div className="peach">
                <small>Unikalne urządzenia</small>
                <strong>{visitStats.uniqueFps}</strong>
                <small>{visitStats.uniqueIps} unikalnych IP</small>
              </div>
            </div>

            {/* Toolbar and Filters */}
            <div className="visits-toolbar">
              <div className="visits-filters">
                <div className="visits-search-box">
                  <Search size={18} color="#9484a9" />
                  <input
                    aria-label="Szukaj w logach"
                    placeholder="Szukaj po IP, mieście, firmie, frazie, fingerprint..."
                    value={visitsQuery}
                    onChange={(e) => {
                      setVisitsQuery(e.target.value);
                      setVisitsPage(1);
                    }}
                  />
                </div>

                <select
                  aria-label="Filtruj akcje"
                  value={visitsAction}
                  onChange={(e) => {
                    setVisitsAction(e.target.value);
                    setVisitsPage(1);
                  }}
                >
                  <option value="">Wszystkie akcje</option>
                  <option value="PHONE_CLICK">📞 Kliknięcia telefonu</option>
                  <option value="PHONE_CONTEXT_MENU">📋 Menu kontekstowe telefonu</option>
                  <option value="PAGE_VISIT">👁️ Wizyty na stronie</option>
                  <option value="COMPANY_SEARCH">🏢 Wyszukania firm</option>
                  <option value="BUSINESS_LOOKUP">🗺️ Mapy Google</option>
                  <option value="GUS_LOOKUP">📑 Po NIP</option>
                </select>

                <input
                  type="date"
                  aria-label="Filtruj po dacie"
                  value={visitsDate}
                  onChange={(e) => {
                    setVisitsDate(e.target.value);
                    setVisitsPage(1);
                  }}
                />

                {(visitsQuery || visitsAction || visitsDate) && (
                  <button className="btn-clear-filter" onClick={clearVisitsFilters}>
                    Wyczyść filtry
                  </button>
                )}
              </div>

              <div className="visits-actions-row">
                <button
                  className="btn-export-csv"
                  onClick={exportVisitsCSV}
                  title="Pobierz aktualnie przefiltrowane logi do pliku CSV"
                >
                  <Download size={15} /> Eksport CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data i czas</th>
                    <th>Akcja</th>
                    <th>Adres IP & Lokalizacja</th>
                    <th>Fingerprint</th>
                    <th>Platforma & Ekran</th>
                    <th>Źródło & Kampania</th>
                    <th>Wyszukiwanie / Fraza</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedVisits.map((v) => {
                    const isPhoneClick = v.action === 'PHONE_CLICK';
                    const isPhoneMenu = v.action === 'PHONE_CONTEXT_MENU';
                    const isCompany = Boolean(v.company_name || v.search_type || v.action?.includes('LOOKUP'));
                    const fp = v.fingerprint_hash;
                    const isRepeatUser = fp && fp !== 'Unknown' && fp !== 'fp-err' && (fingerprintCounts[fp] || 0) > 1;

                    let rowClass = '';
                    if (isPhoneClick) rowClass = 'tr-phone-click';
                    else if (isPhoneMenu) rowClass = 'tr-phone-menu';
                    else if (isCompany) rowClass = 'tr-company';
                    if (isRepeatUser) rowClass += ' tr-repeat';

                    return (
                      <tr key={v.id} className={rowClass}>
                        <td>
                          <strong>{v.visit_time || (v.created_at ? v.created_at.slice(0, 19).replace('T', ' ') : '—')}</strong>
                          {isRepeatUser && (
                            <span className="repeat-badge">
                              🔁 Powracający ({fingerprintCounts[fp]}x)
                            </span>
                          )}
                        </td>
                        <td>
                          {isPhoneClick ? (
                            <span className="act-badge phone">
                              <Phone size={12} /> {v.phone_number || '572 275 002'}
                            </span>
                          ) : isPhoneMenu ? (
                            <span className="act-badge menu">
                              📋 Menu: {v.phone_number || '572 275 002'}
                            </span>
                          ) : isCompany ? (
                            <span className="act-badge company">
                              <Building2 size={12} /> {v.search_type === 'gus' ? 'Dane po NIP' : 'Google Maps'}
                            </span>
                          ) : (
                            <span className="act-badge visit">
                              <Eye size={12} /> Wizyta
                            </span>
                          )}
                        </td>
                        <td>
                          <code>{v.ip_address}</code>
                          <small>
                            {[v.city, v.region, v.country].filter(Boolean).join(', ') || 'Lokalizacja nieznana'}
                          </small>
                        </td>
                        <td>
                          {fp && fp !== 'Unknown' && fp !== 'fp-err' ? (
                            <span className="fp-tag">{fp.slice(0, 10)}</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span>{v.platform || '—'}</span>
                          <small>{v.screen_resolution || ''}</small>
                        </td>
                        <td>
                          <strong>{v.utm_source || (v.gclid ? 'Google Ads' : 'Bezpośrednie / Organic')}</strong>
                          {v.utm_campaign && <small>Kampania: {v.utm_campaign}</small>}
                          {v.campaign_id && <small>ID: {v.campaign_id}</small>}
                        </td>
                        <td>
                          {v.company_name ? (
                            <>
                              <strong>{v.company_name}</strong>
                              {v.company_nip && <small>NIP: {v.company_nip}</small>}
                              {v.company_address && <small>{v.company_address}</small>}
                            </>
                          ) : v.keyword || v.utm_term ? (
                            <span>{v.keyword || v.utm_term}</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="circle"
                            aria-label="Pokaż szczegóły wizyty"
                            title="Szczegóły zdarzenia"
                            onClick={() => setSelectedVisit(v)}
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!filteredVisits.length && (
                <div className="empty-state">
                  <Users size={36} />
                  <h3>Brak pasujących logów wizyt</h3>
                  <p>Zmień filtry wyszukiwania lub odśwież panel.</p>
                </div>
              )}
            </div>

            {/* Pagination footer */}
            <div className="pagination-footer">
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Pokazujesz {filteredVisits.length ? (visitsPage - 1) * visitsPerPage + 1 : 0}–
                {Math.min(visitsPage * visitsPerPage, filteredVisits.length)} z {filteredVisits.length} wpisów
              </div>

              <div className="pagination-controls">
                <select
                  aria-label="Wpisów na stronę"
                  value={visitsPerPage}
                  onChange={(e) => {
                    setVisitsPerPage(Number(e.target.value));
                    setVisitsPage(1);
                  }}
                  style={{
                    background: 'white',
                    border: '1px solid #d2c6df',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    marginRight: '8px',
                  }}
                >
                  <option value={25}>25 / strona</option>
                  <option value={50}>50 / strona</option>
                  <option value={100}>100 / strona</option>
                  <option value={250}>250 / strona</option>
                </select>

                <button
                  className="pagination-btn"
                  disabled={visitsPage <= 1}
                  onClick={() => setVisitsPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Poprzednia
                </button>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '0 6px' }}>
                  {visitsPage} / {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={visitsPage >= totalPages}
                  onClick={() => setVisitsPage((p) => Math.min(totalPages, p + 1))}
                >
                  Następna <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===================== TAB: ORDERS ===================== */}
        {tab === 'orders' && (
          <>
            <div className="stats">
              <div className="lavender">
                <small>Wszystkie zgłoszenia</small>
                <strong>{orders.length}</strong>
              </div>
              <div className="yellow">
                <small>Czekają na kontakt</small>
                <strong>{orders.filter((o) => o.status === 'nowe').length}</strong>
              </div>
              <div className="peach">
                <small>W realizacji</small>
                <strong>{orders.filter((o) => o.status === 'realizacja').length}</strong>
              </div>
              <div className="mint">
                <small>Osiągnięty efekt</small>
                <strong>{orders.filter((o) => ['efekt', 'rozliczone'].includes(o.status)).length}</strong>
              </div>
            </div>
            <div className="table-toolbar">
              <div className="search-box">
                <Search size={20} />
                <input
                  aria-label="Szukaj zleceń"
                  placeholder="Szukaj firmy, numeru, e-maila…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                aria-label="Filtr statusu"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Wszystkie statusy</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Firma / zgłoszenie</th>
                    <th>Usługa</th>
                    <th>Status</th>
                    <th>Płatność</th>
                    <th>Kwota brutto</th>
                    <th>Data UTC</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>{o.company}</strong>
                        <small>{o.reference}</small>
                      </td>
                      <td>{serviceName(o.service_id)}</td>
                      <td>
                        <span className={'status-badge ' + o.status}>{statusLabels[o.status]}</span>
                      </td>
                      <td>{paymentLabels[o.payment_status] || o.payment_status}</td>
                      <td>{money(o.price_cents)}</td>
                      <td>{o.created_at.slice(0, 10)}</td>
                      <td>
                        <button
                          className="circle"
                          aria-label={'Otwórz ' + o.reference}
                          onClick={() => setSelected(o)}
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visibleOrders.length && (
                <div className="empty-state">
                  <Inbox size={36} />
                  <h3>{query || filter ? 'Brak pasujących zgłoszeń' : 'Tu pojawią się zgłoszenia.'}</h3>
                  <p>Zgłoszenia pojawią się automatycznie.</p>
                </div>
              )}
            </div>
            <small className="muted">Panel pokazuje do 1000 najnowszych zgłoszeń.</small>
          </>
        )}

        {/* ===================== TAB: SERVICES ===================== */}
        {tab === 'services' && (
          <div className="admin-service-grid">
            {services.map((s) => (
              <form
                className="editor-card"
                key={s.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  saveContent({
                    type: 'service',
                    id: s.id,
                    priceCents:
                      f.get('price') === '' ? null : Math.round(Number(f.get('price')) * 100),
                    content: f.get('content'),
                  });
                }}
              >
                <h3>{s.name}</h3>
                <label>
                  Cena brutto w PLN
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={s.price_cents == null ? '' : s.price_cents / 100}
                    placeholder="Puste = wycena po weryfikacji"
                  />
                </label>
                <label>
                  Opis usługi
                  <textarea name="content" rows={3} required defaultValue={s.content} />
                </label>
                <button disabled={demo || busy} className="button dark small">
                  <Save size={16} /> Zapisz
                </button>
                <small>Nowa cena dotyczy nowych zgłoszeń.</small>
              </form>
            ))}
          </div>
        )}

        {/* ===================== TAB: PAGES ===================== */}
        {tab === 'pages' && (
          <>
            <label className="page-select">
              Wybierz podstronę
              <select value={pageSlug} onChange={(e) => setPageSlug(e.target.value)}>
                {pages.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    /{p.slug}
                  </option>
                ))}
              </select>
            </label>
            {currentPage && (
              <form
                className="editor-card"
                key={currentPage.slug}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  saveContent({
                    type: 'page',
                    page: {
                      ...currentPage,
                      title: f.get('title'),
                      eyebrow: f.get('eyebrow'),
                      intro: f.get('intro'),
                      sections: currentPage.sections.map((s, i) => ({
                        title: f.get('st' + i),
                        text: f.get('sx' + i),
                      })),
                      faq: currentPage.faq.map((s, i) => ({
                        question: f.get('fq' + i),
                        answer: f.get('fa' + i),
                      })),
                    },
                  });
                }}
              >
                <p className="notice">
                  Adres podstrony pozostaje bez zmian. Treści są zapisywane jako tekst, bez wykonywania HTML.
                </p>
                <label>
                  Tytuł sekcji / SEO
                  <input name="eyebrow" defaultValue={currentPage.eyebrow} required />
                </label>
                <label>
                  Nagłówek główny
                  <input name="title" defaultValue={currentPage.title} required />
                </label>
                <label>
                  Wprowadzenie
                  <textarea name="intro" rows={3} defaultValue={currentPage.intro} required />
                </label>
                {currentPage.sections.map((s, i) => (
                  <fieldset key={i}>
                    <legend>Sekcja {i + 1}</legend>
                    <label>
                      Nagłówek
                      <input name={'st' + i} defaultValue={s.title} required />
                    </label>
                    <label>
                      Treść
                      <textarea name={'sx' + i} rows={4} defaultValue={s.text} required />
                    </label>
                  </fieldset>
                ))}
                {currentPage.faq.map((f, i) => (
                  <fieldset key={i}>
                    <legend>Pytanie {i + 1}</legend>
                    <label>
                      Pytanie
                      <input name={'fq' + i} defaultValue={f.question} required />
                    </label>
                    <label>
                      Odpowiedź
                      <textarea name={'fa' + i} defaultValue={f.answer} required />
                    </label>
                  </fieldset>
                ))}
                <button disabled={demo || busy} className="button dark">
                  <Save size={18} /> Zapisz treść
                </button>
              </form>
            )}
          </>
        )}

        {/* ===================== TAB: ANALYTICS ===================== */}
        {tab === 'analytics' && (
          <>
            <div className="stats">
              {['page_view', 'form_start', 'order_created'].map((s, i) => (
                <div className={['lavender', 'yellow', 'mint'][i]} key={s}>
                  <small>
                    {['Wyświetlenia stron', 'Rozpoczęcia formularza', 'Wysłane zgłoszenia'][i]}
                  </small>
                  <strong>{traffic.find((x) => x.event === s)?.total || 0}</strong>
                  <small>Ostatnie 30 dni • za zgodą</small>
                </div>
              ))}
            </div>
            <div className="editor-card">
              <h3>Źródła pozyskanych zleceń</h3>
              <p>
                Źródło i słowo kluczowe pochodzą z parametrów kampanii. Nie oznaczają pełnego zapytania
                wpisanego w wyszukiwarce.
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Firma</th>
                      <th>Źródło</th>
                      <th>Kampania</th>
                      <th>Fraza (utm_term)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const a =
                        typeof o.attribution === 'string'
                          ? JSON.parse(o.attribution)
                          : o.attribution || {};
                      return (
                        <tr key={o.id}>
                          <td>{o.company}</td>
                          <td>{a.utm_source || 'Brak danych'}</td>
                          <td>{a.utm_campaign || '—'}</td>
                          <td>{a.utm_term || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="editor-card">
              <h3>Kolejka wiadomości e-mail</h3>
              {mail.length ? (
                mail.map((m) => (
                  <p key={m.status}>
                    {m.status}: <strong>{m.total}</strong>
                  </p>
                ))
              ) : (
                <p>Brak wiadomości w kolejce.</p>
              )}
              <small>Wysyłka wymaga działającego zadania mail:worker oraz konfiguracji SMTP.</small>
            </div>
          </>
        )}
      </section>

      {/* ===================== VISIT DETAILS DRAWER ===================== */}
      {selectedVisit && (
        <div className="drawer-backdrop" onClick={() => setSelectedVisit(null)}>
          <section
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Szczegóły wizyty"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-drawer icon-button"
              aria-label="Zamknij"
              onClick={() => setSelectedVisit(null)}
            >
              <X />
            </button>
            <span className="eyebrow">
              {selectedVisit.action || selectedVisit.search_type?.toUpperCase() || 'WIZYTA'} •{' '}
              {selectedVisit.visit_time || selectedVisit.created_at}
            </span>
            <h2>{selectedVisit.company_name || selectedVisit.phone_number || selectedVisit.keyword || 'Zdarzenie wizyty'}</h2>

            <div className="contact-box">
              <strong>🌐 Sieć i Lokalizacja</strong>
              <span>IP: {selectedVisit.ip_address}</span>
              <span>
                Lokalizacja:{' '}
                {[selectedVisit.city, selectedVisit.region, selectedVisit.country].filter(Boolean).join(', ') || 'Brak'}
              </span>
              <span>Referrer: {selectedVisit.referrer || 'Bezpośrednie wejście'}</span>
            </div>

            <div className="contact-box">
              <strong>📱 Urządzenie i Fingerprint</strong>
              <span>
                Fingerprint hash: <code>{selectedVisit.fingerprint_hash || 'Brak'}</code>
                {fingerprintCounts[selectedVisit.fingerprint_hash] > 1 && (
                  <small style={{ display: 'block', color: '#6b21a8', fontWeight: 700 }}>
                    Ten użytkownik wykonał {fingerprintCounts[selectedVisit.fingerprint_hash]} wizyt/akcji na stronie!
                  </small>
                )}
              </span>
              <span>Platforma: {selectedVisit.platform || 'Nieznana'}</span>
              <span>Ekran: {selectedVisit.screen_resolution || 'Nieznana'}</span>
              <span>Język: {selectedVisit.language || 'Nieznany'}</span>
              <span>Strefa czasowa: {selectedVisit.timezone || 'Nieznana'}</span>
              <span>Rdzenie CPU: {selectedVisit.hardware_concurrency || 'Nieznane'}</span>
              <span>Pamięć RAM: {selectedVisit.device_memory ? `${selectedVisit.device_memory} GB` : 'Nieznana'}</span>
              <span>Połączenie: {selectedVisit.connection_type || 'Nieznane'}</span>
              <span>Cookies: {selectedVisit.cookie_enabled || 'Tak'}</span>
              {selectedVisit.user_agent && (
                <small style={{ marginTop: '6px', wordBreak: 'break-all' }}>
                  User-Agent: {selectedVisit.user_agent}
                </small>
              )}
            </div>

            {(selectedVisit.utm_source ||
              selectedVisit.utm_campaign ||
              selectedVisit.utm_term ||
              selectedVisit.keyword ||
              selectedVisit.gclid ||
              selectedVisit.campaign_id) && (
              <div className="contact-box">
                <strong>🎯 Kampania i Marketing</strong>
                {selectedVisit.utm_source && <span>Źródło (UTM Source): {selectedVisit.utm_source}</span>}
                {selectedVisit.utm_medium && <span>Medium: {selectedVisit.utm_medium}</span>}
                {selectedVisit.utm_campaign && <span>Kampania (UTM Campaign): {selectedVisit.utm_campaign}</span>}
                {selectedVisit.utm_term && <span>Fraza (UTM Term): {selectedVisit.utm_term}</span>}
                {selectedVisit.keyword && <span>Słowo kluczowe: {selectedVisit.keyword}</span>}
                {selectedVisit.campaign_id && <span>Campaign ID: {selectedVisit.campaign_id}</span>}
                {selectedVisit.gad_source && <span>Source ID: {selectedVisit.gad_source}</span>}
                {selectedVisit.placement && <span>Placement: {selectedVisit.placement}</span>}
                {selectedVisit.gclid && <span style={{ wordBreak: 'break-all' }}>GCLID: {selectedVisit.gclid}</span>}
              </div>
            )}

            {(selectedVisit.company_name || selectedVisit.company_nip) && (
              <div className="contact-box">
                <strong>🏢 Szczegóły wyszukanej firmy</strong>
                {selectedVisit.company_name && <span>Nazwa: {selectedVisit.company_name}</span>}
                {selectedVisit.company_nip && <span>NIP: {selectedVisit.company_nip}</span>}
                {selectedVisit.company_regon && <span>REGON: {selectedVisit.company_regon}</span>}
                {selectedVisit.company_address && <span>Adres: {selectedVisit.company_address}</span>}
                {selectedVisit.company_phone && <span>Telefon: {selectedVisit.company_phone}</span>}
                {selectedVisit.company_website && (
                  <span>
                    WWW:{' '}
                    <a href={selectedVisit.company_website} target="_blank" rel="noreferrer">
                      {selectedVisit.company_website}
                    </a>
                  </span>
                )}
                {selectedVisit.company_rating && (
                  <span>
                    Ocena: ★ {selectedVisit.company_rating} ({selectedVisit.company_reviews_count || 0} opinii)
                  </span>
                )}
                {selectedVisit.place_id && <span>Google Place ID: {selectedVisit.place_id}</span>}
              </div>
            )}

            {selectedVisit.company_data && (
              <div>
                <strong>Surowe dane w formacie JSON</strong>
                <pre
                  style={{
                    background: '#0b1120',
                    color: '#38bdf8',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    overflowX: 'auto',
                    maxHeight: '260px',
                    marginTop: '8px',
                  }}
                >
                  {JSON.stringify(
                    typeof selectedVisit.company_data === 'string'
                      ? JSON.parse(selectedVisit.company_data)
                      : selectedVisit.company_data,
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ===================== ORDER DETAILS DRAWER ===================== */}
      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <section
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Szczegóły zlecenia"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-drawer icon-button"
              aria-label="Zamknij szczegóły"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <span className="eyebrow">{selected.reference}</span>
            <h2>{selected.company}</h2>
            <p>{serviceName(selected.service_id)}</p>
            <div className="contact-box">
              <a href={'mailto:' + selected.email}>{selected.email}</a>
              <span>{selected.phone}</span>
              {selected.profile_url && /^https?:\/\//.test(selected.profile_url) && (
                <a href={selected.profile_url} target="_blank" rel="noreferrer">
                  Otwórz profil ↗
                </a>
              )}
            </div>
            {selected.billing_name && (
              <div className="contact-box">
                <strong>Dane do faktury</strong>
                <span>{selected.billing_name}</span>
                {selected.billing_nip && <span>NIP: {selected.billing_nip}</span>}
                <span>{selected.billing_address}</span>
              </div>
            )}
            <p>
              <strong>Płatność:</strong> {paymentLabels[selected.payment_status] || selected.payment_status}
            </p>
            <p>
              <strong>Frazy:</strong> {selected.keywords || 'Nie podano'}
            </p>
            <p className="pre-wrap">{selected.description}</p>
            {err && <p className="error">{err}</p>}
            <form onSubmit={saveOrder}>
              <label>
                Status
                <select name="status" defaultValue={selected.status}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Uzgodniona cena brutto (PLN)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={selected.price_cents == null ? '' : selected.price_cents / 100}
                  readOnly={!['not_required', 'after_result'].includes(selected.payment_status)}
                />
              </label>
              <label>
                Uzgodniony efekt — widoczny dla klienta
                <textarea name="goal" defaultValue={selected.goal || ''} rows={3} />
              </label>
              <label>
                Notatki wewnętrzne
                <textarea name="notes" defaultValue={selected.notes || ''} rows={3} />
              </label>
              <label>
                Komunikat dla klienta — trafi do historii i kolejki e-mail
                <textarea name="message" rows={3} />
              </label>
              <button className="button dark full" disabled={busy || demo}>
                <Save size={18} />
                {busy ? 'Zapisywanie…' : 'Zapisz zmiany'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
