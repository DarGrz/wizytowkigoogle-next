import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  description: 'Informacje o przetwarzaniu danych, formularzach, płatnościach, analityce i ustawieniach prywatności w wizytowkigoogle.pl.',
  alternates: { canonical: '/polityka-prywatnosci' },
};

export default function Privacy() {
  return <main id="main" className="wrap legal">
    <span className="pill">Prywatność</span>
    <h1>Polityka prywatności.</h1>
    <p>Serwis wizytowkigoogle.pl · Wersja z 19 października 2026 r.</p>
    <p>Ta polityka wyjaśnia, jakie dane przetwarzamy podczas korzystania z serwisu, wyszukiwania firmy, kontaktu, składania zgłoszeń i realizacji usług. Opisuje również płatności oraz technologie zapisywane w przeglądarce.</p>

    <h2>1. Administrator danych i kontakt</h2>
    <p>Administratorem danych osobowych jest Dariusz Grzegorczyk, NIP: 6782978644, adres: Osiedle Oświecenia 57, 31-636 Kraków. W sprawach danych osobowych i realizacji swoich praw możesz napisać na <a href="mailto:kontakt@wizytowkigoogle.pl">kontakt@wizytowkigoogle.pl</a> lub na podany adres pocztowy.</p>
    <p>Informacje dotyczą danych osobowych, w tym danych przedsiębiorców będących osobami fizycznymi, reprezentantów i osób kontaktowych. Dane osoby prawnej jako takie nie zawsze są danymi osobowymi.</p>

    <h2>2. Jakie dane otrzymujemy</h2>
    <ul>
      <li><strong>Kontakt i zgłoszenia:</strong> nazwa firmy, e-mail, telefon, wybrana usługa, portale, link do profilu lub opinii, opis sprawy i informacje przekazane w korespondencji.</li>
      <li><strong>Dane rejestrowe:</strong> nazwa, NIP, REGON, adres oraz forma prawna firmy pobrane z GUS, a także dane wybranej wizytówki Google, w tym nazwa, adres i identyfikator profilu.</li>
      <li><strong>Obsługa zlecenia:</strong> numer i daty zgłoszenia, status, ustalony zakres, cena, rezultat, historia kontaktu, notatki niezbędne do realizacji i dane dotyczące płatności.</li>
      <li><strong>Faktury:</strong> wskazana nazwa firmy lub imię i nazwisko, adres oraz NIP, jeżeli został podany. Dane fakturowe mogą dotyczyć innego podmiotu niż firma objęta usługą.</li>
      <li><strong>Dane techniczne:</strong> dane żądań i logów serwera, adres IP oraz jego skrót służący bezpieczeństwu; za zgodą również dane analityczne opisane poniżej.</li>
    </ul>
    <p>Dane otrzymujemy przede wszystkim od Ciebie. Przy obsłudze sprawy mogą pochodzić również od upoważnionego przedstawiciela, z publicznych rejestrów i profili, od operatora płatności lub platformy, której dotyczy zgłoszenie. Nie przesyłaj haseł, kodów logowania ani informacji o zdrowiu i innych szczególnych kategorii danych, jeśli nie są konieczne do sprawy. Dane innych osób ogranicz do informacji rzeczywiście potrzebnych do oceny zgłoszenia.</p>

    <h2>3. Cele i podstawy przetwarzania</h2>
    <ul>
      <li><strong>Odpowiedź na zapytanie, przygotowanie oferty i realizacja umowy:</strong> art. 6 ust. 1 lit. b rozporządzenia (UE) 2016/679 (RODO), gdy jesteś stroną lub podejmujemy działania na Twoje żądanie przed zawarciem umowy.</li>
      <li><strong>Kontakt z przedstawicielem firmy i koordynacja zlecenia:</strong> art. 6 ust. 1 lit. f RODO — nasz uzasadniony interes polegający na prowadzeniu korespondencji i obsłudze relacji z klientem.</li>
      <li><strong>Rozliczenia, dokumentacja księgowa i obowiązki podatkowe:</strong> art. 6 ust. 1 lit. c RODO — obowiązki wynikające z przepisów prawa, w szczególności podatkowego i rachunkowego.</li>
      <li><strong>Bezpieczeństwo, przeciwdziałanie nadużyciom, obsługa reklamacji oraz ustalenie, dochodzenie lub obrona roszczeń:</strong> art. 6 ust. 1 lit. f RODO — uzasadniony interes w ochronie serwisu, klientów i naszych praw.</li>
      <li><strong>Opcjonalna analityka:</strong> art. 6 ust. 1 lit. a RODO — Twoja zgoda. Zgoda obejmuje także zapis lub odczyt informacji w urządzeniu, gdy wymagają jej przepisy Prawa komunikacji elektronicznej. Technologie ściśle niezbędne stosujemy w zakresie przewidzianym przez te przepisy.</li>
    </ul>
    <p>Potwierdzenie zapoznania się z polityką w formularzu nie jest zgodą na marketing ani na analitykę. Nie wymagamy zgody na analitykę do złożenia zgłoszenia.</p>

    <h2>4. Wyszukiwarki Google Maps i GUS</h2>
    <p>Gdy korzystasz z wyszukiwarki wizytówek, treść zapytania, np. nazwa firmy i miejscowość, trafia przez nasz serwer do API Google. Po wyborze profilu możemy pobrać jego szczegóły. Gdy wyszukujesz firmę po NIP, przekazujemy NIP do usługi BIR Głównego Urzędu Statystycznego. Raport według REGON pozwala pobrać formę prawną i sprawdzić zakres dostępnej obsługi.</p>
    <p>Wybrane dane firmy są dołączane do zgłoszenia po jego wysłaniu. Dla usuwania profili na portalach wymagamy weryfikacji rejestrowej, a przed zapisem zamówienia możemy ponownie sprawdzić dane w GUS. W pozostałych ścieżkach formularz umożliwia również ręczne wskazanie firmy. Sam wybór wyniku wyszukiwania nie potwierdza tożsamości ani prawa do reprezentowania podmiotu.</p>
    <p>Formularz automatycznie sprawdza formę prawną przy usuwaniu całych profili portalowych i może zablokować przejście dalej albo zaproponować inny zakres. To ograniczenie dostępności konkretnej usługi, nie ocena wiarygodności firmy. Jeśli wynik jest błędny lub dane nieaktualne, skontaktuj się z nami, aby sprawę zweryfikowała osoba. Nie stosujemy wyłącznie zautomatyzowanych decyzji wywołujących skutki prawne lub podobnie istotnie wpływających na osobę w rozumieniu art. 22 RODO.</p>

    <h2>5. Płatności i odbiorcy danych</h2>
    <p>Do danych mogą mieć dostęp upoważnione osoby obsługujące serwis oraz dostawcy hostingu, baz danych, infrastruktury informatycznej, poczty i wsparcia technicznego. W niezbędnym zakresie korzystamy także z obsługi księgowej i prawnej. Dostawcy działający w naszym imieniu przetwarzają dane na podstawie odpowiednich umów. Dane udostępniamy organom publicznym, gdy wymaga tego prawo.</p>
    <p>Jeżeli zlecasz obsługę opinii lub profilu, niezbędne informacje mogą zostać przekazane administratorowi odpowiedniej platformy, np. Google, GoWork, Aleo lub Panoramy Firm. Przekazujemy zakres potrzebny do prowadzenia uzgodnionej sprawy. Te podmioty mogą przetwarzać dane również jako odrębni administratorzy zgodnie ze swoimi zasadami.</p>
    <p>Jeśli korzystasz z uruchomionych płatności PayU, operatorem jest PayU S.A. Do utworzenia płatności przekazujemy m.in. e-mail, telefon, nazwę podaną w zamówieniu, adres IP klienta, numer zlecenia, opis usługi i kwotę. Otrzymujemy identyfikator transakcji oraz jej status. Dane karty lub logowania do banku podajesz operatorowi płatności, a nie w naszym formularzu. PayU działa jako odrębny administrator danych płatniczych; szczegóły udostępnia w <a href="https://poland.payu.com/prywatnosc/" target="_blank" rel="noreferrer">informacji o prywatności PayU</a>.</p>
    <p>Usuwanie opinii jest rozliczane po uzgodnionym rezultacie i nie powoduje pobrania płatności przy wysyłaniu zgłoszenia. Przy usuwaniu profili formularz przewiduje płatność PayU. Jeśli płatności nie są skonfigurowane, formularz informuje o ich niedostępności.</p>

    <h2>6. Analityka i technologie w przeglądarce</h2>
    <p>Własną analitykę uruchamiamy dopiero po wyborze „Zgadzam się na analitykę”. Obejmuje odsłony, rozpoczęcie formularza i zapis zgłoszenia, identyfikator sesji, ścieżkę strony, stronę wejścia, domenę odsyłającą oraz parametry kampanii, jeśli znajdują się w adresie, np. UTM, gclid, gbraid lub wbraid. Parametr kampanii nie jest informacją o pełnym zapytaniu wpisanym przez daną osobę do wyszukiwarki.</p>
    <p>Za zgodą przetwarzamy również dane techniczne przeglądarki: user agent, język, wymiary ekranu i strefę czasową. Serwer tworzy z nich skrót; nie jest to anonimowa ani pewna identyfikacja konkretnej osoby. Zdarzenia mogą zawierać także skrót adresu IP. Nie stosujemy odtwarzania identyfikatorów po ich usunięciu ani obchodzenia odmowy zgody.</p>
    <ul>
      <li><strong>localStorage — wg-consent:</strong> zapamiętuje wybór prywatności („yes” lub „no”), także pomiędzy wizytami. Pozostaje do zmiany wyboru lub usunięcia danych witryny w przeglądarce.</li>
      <li><strong>sessionStorage — wg-session i wg-attribution:</strong> za zgodą przechowują identyfikator sesji i źródło wejścia. Co do zasady dotyczą sesji danej karty; usuwamy je również przy odrzuceniu analityki.</li>
      <li><strong>sessionStorage — wg-selected-business:</strong> służy technicznemu przeniesieniu wybranej wizytówki do formularza; jest usuwany po poprawnym zgłoszeniu lub zakończeniu sesji przeglądarki.</li>
      <li><strong>Cookie — wg_admin:</strong> niezbędne ciasteczko logowania do panelu obsługi, ważne maksymalnie 8 godzin. Nie służy śledzeniu odwiedzających.</li>
    </ul>
    <p>W obecnej konfiguracji nie jest uruchomiony Google Tag Manager. Kod serwisu pozwala za zgodą załadować ten mechanizm po jego skonfigurowaniu. Przed uruchomieniem dodatkowych narzędzi, np. Google Analytics lub tagów reklamowych, zaktualizujemy informację o zakresie pomiaru, dostawcach i wymaganych zgodach. Sam opis możliwości technicznej nie oznacza, że takie narzędzia są obecnie aktywne.</p>
    <p>W każdej chwili możesz wybrać „Ustawienia prywatności”, a następnie „Tylko niezbędne”. Cofnięcie zgody nie wpływa na zgodność z prawem wcześniejszego przetwarzania ani nie usuwa automatycznie danych zapisanych wcześniej na serwerze. Możesz również usunąć dane witryny w ustawieniach przeglądarki; wtedy serwis ponownie zapyta o wybór.</p>

    <h2>7. Przekazywanie danych poza EOG</h2>
    <p>Korzystanie z usług Google może wiązać się z przetwarzaniem danych poza Europejskim Obszarem Gospodarczym, w tym w Stanach Zjednoczonych. Zasady Google opisuje <a href="https://policies.google.com/privacy?hl=pl" target="_blank" rel="noreferrer">polityka prywatności Google</a>. Podstawą przekazania, stosownie do usługi i odbiorcy, może być decyzja Komisji Europejskiej o odpowiednim poziomie ochrony, w tym w ramach EU–US Data Privacy Framework dla objętych nim podmiotów, albo standardowe klauzule umowne wraz z wymaganymi zabezpieczeniami. Informacje o zabezpieczeniach właściwych dla danego przekazania można uzyskać, kontaktując się z administratorem.</p>

    <h2>8. Jak długo przechowujemy dane</h2>
    <ul>
      <li><strong>Zapytania bez zawartej umowy:</strong> do zakończenia korespondencji i oceny sprawy, a następnie tylko w zakresie i przez czas uzasadniony potrzebą wykazania ustaleń lub ochrony przed roszczeniami.</li>
      <li><strong>Zlecenia i korespondencja dotycząca umowy:</strong> przez realizację usługi i rozliczenie, a następnie do upływu właściwych terminów przedawnienia roszczeń. Terminy zależą od rodzaju roszczenia; co do zasady wynoszą 3 lub 6 lat, z uwzględnieniem przepisów szczególnych i zdarzeń wpływających na ich bieg.</li>
      <li><strong>Dokumenty podatkowe i księgowe:</strong> przez wymagany prawem okres, co do zasady 5 lat od końca roku kalendarzowego, w którym upłynął termin płatności podatku, chyba że przepisy lub konkretna sprawa wymagają dłuższego przechowywania.</li>
      <li><strong>Zdarzenia własnej analityki:</strong> przewidziany okres retencji wynosi 90 dni. Usunięcie starszych zdarzeń wykonuje zadanie utrzymaniowe serwera. Nie jest to niezależny od jego uruchomienia automatyczny termin wygaśnięcia każdego rekordu.</li>
      <li><strong>Dane bezpieczeństwa:</strong> wpisy limitów żądań i wygasłe sesje usuwa zadanie utrzymaniowe po ich wygaśnięciu. Jeśli włączono zapis pełnego IP i user agenta przy zamówieniu, zadanie usuwa te pola ze zgłoszeń starszych niż 30 dni; zapis pełnego IP jest obecnie wyłączony.</li>
    </ul>
    <p>Dane zamówień i korespondencja nie mają w aplikacji automatycznej daty usunięcia. Administrator okresowo weryfikuje potrzebę ich dalszego przechowywania i usuwa lub ogranicza dane po ustaniu podstawy. Kopie zapasowe i logi infrastruktury mogą mieć osobny cykl retencji; przechowujemy je wyłącznie przez czas niezbędny dla bezpieczeństwa, odtworzenia danych lub obowiązków prawnych.</p>

    <h2>9. Twoje prawa</h2>
    <p>Na zasadach określonych w przepisach masz prawo dostępu do danych i otrzymania ich kopii, sprostowania, usunięcia, ograniczenia przetwarzania oraz przenoszenia danych przetwarzanych automatycznie na podstawie zgody lub umowy. Możesz cofnąć zgodę w dowolnym momencie.</p>
    <p>Gdy podstawą jest nasz prawnie uzasadniony interes, możesz wnieść sprzeciw z przyczyn związanych z Twoją szczególną sytuacją. Żądanie usunięcia nie zawsze oznacza usunięcie wszystkich danych, np. gdy mamy obowiązek zachowania dokumentacji podatkowej lub potrzebujemy informacji do ochrony roszczeń.</p>
    <p>Żądania kieruj na <a href="mailto:kontakt@wizytowkigoogle.pl">kontakt@wizytowkigoogle.pl</a>. Możemy poprosić o informacje potrzebne do potwierdzenia tożsamości, bez zbierania danych ponad niezbędny zakres. Co do zasady odpowiadamy w ciągu miesiąca; przy uzasadnionym przedłużeniu poinformujemy o przyczynie i terminie. Masz prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych — szczegóły na <a href="https://uodo.gov.pl/" target="_blank" rel="noreferrer">uodo.gov.pl</a>.</p>

    <h2>10. Dobrowolność i bezpieczeństwo</h2>
    <p>Podanie danych jest dobrowolne, lecz pola oznaczone jako wymagane są niezbędne do obsługi zgłoszenia lub zawarcia umowy. Bez nich nie możemy przyjąć sprawy przez formularz. Dane do faktury są potrzebne, gdy wymaga ich rozliczenie. Analityka jest opcjonalna i jej odrzucenie nie ogranicza możliwości kontaktu.</p>
    <p>Ograniczamy dostęp do danych, stosujemy zabezpieczenia sesji i mechanizmy ograniczające nadużycia. Hasła panelu przechowujemy w postaci skrótów kryptograficznych. Link do statusu zgłoszenia zapewnia dostęp do informacji o sprawie — traktuj go jako poufny i nie przekazuj osobom postronnym.</p>

    <h2>11. Zmiany polityki</h2>
    <p>Politykę aktualizujemy przy zmianach funkcji serwisu, dostawców lub przepisów. Aktualna wersja i data znajdują się na tej stronie. Jeżeli nowe przetwarzanie wymaga zgody, sama aktualizacja polityki jej nie zastępuje.</p>
  </main>;
}
