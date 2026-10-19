# wizytowkigoogle.pl

Projekt strony i systemu zleceń: **Next.js 16 + TypeScript + MySQL**, bez zamiany produkcyjnej bazy na SQLite/D1. Warstwa SQL korzysta z mysql2 i zapytań parametryzowanych. Wygląd: zaakceptowany projekt pastelowy, grafika właścicieli firm, responsive desktop/mobile.

## Co jest gotowe w kodzie

- Strona główna z trzema kategoriami oferty, formularzem pięciu usług Google, FAQ i stopką.
- 15 stron tematycznych: 12 rozbudowanych stron usługowych (w tym ogólne usuwanie opinii), ochrona wizerunku, pozycjonowanie i Google Ads. Strony usługowe mają adresy bez rozszerzenia, a ich wcześniejsze adresy `.html` przekierowują trwale do wersji kanonicznej.
- Trwały zapis zgłoszenia, numer, cena skopiowana z cennika, zgody, opis, cel i historia.
- Prywatny status klienta: losowy identyfikator zgłoszenia daje token HMAC, baza przechowuje tylko jego hash. Token jest w fragmencie URL, nie w ścieżce i logach serwera.
- Panel `/admin`: logowanie, filtrowanie, statusy, cel, cena, notatki, komunikaty dla klienta; edycja cen, opisów usług oraz treści 13 podstron. Maksymalnie 1000 najnowszych zleceń w panelu.
- Statusy: nowe → weryfikacja → realizacja → efekt → rozliczone. Anulowanie przed osiągnięciem efektu. Przed realizacją wymagane zapisanie uzgodnionego celu i ceny. Oznaczenie „rozliczone” jest ręczne, nie oznacza integracji z operatorem płatności.
- Kolejka e-mail zapisywana w tej samej transakcji co zgłoszenie. Worker SMTP: potwierdzenia i aktualizacje, do 5 prób, widoczny stan kolejki. W razie awarii pomiędzy dostarczeniem a oznaczeniem „sent” dostawca może otrzymać ponownie ten sam Message-ID; dostarczenie nie jest gwarantowane dokładnie raz.
- Analityka po zgodzie: UTM, gclid/gbraid/wbraid, strona wejścia, domena odsyłająca, zdarzenia, sesja, skrót cech urządzenia. GTM uruchamia się tylko po zgodzie. `utm_term` jest parametrem kampanii, nie pełnym zapytaniem wyszukiwarki; organicznych fraz per użytkownik nie da się wiarygodnie odtworzyć z wejścia.
- Podstawowy fingerprint jest skrótem UA, języka, rozmiaru ekranu i strefy czasowej, nie trwałą identyfikacją osoby. Brak obchodzenia odmowy zgody, canvas fingerprintingu czy odtwarzania skasowanych identyfikatorów.
- Pełne IP domyślnie nie jest zapisywane. HMAC IP służy limitom nadużyć. Przetwarzanie nagłówka proxy wymaga zaufanego proxy, które zastępuje nagłówek.
- Walidacja serwerowa, limity żądań, honeypot, kontrola Origin dla operacji zapisu, ciasteczka HttpOnly/SameSite, scrypt, kontrola wersji edytowanego zlecenia, transakcje SQL, blokady rekordu przy zmianie statusu. Hasła i tokeny nigdy nie są częścią repozytorium.

## Uruchomienie

Wymagane: Node.js 24, npm, MySQL 8.4 oraz SMTP. Hosting musi uruchamiać proces Node.js — zwykły hosting wyłącznie PHP nie wystarczy.

```bash
npm ci
cp .env.example .env.local
```

