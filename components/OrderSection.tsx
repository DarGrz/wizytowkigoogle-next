import OrderForm from './OrderForm';
import { hasDatabase } from '@/lib/db';
import { portalServices, type OrderContext } from '@/lib/order-services';

export default function OrderSection({ service, context }: { service?: string; context?: OrderContext }) {
  const mode = context || (service === 'ochrona-wizerunku' || portalServices.some((item) => item.id === service) ? 'reputation' : 'google');
  const reputation = mode === 'reputation';
  return <section className={`order-section${reputation ? ' reputation-order' : ''}`} id="zlecenie">
    <div className="wrap order-grid">
      <div className="order-story">
        <p className="eyebrow">{reputation ? 'Dobry wizerunek zaczyna się od rozmowy' : 'Zróbmy pierwszy krok'}</p>
        <h2>{reputation ? <>Twoja firma.<br />Twoja reputacja.<br />Nasz plan działania</> : <>Zacznijmy<br />od Twojej firmy</>}<span className="accent">.</span></h2>
        <p>{reputation ? 'Pokaż nam, co wymaga uwagi. Sprawdzimy podstawy zgłoszenia i możliwe rozwiązania.' : <>Ty znasz swój biznes.<br />My pomożemy mu dać się znaleźć.</>}</p>
        <ol className="steps">
          <li><span>1</span><div><h3>{reputation ? 'Wybierasz miejsce i usługę' : 'Wypełniasz formularz'}</h3><p>{reputation ? 'Mapy Google czy portal z opiniami? Znajdź firmę i opisz problem.' : 'Podaj podstawowe informacje o firmie i wybierz usługę.'}</p></div></li>
          <li><span>2</span><div><h3>Potwierdzamy zakres i cel</h3><p>Sprawdzamy możliwości. Ustalamy warunki i cenę przed startem.</p></div></li>
          <li><span>3</span><div><h3>{reputation ? 'Zgłaszamy i monitorujemy' : 'Realizacja i wyniki'}</h3><p>{reputation ? 'Przygotowujemy uzasadnienie prawne i formalne zgłoszenie do platformy.' : 'Działamy według ustalonego planu i na bieżąco realizujemy uzgodnione etapy.'}</p></div></li>
        </ol>
        <div className="hand-note">{reputation ? 'Spokojnie. Krok po kroku.' : 'Jasno, po ludzku.'}<span>↗</span></div>
      </div>
      <OrderForm service={service} context={mode} enabled={hasDatabase()} />
    </div>
  </section>;
}
