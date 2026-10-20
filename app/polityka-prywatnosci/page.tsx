import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności i plików cookies',
  description: 'Informacje o przetwarzaniu danych osobowych, plikach cookies, technologiach lokalnych i analityce w serwisie wizytowkigoogle.pl.',
  alternates: { canonical: '/polityka-prywatnosci' },
};

export default function Privacy() {
  return (
    <main id="main" className="wrap legal">
      <span className="pill">Prywatność i Cookies</span>
      <h1>Polityka prywatności i plików cookies.</h1>
      <p>Serwis wizytowkigoogle.pl · Ostatnia aktualizacja: 20 października 2026 r.</p>
      <p>Niniejsza polityka wyjaśnia zasady przetwarzania danych osobowych oraz korzystania z plików cookies i technologii pamięci przeglądarki w serwisie wizytowkigoogle.pl.</p>

      <h2>1. Administrator danych i kontakt</h2>
      <p>Administratorem danych osobowych jest Dariusz Grzegorczyk, NIP: 6782978644, adres: Osiedle Oświecenia 57, 31-636 Kraków. W sprawach związanych z danymi osobowymi oraz realizacją praw RODO możesz skontaktować się mailowo pod adresem: <a href="mailto:kontakt@wizytowkigoogle.pl">kontakt@wizytowkigoogle.pl</a> lub korespondencyjnie na podany adres siedziby.</p>

      <h2>2. Jakie dane przetwarzamy</h2>
      <ul>
        <li><strong>Dane kontaktowe:</strong> imię i nazwisko lub nazwa firmy, adres e-mail, numer telefonu oraz treść wiadomości przekazana podczas kontaktu telefonicznego lub mailowego.</li>
        <li><strong>Dane techniczne i eksploatacyjne:</strong> adres IP, data i godzina zapytania, informacje o przeglądarce i systemie operacyjnym zawarte w nagłówkach HTTP (logi serwera niezbędne do zapewnienia stabilności i bezpieczeństwa serwisu).</li>
        <li><strong>Dane analityczne (wyłącznie za Twoją zgodą):</strong> anonimizowane parametry sesji, źródło odwiedzin (np. parametry UTM), przeglądane podstrony i zdarzenia w serwisie.</li>
      </ul>

      <h2>3. Cele i podstawy prawne przetwarzania</h2>
      <ul>
        <li><strong>Odpowiedź na zapytanie i obsługa kontaktu:</strong> art. 6 ust. 1 lit. b RODO (działania na żądanie osoby przed zawarciem umowy) oraz art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes administratora w komunikacji z klientami).</li>
        <li><strong>Rozliczenia i obowiązki księgowo-podatkowe:</strong> art. 6 ust. 1 lit. c RODO (wypełnienie obowiązków prawnych ciążących na administratorze).</li>
        <li><strong>Zapewnienie bezpieczeństwa i obrona przed roszczeniami:</strong> art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes w ochronie serwisu i dochodzeniu lub obronie praw).</li>
        <li><strong>Analityka i statystyka:</strong> art. 6 ust. 1 lit. a RODO (dobrowolna zgoda użytkownika wyrażona za pośrednictwem banera prywatności).</li>
      </ul>

      <h2>4. Pliki cookies i technologie w przeglądarce</h2>
      <p>Serwis wykorzystuje technologie przechowywania danych w przeglądarce (pliki cookies, localStorage oraz sessionStorage) w celu prawidłowego działania strony oraz – za Twoją zgodą – do celów analitycznych.</p>
      <ul>
        <li><strong>localStorage — wg-consent:</strong> przechowuje informację o wybranym statusie zgody na analitykę („yes” lub „no”), aby nie wyświetlać banera przy każdej wizycie. Przechowywany do momentu wyczyszczenia danych witryny w przeglądarce lub zmiany wyboru przez użytkownika.</li>
        <li><strong>sessionStorage — wg-session i wg-attribution:</strong> za zgodą użytkownika przechowują tymczasowy identyfikator sesji oraz źródło wejścia. Usuwane automatycznie po zamknięciu karty lub przeglądarki.</li>
        <li><strong>Techniczne cookies sesyjne:</strong> tymczasowe dane niezbędne do bezpiecznego działania strony i zabezpieczenia przed nadużyciami.</li>
      </ul>
      <p>W każdej chwili możesz zmienić lub wycofać swoją zgodę, klikając przycisk <strong>„Ustawienia prywatności”</strong> w stopce strony i wybierając opcję „Tylko niezbędne”. Możesz również zablokować lub usunąć pliki cookies bezpośrednio w ustawieniach swojej przeglądarki internetowej.</p>

      <h2>5. Odbiorcy danych</h2>
      <p>Dane mogą być przekazywane podmiotom świadczącym usługi na naszą rzecz: dostawcom hostingu, infrastruktury IT, operatorom poczty elektronicznej oraz podmiotom świadczącym obsługę księgową i prawną – wyłącznie na podstawie umów powierzenia przetwarzania danych osobowych. Dane mogą zostać udostępnione organom państwowym na podstawie przepisów prawa.</p>

      <h2>6. Przekazywanie danych poza EOG</h2>
      <p>W związku z korzystaniem z usług Google (np. interaktywne API Google Maps) dane mogą być przekazywane poza Europejski Obszar Gospodarczy. Podstawą takiego przekazania są standardowe klauzule umowne zatwierdzone przez Komisję Europejską lub program EU–US Data Privacy Framework, gwarantujące odpowiedni poziom ochrony danych.</p>

      <h2>7. Okres przechowywania danych</h2>
      <ul>
        <li><strong>Korespondencja i zapytania:</strong> przez czas trwania kontaktu, a następnie przez okres przedawnienia ewentualnych roszczeń (zazwyczaj do 3 lat).</li>
        <li><strong>Dokumentacja księgowa:</strong> przez wymagany przepisami prawa okres 5 lat od końca roku kalendarzowego, w którym upłynął termin płatności podatku.</li>
        <li><strong>Dane analityczne:</strong> przechowywane przez okres do 90 dni, po czym są automatycznie usuwane.</li>
      </ul>

      <h2>8. Twoje prawa</h2>
      <p>Na podstawie przepisów RODO przysługuje Ci prawo do:</p>
      <ul>
        <li>dostępu do swoich danych osobowych oraz otrzymania ich kopii,</li>
        <li>sprostowania (poprawienia) nieprawidłowych danych,</li>
        <li>usunięcia danych („prawo do bycia zapomnianym”),</li>
        <li>ograniczenia przetwarzania danych,</li>
        <li>wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,</li>
        <li>przenoszenia danych,</li>
        <li>cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania przed jej wycofaniem),</li>
        <li>wniesienia skargi do organu nadzorczego: Prezes Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, <a href="https://uodo.gov.pl/" target="_blank" rel="noreferrer">uodo.gov.pl</a>).</li>
      </ul>
      <p>W celu realizacji swoich praw skontaktuj się z nami pod adresem <a href="mailto:kontakt@wizytowkigoogle.pl">kontakt@wizytowkigoogle.pl</a>.</p>

      <h2>9. Dobrowolność podania danych</h2>
      <p>Podanie danych osobowych jest dobrowolne, jednak niezbędne do nawiązania kontaktu lub realizacji usług. Wyrażenie zgody na pliki cookies analityczne jest w pełni opcjonalne i nie wpływa na możliwość przeglądania serwisu.</p>
    </main>
  );
}