Uzupełnij `.env.local`: DATABASE_URL (wstaw dane dostępowe do MySQL w formacie `mysql://USER:PASSWORD@127.0.0.1:3306/wizytowkigoogle`), NEXT_PUBLIC_SITE_URL, ADMIN_EMAIL, silne ADMIN_PASSWORD i losowy IP_HASH_SECRET (min. 32 znaki). DATABASE_URL pozostaje pusty do momentu podania prawidłowego URL, dzięki czemu aplikacja nie próbuje łączyć się z nieuzupełnioną bazą. Nie używaj wartości `CHANGE_ME` ani placeholderów USER/PASSWORD w działającym środowisku. Używaj URL-encoding dla znaków specjalnych w haśle DATABASE_URL. Hasło administratora służy tylko inicjalizacji; potem jego hash jest w bazie. Ponowne `db:init` resetuje hasło wskazanego administratora, zachowuje ceny, treści i zlecenia.

Opcjonalny lokalny MySQL przez Docker:

```bash
# Ustaw własne silne hasła w środowisku; nie zapisuj ich w repozytorium.
export MYSQL_PASSWORD='TU_WLASNE_HASLO'
export MYSQL_ROOT_PASSWORD='TU_INNE_WLASNE_HASLO'
docker compose up -d db
```

Baza `wizytowkigoogle`, użytkownik `wg`, port lokalny 3306. Następnie:

```bash
npm run db:init
npm run dev
```

Otwórz localhost:3000. Konto panelu odpowiada ADMIN_EMAIL / ADMIN_PASSWORD. Do demonstracji bez bazy pozostaw DATABASE_URL pusty i ustaw DEMO_MODE=true: strony działają, formularz jest wyłączony, `/admin` pokazuje jawnie przykładowe dane bez zapisu.

## Produkcja

### Treści podstron usługowych

Katalog domyślny znajduje się w `lib/service-landings.ts`. Strony mają osobne tytuły SEO, opisy, FAQ, linkowanie wewnętrzne i dane strukturalne Service/BreadcrumbList. Nie deklarujemy gwarantowanych pozycji ani wyników rozszerzonych. Formularze usuwania uruchamiają modal dopasowany do usługi; weryfikacja i odwieszanie korzystają z formularza kontaktowego.

Grafiki hero 11 podstron mają dedykowane pliki WebP 1280 × 853 px (jakość 82), przypisane przez statyczne importy w `components/ServiceLanding.tsx`. Ogólna strona usuwania opinii współdzieli grafikę opinii Google. Oryginały PNG pozostają zachowane, ale nie są pobierane w hero. `next/image` dobiera wariant responsywny przez `sizes` i priorytetowo ładuje grafikę nad pierwszym ekranem.

Po aktualizacji istniejącej bazy uruchom `npm run db:sync-pages`. Skrypt dopisuje brakujące strony w transakcji, nie nadpisuje treści edytowanych w panelu i nie zmienia kont ani zleceń. `db:init` dla nowej bazy zawiera już aktualny katalog. Stare rekordy `.html` pozostają zachowane w bazie, ale nie pojawiają się w edytorze, stopce ani mapie strony. Aktywne treści można edytować w `/admin`.

### Formularze i wyszukiwanie firmy

