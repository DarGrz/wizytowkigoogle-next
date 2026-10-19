"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Building2, Check, Globe2, MapPin, MessageSquareWarning, ShieldCheck, X } from 'lucide-react';
import { isEligiblePortalProfileCompany, suggestProfileRemoval } from '@/lib/company';
import type { BusinessSource } from '@/lib/order-services';
import { formatPln, reputationPortalsQuote, reputationQuote, reviewPortals, type ReviewPortal, type ReputationTarget } from '@/lib/reputation-pricing';
import BusinessLookup, { type BusinessSelection } from './BusinessLookup';
import OrderForm from './OrderForm';
import type { LandingSelection } from '@/lib/service-landings';

const sourceTitles = ['Skąd chcesz usunąć?', 'Co chcesz usunąć?'];

export default function ReputationOrder({ enabled, initialSelection }: { enabled: boolean; initialSelection?: LandingSelection }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [source, setSource] = useState<BusinessSource>('google');
  const [target, setTarget] = useState<ReputationTarget>('reviews');
  const [portal, setPortal] = useState<ReviewPortal>('google');
  const [selectedPortals, setSelectedPortals] = useState<ReviewPortal[]>([]);
  const [business, setBusiness] = useState<BusinessSelection | null>(null);
  const [manual, setManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  const portalProfile = source === 'portals' && target === 'profile';
  const businessStep = source === 'portals' ? portalProfile ? 3 : 4 : 3;
  const contactStep = source === 'portals' ? portalProfile ? 4 : 5 : 4;
  const stageTitles = source === 'google'
    ? [...sourceTitles, 'Znajdź swoją firmę.', 'Dane kontaktowe i płatność']
    : portalProfile
      ? [...sourceTitles, 'Podaj NIP i wybierz portale', 'Dane kontaktowe i płatność']
      : [...sourceTitles, 'Wybierz portal', 'Znajdź swoją firmę.', 'Dane kontaktowe i płatność'];
  const activeStep = step;

  useEffect(() => {
    function launch(element?: HTMLElement) {
      trigger.current = element || null;
      setStep(initialSelection ? initialSelection.source === 'portals' && initialSelection.target === 'reviews' ? 4 : 3 : 1);
      setSource(initialSelection?.source || 'google');
      setTarget(initialSelection?.target || 'reviews');
      setPortal(initialSelection?.portal || 'google');
      setSelectedPortals(initialSelection?.portal ? [initialSelection.portal] : []);
      setBusiness(null);
      setManual(false);
      setManualName('');
      setComplete(false);
      setOpen(true);
    }
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const element = event.target.closest<HTMLElement>('a[href="#zlecenie"], [data-open-reputation]');
      if (!element?.closest('.reputation-page')) return;
      event.preventDefault();
      launch(element);
    };
    const onHash = () => { if (location.hash === '#zlecenie') launch(); };
    const onOpen = (event: Event) => launch(event instanceof CustomEvent && event.detail instanceof HTMLElement ? event.detail : undefined);
    document.addEventListener('click', onClick, true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('open-reputation-order', onOpen);
    onHash();
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('hashchange', onHash); window.removeEventListener('open-reputation-order', onOpen); };
  }, [initialSelection]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.current?.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      heading.current?.focus();
      dialog.current?.scrollTo({ top: 0 });
    }
  }, [step, open, complete]);

  const recommendation = business && target === 'reviews' && suggestProfileRemoval(source, target, business.registryCompany);
  const service = source === 'portals'
    ? target === 'reviews' ? 'usuwanie-opinii-portale' : 'usuwanie-profili'
    : target === 'reviews' ? 'usuwanie-opinii' : 'usuwanie-wizytowki';
  const sourceLabel = source === 'google' ? 'Mapy Google' : 'Strony z opiniami';
  const canRemovePortalProfile = isEligiblePortalProfileCompany(business?.registryCompany);
  const quotePortals = source === 'google' ? ['google' as const] : selectedPortals;
  const quote = quotePortals.length ? reputationPortalsQuote(target, quotePortals) : reputationQuote(target, source === 'google' ? 'google' : portal);

  function chooseSource(value: BusinessSource) {
    setSource(value);
    setBusiness(null);
    setTarget('reviews');
    setPortal(value === 'google' ? 'google' : 'aleo');
    setSelectedPortals(value === 'google' ? ['google'] : []);
    setManual(false);
    setManualName('');
    setStep(2);
  }

  function priceSummary() {
    if (quote.kind === 'result') {
      return quote.totalCents === null || quote.netCents === null
        ? 'Wycena po bezpłatnej analizie. Warunki współpracy potwierdzamy przed rozpoczęciem.'
        : `${formatPln(quote.netCents)} netto (${formatPln(quote.totalCents)} brutto) za skuteczne usunięcie opinii. Warunki potwierdzamy przed realizacją.`;
    }
    return `${formatPln(quote.netCents)} netto · ${formatPln(quote.totalCents)} brutto. Płatność PayU teraz, przed rozpoczęciem realizacji.`;
  }

  return <>
    <section id="zlecenie" className="rep-start-section">
      <div className="wrap rep-start">
        <div><p className="eyebrow">Zacznijmy od Twojej sprawy</p><h2>Kilka prostych pytań.<br />Jeden konkretny plan.</h2><p>Wybierz miejsce, wskaż opinię lub profil i znajdź swoją firmę. Resztę ustalimy razem.</p></div>
        <div><button type="button" className="button dark" data-open-reputation>Zgłoś swoją sprawę <ArrowUpRight size={21} /></button><small><ShieldCheck size={16} /> Bezpłatna analiza zgłoszenia i wycena przed rozpoczęciem.</small></div>
      </div>
    </section>
    <dialog ref={dialog} className="rep-dialog" aria-labelledby="reputation-dialog-title"
      onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!busy) setOpen(false); } }}
      onCancel={(event) => { event.preventDefault(); if (!busy) setOpen(false); }}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target !== event.currentTarget || busy) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false);
      }}>
      {open && <>
        <header className="rep-dialog-header">
          <span><ShieldCheck size={18} /> Ochrona wizerunku</span>
          <button type="button" onClick={() => setOpen(false)} disabled={busy} aria-label="Zamknij zgłoszenie"><X size={22} /></button>
        </header>
        <div className="rep-dialog-body">
          <div className="rep-progress" aria-label={`Krok ${activeStep} z ${stageTitles.length}`}>{stageTitles.map((title, index) => <span key={title} className={index < activeStep ? 'active' : ''} />)}</div>
          <p className="eyebrow">{complete ? 'Dziękujemy za zgłoszenie' : `Krok ${activeStep} z ${stageTitles.length}`}</p>
          <h2 ref={heading} tabIndex={-1} id="reputation-dialog-title">{complete ? 'Twoja sprawa została zapisana.' : stageTitles[activeStep - 1]}</h2>
          {step > 1 && !complete && <p className="rep-path">{sourceLabel}{step > 2 && <> <span>→</span> {target === 'reviews' ? 'Opinie' : 'Profil firmy'}{source === 'portals' && step > 3 && <> <span>→</span> {reviewPortals.filter((item) => selectedPortals.includes(item.id)).map((item) => item.name).join(', ') || reviewPortals.find((item) => item.id === portal)?.name}</>}</>}</p>}
          {step === 1 && <>
            <p className="rep-dialog-intro">Najpierw wybierz miejsce, w którym pojawił się problem.</p>
            <div className="rep-choice-grid">
              <button type="button" className="rep-choice lavender" onClick={() => chooseSource('google')}><MapPin size={32} /><strong>Mapy Google</strong><span>Opinie lub wizytówka Twojej firmy w Google.</span><ArrowUpRight size={22} /></button>
              <button type="button" className="rep-choice mint" onClick={() => chooseSource('portals')}><Globe2 size={32} /><strong>Strony z opiniami</strong><span>GoWork, Aleo, Panorama Firm i inne portale.</span><ArrowUpRight size={22} /></button>
            </div>
          </>}
          {step === 2 && <>
            <p className="rep-dialog-intro">Wybierz zakres zgłoszenia. Później możesz go zmienić.</p>
            <div className="rep-choice-grid">
              <button type="button" className="rep-choice peach" onClick={() => { setTarget('reviews'); setSelectedPortals(source === 'google' ? ['google'] : []); setStep(source === 'portals' ? 3 : businessStep); }}><MessageSquareWarning size={32} /><strong>Opinie</strong><span>Jedna lub kilka opinii naruszających zasady serwisu.</span><ArrowUpRight size={22} /></button>
              <button type="button" className="rep-choice yellow" onClick={() => { setTarget('profile'); setSelectedPortals([]); if (source === 'portals') { setBusiness(null); setManual(false); } setStep(source === 'portals' ? 3 : businessStep); }}><Building2 size={32} /><strong>Profil firmy</strong><span>{source === 'google' ? 'Usunięcie wizytówki firmy w Mapach Google.' : 'Usunięcie całego profilu firmy z portalu.'}</span><ArrowUpRight size={22} /></button>
            </div>
          </>}
          {step === 3 && source === 'portals' && !portalProfile && <>
            <p className="rep-dialog-intro">Wybierz portal, którego dotyczy sprawa.</p>
            <div className="rep-portal-list">{reviewPortals.map((item) => <button type="button" key={item.id} className={portal === item.id ? 'selected' : ''} onClick={() => { setPortal(item.id); setSelectedPortals([item.id]); setStep(businessStep); }}><Globe2 size={20} /><strong>{item.name}</strong><ArrowUpRight size={18} /></button>)}</div>
          </>}
          {((step === 3 && source === 'google') || step === businessStep) && <>
            <p className="rep-dialog-intro">{source === 'portals' ? 'Podaj NIP. Pobierzemy dane firmy i sprawdzimy jej formę prawną w GUS.' : 'Wpisz nazwę i miejscowość, a następnie wybierz swoją wizytówkę.'}</p>
            {!manual && <BusinessLookup key={source} source={source} onSelect={setBusiness} onClearSelection={() => { setBusiness(null); if (portalProfile) setSelectedPortals([]); }} autoSelectSingle={source === 'portals'} allowManualEntry={!portalProfile} />}
            {!business && !portalProfile && <button type="button" className="text-link rep-manual-toggle" onClick={() => setManual(!manual)}>{manual ? 'Wróć do wyszukiwarki' : 'Nie znajduję firmy — wpiszę dane ręcznie'}</button>}
            {manual && !business && !portalProfile && <form className="rep-manual-form" onSubmit={(event) => { event.preventDefault(); setBusiness({ company: manualName.trim(), profileUrl: '', address: '' }); }}>
              <label>Nazwa firmy<input required minLength={2} maxLength={200} value={manualName} onChange={(event) => setManualName(event.target.value)} /></label>
              <p>Bez danych GUS nie rozpoznamy formy prawnej. Zweryfikujemy ją indywidualnie po zgłoszeniu.</p>
              <button className="button outline small" disabled={manualName.trim().length < 2}>Użyj tych danych <Check size={16} /></button>
            </form>}
            {business && <div className="rep-selected-company">
              <div><Building2 size={23} /><strong>{business.company}</strong></div>
              {business.address && <p>{business.address}</p>}
              {business.registryCompany && <small>NIP: {business.registryCompany.nip} · REGON: {business.registryCompany.regon}<br />{business.registryCompany.legalFormLabel || 'Forma prawna nierozpoznana — wymaga indywidualnej weryfikacji.'}</small>}
              <button type="button" className="text-link" onClick={() => { setBusiness(null); if (portalProfile) setSelectedPortals([]); }}>Zmień firmę</button>
            </div>}
            {business && portalProfile && !canRemovePortalProfile && <p className="rep-eligibility-warning" role="alert">
              {business.registryCompany?.legalForm === 'other'
                ? `Przykro nam — realizacja usunięcia profilu nie jest możliwa dla tej formy prawnej (${business.registryCompany.legalFormLabel || 'według danych GUS'}). Obsługujemy wyłącznie JDG i spółki cywilne zarejestrowane w CEIDG.`
                : 'Nie możemy potwierdzić w GUS, że firma jest JDG lub spółką cywilną wpisaną do CEIDG. Z tego powodu nie możemy przyjąć zgłoszenia usunięcia profilu.'}
            </p>}
            {business && portalProfile && canRemovePortalProfile && <>
              <p className="rep-dialog-intro">Wybierz jeden lub kilka profili do usunięcia. Cena za każdy portal jest widoczna poniżej.</p>
              <div className="rep-portal-list">{reviewPortals.map((item) => {
                const itemQuote = reputationQuote('profile', item.id);
                const checked = selectedPortals.includes(item.id);
                if (itemQuote.kind !== 'payu') return null;
                return <button type="button" key={item.id} className={checked ? 'selected' : ''} role="checkbox" aria-checked={checked} onClick={() => {
                  setSelectedPortals((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]);
                }}>
                  <span className="rep-portal-check">{checked ? <Check size={15} /> : null}</span>
                  <strong>{item.name}</strong>
                  <span className="rep-portal-price">{formatPln(itemQuote.netCents)} netto<br />{formatPln(itemQuote.totalCents)} brutto</span>
                </button>;
              })}</div>
              {selectedPortals.length > 0 && <p className="rep-selected-total"><strong>Łącznie:</strong> {formatPln(quote.netCents!)} netto · {formatPln(quote.totalCents!)} brutto</p>}
            </>}
            {recommendation && <aside className="rep-recommendation" aria-labelledby="recommendation-title">
              <span className="pill mint"><ShieldCheck size={15} /> Propozycja dla Twojej firmy</span>
              <h3 id="recommendation-title">Rozważ usunięcie całego profilu.</h3>
              <p>GUS wskazuje {business.registryCompany?.legalForm === 'sole-trader' ? 'jednoosobową działalność gospodarczą' : 'spółkę cywilną'}. Zamiast zgłaszać poszczególne opinie, możemy sprawdzić podstawy do usunięcia całego profilu firmy z portalu.</p>
              <small>Forma prawna nie gwarantuje usunięcia. Możliwości zależą od okoliczności sprawy, przepisów i zasad portalu.</small>
              <button type="button" className="button dark full" onClick={() => { setTarget('profile'); setStep(source === 'portals' ? 4 : contactStep); }}>Wybieram usuwanie profilu <ArrowUpRight size={19} /></button>
              <button type="button" className="text-link" onClick={() => setStep(contactStep)}>Pozostaję przy usuwaniu opinii</button>
            </aside>}
            {business && !recommendation && (!portalProfile || canRemovePortalProfile) && (!portalProfile || selectedPortals.length > 0) && <button type="button" className="button dark full rep-next" onClick={() => setStep(contactStep)}>Dalej — dane kontaktowe <ArrowUpRight size={19} /></button>}
          </>}
          {business && step === contactStep && <div>
            {!complete && <>
              <div className="rep-summary"><Check size={18} /><span><strong>{quote.serviceName}</strong> · {sourceLabel}{source === 'portals' && <> · {reviewPortals.filter((item) => selectedPortals.includes(item.id)).map((item) => item.name).join(', ') || reviewPortals.find((item) => item.id === portal)?.name}</>}<br />{business.company}<br /><small>{priceSummary()}</small></span></div>
            </>}
            <OrderForm key={`${source}:${selectedPortals.join(',')}:${target}:${service}:${business.registryCompany?.regon || business.company}:${business.profileUrl}`} context="reputation" enabled={enabled} preset={{ source, service, business, target, portal: source === 'google' ? 'google' : selectedPortals[0] || portal, portals: quotePortals }} onBusyChange={setBusy} onComplete={() => setComplete(true)} />
          </div>}
          {step > 1 && !complete && <button type="button" className="rep-back text-link" disabled={busy} onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> Wstecz</button>}
          <p className="rep-dialog-safety"><ShieldCheck size={15} /> Analizujemy możliwości. Nie obiecujemy usunięcia każdej treści.</p>
        </div>
      </>}
    </dialog>
  </>;
}