- Główna: dokładnie pięć usług — pozycjonowanie, usuwanie opinii, Google Ads, usuwanie i resetowanie wizytówki Google. Weryfikacja i odwieszanie pozostają dostępne na swoich starszych podstronach.
- `/ochrona-wizerunku.html`: zoptymalizowany hero WebP, cztery obszary pomocy i animacje z obsługą `prefers-reduced-motion`. Zgłoszenie otwiera modal: **Mapy Google / Strony z opiniami → Opinie / Profil firmy → wybór portalu (dla opinii) lub NIP i weryfikacja w GUS, a następnie wybór jednego albo kilku portali z cenami (dla profili) → dane kontaktowe i płatność**. Przyciski strony i nagłówka oraz wejście z `#zlecenie` otwierają ten sam modal. Obsługuje powrót, zamknięcie, Escape, blokadę tła i przywrócenie fokusu.
- Sekcję 2/4/3/0 zastępuje statystyka: **85% badanych deklaruje większą skłonność do skorzystania z firmy po pozytywnych opiniach**. Źródło: [BrightLocal, Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/), reprezentatywna próba 1002 dorosłych z USA. Nie jest to wynik dla Polski ani statystyka skuteczności usług.
- „Mapy Google”: wyszukiwanie po nazwie i miejscowości przez `/api/gmb-search`; wybór uzupełnia nazwę i link. Wymaga serwerowego `GOOGLE_PLACES_API_KEY` z dostępem do Places Autocomplete.
- „Portale z opiniami”: usuwanie opinii lub profili; wyszukiwanie po NIP przez `POST /api/gus`. Ustaw serwerowe `BIR_API_URL` (adres HTTPS usługi BIR) i `BIR_API_KEY` w `.env.local` lub środowisku hostingu. Nie dodawaj prefiksu `NEXT_PUBLIC_`. Klucze nie trafiają do przeglądarki. NIP jest sprawdzany z sumą kontrolną; klient SOAP loguje się, pobiera firmę i zamyka sesję. Limit wynosi 40 wyszukiwań na minutę na proces aplikacji; przy wielu instancjach potrzebny jest wspólny limit na proxy.
- GUS identyfikuje firmę, nie wyszukuje profili na portalach. Link do opinii/profilu podaje użytkownik. W razie awarii wyświetlamy błąd i pozostawiamy możliwość ręcznego wpisania firmy.
- GUS pobiera też pełny raport `BIR11OsFizycznaDaneOgolne` lub `BIR11OsPrawna`. Forma prawna jest rozpoznawana po polu `*_szczegolnaFormaPrawna_Symbol`: `099` dla osoby fizycznej prowadzącej działalność, `019` dla spółki cywilnej. Sprawdzana jest zgodność REGON raportu. Kody i pola zweryfikowano w [oficjalnej dokumentacji BIR](https://api.stat.gov.pl/Home/RegonApi). Nie zgadujemy formy po nazwie firmy.
- W ścieżce „Strony z opiniami → Opinie” wykryta JDG lub spółka cywilna otrzymuje propozycję usunięcia całego profilu. Akceptacja wybiera właściwą usługę dla portalu (GoWork ma osobną usługę), odmowa zachowuje usługę usuwania opinii. Dla innych/nierozpoznanych form, danych ręcznych i Google nie ma takiej propozycji. Forma prawna nie gwarantuje prawa do usunięcia profilu.
- Usuwanie profilu firmy na portalach z opiniami przyjmujemy tylko dla JDG i spółek cywilnych potwierdzonych w CEIDG. Po NIP sprawdzamy formę w GUS; jeśli forma jest inna (np. spółka kapitałowa lub fundacja) albo nie da się jej potwierdzić, formularz wyświetla informację o braku możliwości realizacji i nie pozwala przejść do kontaktu. API zamówień ponownie weryfikuje NIP, REGON, nazwę i formę prawną w GUS, więc ograniczenia nie da się ominąć ręcznym żądaniem. Reguła nie dotyczy usuwania opinii z portali ani usług w Mapach Google — te obsługujemy niezależnie od formy prawnej.
- Portale obsługiwane w formularzu: Aleo, GoWork, Panorama Firm, Biznes Finder, PKT.pl, Podobne Firmy i Puls Biznesu. Link do profilu nie jest wymagany przy zgłoszeniu usunięcia profilu; Google Maps korzysta z linku wybranej wizytówki.
- Usuwanie opinii nie wymaga płatności przy zgłoszeniu. Google: 199 zł netto (244,77 zł brutto) za skutecznie usuniętą opinię; pozostałe portale są wyceniane indywidualnie, a rozliczenie następuje po rezultacie. Profile: po weryfikacji NIP w GUS klient może wybrać kilka portali; ceny wynoszą 999 zł netto (1228,77 zł brutto) dla GoWork oraz 549 zł netto (675,27 zł brutto) dla pozostałych portali. Podsumowanie i płatność PayU obejmują sumę wybranych profili, pobieraną przed rozpoczęciem realizacji.
- PayU działa wyłącznie po stronie serwera. Ustaw `PAYU_ENV` (`sandbox` lub `production`), `PAYU_POS_ID`, `PAYU_CLIENT_ID`, `PAYU_CLIENT_SECRET` i `PAYU_SECOND_KEY` jako sekrety środowiska. Wymagane jest publiczne `NEXT_PUBLIC_SITE_URL` z HTTPS, aby PayU mogło przekierować klienta i wysłać podpisane powiadomienie na `/api/payments/payu/notify`. Aplikacja sama wylicza kwotę z cennika; nie ufa cenie przesłanej przez przeglądarkę. Przy płatnym zgłoszeniu adres klienta jest przekazywany PayU, ale nie jest zapisywany jako surowe IP. Włącz `TRUST_PROXY=true` wyłącznie za reverse proxy zastępującym `x-forwarded-for` adresem klienta; bez tego płatne zgłoszenie zostanie jawnie odrzucone.
- Zmiana platformy czyści usługę, firmę, identyfikatory i link. Wybrane dane GUS (NIP, REGON, adres, forma prawna) oraz źródło są zapisywane w opisie zgłoszenia widocznym administratorowi; są to dane przekazane przez formularz, nie potwierdzenie tożsamości.
- Reset wizytówki oznacza analizę możliwości uporządkowania/ponownej konfiguracji zgodnej z zasadami Google, nie obietnicę wyzerowania ocen.

**Istniejąca baza:** przed udostępnieniem nowych usług wykonaj `npm run db:sync-services`. Polecenie dopisuje brakujące identyfikatory wymagane przez klucz obcy zlecenia, bez zmiany istniejących cen, treści, zleceń i hasła administratora. Dla nowej bazy `db:init` zawiera już pełny katalog. Dotychczasowe treści stron zapisane w bazie mają pierwszeństwo nad `lib/pages.json` — aktualizuj je w panelu.

**Migracja płatności PayU i danych do faktury w istniejącej bazie:** po ustawieniu `DATABASE_URL` wykonaj `npm run db:sync-services`, a następnie `npm run db:migrate-payments`. Migracja idempotentnie dodaje pola PayU i opcjonalne dane do faktury do `orders`; istniejące zlecenia pozostają bez zmian. Dla nowej bazy pola te są tworzone przez `db:init`.

Bez `DATABASE_URL` wyszukiwanie Google/GUS działa, ale wysłanie formularza pozostaje jawnie wyłączone. Statyczny podgląd nie obsługuje API.

```bash
npm run build
npm start
```

Ustaw domenę HTTPS w NEXT_PUBLIC_SITE_URL przed budowaniem, np. `https://wizytowkigoogle.pl`. Node za reverse proxy z HTTPS; port aplikacji dostępny wyłącznie dla proxy. Włącz TRUST_PROXY=true wyłącznie gdy proxy **zastępuje** x-forwarded-for prawdziwym IP klienta. Domyślnie brak zaufania do nagłówka oznacza wspólny limit dla nierozpoznanych IP. W środowisku produkcyjnym ciasteczko administratora wymaga HTTPS.

Dockerfile buduje standalone Node. Konfigurację serwera przekaż przez środowisko; nie kopiuj `.env.local` do obrazu. Zmienne NEXT_PUBLIC_* wkompilowują się w frontend: przy Dockerze ustaw je na etapie budowania, a po zmianie przebuduj. Alternatywnie buduj przez npm na serwerze z właściwym `.env.local`.

## Poczta i zadania utrzymaniowe

Uzupełnij SMTP_HOST/PORT/USER/PASS/FROM oraz ADMIN_NOTIFY_EMAIL. SMTP nie jest konieczny do samego zapisu zlecenia; wiadomości czekają w bazie. Worker odpalaj co minutę, np. z crona (podaj absolutne ścieżki Node/projektu):

```text
* * * * * cd /sciezka/do/projektu && /usr/bin/node --env-file=.env.local scripts/mail-worker.mjs >> /sciezka/do/logu-mail.log 2>&1
```

Worker usuwa wygasłe sesje i limity, analitykę starszą niż 90 dni, pełne IP i UA w zleceniach starszych niż 30 dni. Ustal własną retencję zleceń; automatyczne usuwanie dokumentacji rozliczeń nie jest dodane. Sprawdzaj kolejkę `failed` w panelu i logi. Skonfiguruj backup MySQL i SPF/DKIM/DMARC swojego dostawcy poczty.

## Prywatny podgląd

`npm run preview:build` tworzy statyczny podgląd w `dist` z **tego samego interfejsu Next.js**, bez API i bez prawdziwego przyjmowania zleceń. Pokazuje informację o trybie demonstracyjnym. To wariant do oceny projektu na hostingu Sites, który nie obsługuje bezpośredniego połączenia MySQL. Aplikacja produkcyjna pozostaje w `app`, `lib`, `scripts`; kompilacja podglądu jej nie zmienia. Nie kieruj domeny produkcyjnej na podgląd.

## Przed uruchomieniem sprzedaży

1. Podłącz docelową bazę i SMTP; sprawdź pełny proces na testowym zgłoszeniu oraz odbiór maila.
2. Wpisz dane firmy, kontakt, warunki zlecenia, definicje efektów, ceny i docelową politykę prywatności. Obecna strona prywatności jest jawnie robocza — nie jest gotowym dokumentem prawnym.
3. Google Ads: osobno uzgodnij budżet Google i wynagrodzenie. Brak gwarancji pierwszego miejsca i brak pobrania płatności przy wysłaniu formularza.
4. Sprawdź wszystkie zachowane ścieżki na domenie, SSL, indeksację, sitemap i canonical. Przy połączeniu starej domeny nie zmieniaj adresów `.html`. Nowe treści nie gwarantują zachowania dotychczasowych pozycji.
5. Edycja stron i cennika jest w panelu; hero, globalne nagłówki, grafiki i stopka pozostają w kodzie. Integracji Duda nie dodano.

## Weryfikacja wykonana podczas tworzenia

- Produkcyjny build Next.js i TypeScript.
- Testy: walidacja, odrzucenie niedozwolonych danych, kolejność statusów, komplet 11 adresów, ochrona cross-origin, brak fałszywego sukcesu bez bazy.
- Statyczny eksport 13 podstron i demonstracji panelu.
- Aktualizacja ochrony wizerunku: 24 testy Node (w tym SOAP/MTOM, pełne raporty i kody form prawnych, walidacja NIP, rekomendacja usunięcia profilu, rozdzielenie usług i zapis danych GUS w opisie), TypeScript i build produkcyjny. W przeglądarce sprawdzono wyszukiwanie, kroki modala, przyjęcie i odrzucenie rekomendacji, stany błędów oraz widok mobilny.
- Ograniczenie profili portalowych do JDG/spółek cywilnych jest egzekwowane w UI, walidacji formularza i przez ponowne sprawdzenie danych GUS przy zapisie. Usuwanie opinii na portalach oraz wszystkie zgłoszenia Google pozostają dostępne dla pozostałych form.
- Cennik i walidacja formularza ochrony wizerunku, obliczanie VAT, konfiguracja PayU oraz podpis MD5 powiadomień operatora są pokryte testami. Transakcji PayU nie można zweryfikować bez danych dostępowych sprzedawcy i publicznego endpointu HTTPS.
- Nadal nie wykonano testu zapisu na działającym MySQL/SMTP. Lokalnie brak `DATABASE_URL`; wysyłanie zgłoszeń pozostaje wyłączone. Nie należy traktować samego podglądu jako potwierdzenia gotowości produkcyjnej zapisu i poczty.
