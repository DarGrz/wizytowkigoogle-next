import legacyPages from './pages.json';
import type { ContentPage } from './types';
import type { BusinessSource } from './order-services';
import type { ReputationTarget, ReviewPortal } from './reputation-pricing';

export type LandingSelection = { source: BusinessSource; target: ReputationTarget; portal?: ReviewPortal };
type Landing = ContentPage & { seoTitle: string; seoDescription: string; cta: string; selection?: LandingSelection; related: string[] };

const seoDescriptions: Record<string, string> = {
  'usuwanie-aleo': 'Usuwanie profilu firmy z Aleo. Bezpłatna weryfikacja po NIP i jasne warunki współpracy. Zgłoś firmę bez podawania linku do profilu.',
  'usuwanie-gowork': 'Chcesz usunąć profil firmy z GoWork? Sprawdź możliwość obsługi po NIP. Poznaj ofertę, wybierz portale i zgłoś sprawę w prosty sposób.',
  'usuwanie-panorama-firm': 'Usuwanie firmy z Panoramy Firm. Sprawdź możliwość realizacji po NIP, poznaj wycenę i zleć obsługę profilu. Bez szukania linku do katalogu.',
  'usuwanie-firmy-z-google': 'Chcesz usunąć firmę z Google? Ustal właściwy zakres: wizytówka, opinie czy profil na portalu. Sprawdź możliwości i skonsultuj sprawę.',
  'usuwanie-wizytowki-google': 'Usuwanie wizytówki Google: rzetelna ocena profilu i jasny zakres współpracy. Wskaż firmę i sprawdź możliwość uporządkowania Map Google.',
  'jak-usunac-firme-z-google': 'Jak usunąć firmę z Google? Poznaj różnice między wizytówką, opiniami i wynikami wyszukiwania. Zleć ocenę sprawy specjalistom.',
  'usuwanie-opinii-google': 'Usuwanie negatywnych opinii Google. Zgłoś wpisy do bezpłatnej oceny, poznaj możliwości prawne i warunki współpracy.',
  'usuwanie-opinii-google-cena': 'Ile kosztuje usuwanie opinii Google? Poznaj zasady indywidualnej wyceny i bezpiecznej realizacji. Zgłoś sprawę do bezpłatnej wyceny.',
  'usuwanie-opinii-formularz': 'Formularz zgłoszenia opinii z Google i portali. Wskaż firmę, opisz wpis i uzyskaj bezpłatną analizę prawno-regulaminową.',
  'weryfikacja-wizytowek-google': 'Problem z weryfikacją wizytówki Google? Pomagamy ocenić sytuację i przygotować firmę do procesu. Zgłoś profil i poznaj zakres obsługi.',
  'odwieszanie-wizytowek-google': 'Zawieszona wizytówka Google? Zgłoś profil do oceny i poznaj zakres pomocy w przywróceniu. Jasne warunki obsługi, bez obietnic w ciemno.',
  'usuwanie-opinii': 'Usuwanie szkodliwych opinii z Google, GoWork, Aleo i innych portali. Profesjonalna ochrona wizerunku i bezpłatna wycena sprawy.',
};

function page(
  slug: string, seoTitle: string, title: string, intro: string, service: string, cta: string,
  sections: [string, string][], faq: [string, string][], related: string[], selection?: LandingSelection,
): Landing {
  return { slug, seoTitle, seoDescription: seoDescriptions[slug], title, eyebrow: seoTitle.split(' | ')[0], intro, service, cta,
    sections: sections.map(([title, text]) => ({ title, text })),
    faq: faq.map(([question, answer]) => ({ question, answer })), related, selection };
}

export const serviceLandings: Landing[] = [
  page('usuwanie-aleo', 'Usuwanie firmy z Aleo | Profil i opinie',
    'Profil w Aleo nie musi definiować Twojej firmy.',
    'Nieaktualna prezentacja firmy lub problematyczne wpisy w Aleo mogą wpływać na pierwsze wrażenie klientów. Zleć nam ocenę możliwości usunięcia profilu i przejdź przez zgłoszenie bez szukania procedur na własną rękę.',
    'usuwanie-profili', 'Sprawdź firmę po NIP', [
      ['Usuwanie profilu Aleo — uporządkuj to, co widzą klienci', 'Ktoś wpisuje nazwę Twojej firmy i trafia na profil, nad którym nie masz kontroli. Nawet jeśli sam nie korzystasz z Aleo, klienci mogą oceniać Twój biznes na podstawie znalezionych tam informacji. Pomagamy ocenić możliwość usunięcia profilu i przejmujemy obsługę uzgodnionego zakresu sprawy.'],
      ['Profil i pojedyncza opinia to dwa różne zlecenia', 'Jeżeli problem dotyczy całej prezentacji firmy, właściwym punktem wyjścia jest analiza profilu. Jeśli chodzi o konkretny komentarz, wybierz usuwanie opinii. Nie musisz znać procedur portalu: określasz cel, a my sprawdzamy, jaki zakres działania pasuje do Twojej sytuacji.'],
      ['Zacznij od NIP, nie od szukania linków', 'W formularzu pobieramy dane firmy z GUS i weryfikujemy możliwość przyjęcia zgłoszenia. Link do profilu Aleo nie jest wymagany. Po pozytywnej weryfikacji zobaczysz dostępne portale z cenami; możesz wybrać Aleo lub dodać inne miejsca wymagające uporządkowania.'],
      ['Jasne warunki przed decyzją', 'Koszt usunięcia profilu poznasz przed podjęciem ostatecznej decyzji o rozpoczęciu współpracy. Podsumowanie obejmuje wszystkie wybrane portale oraz dokładną kwotę. Wszystkie formalności załatwiamy sprawnie, bez zbędnego angażowania Twojego czasu i bez konieczności samodzielnego kontaktu z portalem.'],
      ['Oceniamy możliwości, nie obiecujemy w ciemno', 'Możliwość usunięcia zależy od sytuacji firmy i zasad serwisu. Decyzję o zmianie treści podejmuje portal. Przed zleceniem warto jasno określić oczekiwany rezultat: obsługa profilu Aleo nie oznacza automatycznego usunięcia wszystkich informacji o firmie z internetu.'],
    ], [
      ['Czy muszę mieć konto w Aleo?', 'Do rozpoczęcia zgłoszenia w naszym formularzu nie potrzebujesz konta w Aleo. Wpisujesz NIP i wybierasz firmę. Nie prosimy o hasło do portalu.'],
      ['Czy mogę zlecić tylko usunięcie opinii z Aleo?', 'Tak. W formularzu wybierz zakres opinii. Ocenimy komentarze pod kątem naruszeń regulaminu i przepisów prawa.'],
      ['Kiedy płacę za usunięcie profilu Aleo?', 'Warunki finansowe oraz formę płatności poznasz w podsumowaniu przed rozpoczęciem realizacji.'],
      ['Czy można wybrać kilka portali?', 'Tak. Po weryfikacji firmy możesz zaznaczyć kilka portali. Formularz pokazuje cenę każdego z nich oraz sumę.'],
    ], ['usuwanie-gowork', 'usuwanie-panorama-firm', 'usuwanie-opinii'],
    { source: 'portals', target: 'profile', portal: 'aleo' }),
  page('usuwanie-gowork', 'Usuwanie profilu GoWork | Obsługa firmy',
    'Zadbaj o to, jak Twoją firmę widzą na GoWork.',
    'Profil GoWork może towarzyszyć klientowi, kandydatowi i kontrahentowi przy ocenie Twojej firmy. Sprawdzimy możliwość jego usunięcia i poprowadzimy sprawę w ustalonym zakresie.',
    'usuwanie-profili', 'Zgłoś profil GoWork', [
      ['GoWork to część pierwszego wrażenia o firmie', 'Osoba sprawdzająca przedsiębiorstwo nie zawsze odróżnia oficjalne materiały od treści opublikowanych przez innych. Nieaktualny profil lub nieadekwatny obraz firmy mogą utrudniać rozmowy sprzedażowe i rekrutację. Nasza usługa pomaga uporządkować ten konkretny obszar obecności w sieci. W zgłoszeniu możesz zaznaczyć, czy problem dotyczy obecnego wizerunku pracodawcy, dawnej działalności czy mylącej prezentacji przedsiębiorstwa. Nie musisz samodzielnie kwalifikować sprawy.'],
      ['Usunięcie profilu czy obsługa komentarzy?', 'Zlecenie dotyczące profilu nie jest tym samym co praca nad pojedynczym wpisem. Jeżeli chcesz zgłosić określone opinie, wybierz taki zakres w formularzu. Jeśli celem jest usunięcie całego profilu firmy z GoWork, zacznij od weryfikacji podmiotu po NIP.'],
      ['Weryfikacja firmy przed wyborem usługi', 'Pobieramy dane z GUS, aby dopasować firmę i sprawdzić możliwość obsługi. Jeśli zgłoszenie kwalifikuje się do dalszego procesu, wyświetlamy listę portali i ceny. Nie musisz odszukiwać adresu profilu GoWork ani przekazywać danych logowania do serwisu.'],
      ['Jedno zgłoszenie, także dla kilku portali', 'Problem z wizerunkiem nie zawsze kończy się na jednym serwisie. W tym samym zgłoszeniu możesz dodać inne obsługiwane portale. Zobaczysz oddzielne ceny i kwotę łączną; płatność za profile następuje przez PayU na końcu formularza.'],
      ['Wiesz, czego dotyczy Twoja sprawa', 'Ustalamy wybrany zakres i informujemy Cię o kluczowych krokach. Nie utożsamiamy usunięcia profilu z natychmiastowym zniknięciem każdego wyniku wyszukiwania. Czas odpowiedzi zależy również od administratora GoWork.'],
    ], [
      ['Czy usuwacie wszystkie negatywne wpisy z GoWork?', 'Nie każda krytyczna wypowiedź kwalifikuje się do usunięcia. Opinie oceniamy indywidualnie; samo niezadowolenie z oceny firmy nie przesądza o wyniku.'],
      ['Czy potrzebny jest link do profilu GoWork?', 'Nie przy zgłoszeniu usunięcia całego profilu. Formularz zaczyna się od NIP i danych firmy pobranych z GUS.'],
      ['Czy usuwanie opinii wymaga wcześniejszej weryfikacji?', 'Tak. Każde zgłoszenie dotyczące komentarzy oceniamy indywidualnie pod kątem zgodności z regulaminem i prawem.'],
      ['Czy usunięcie GoWork usuwa firmę z Google?', 'Nie oznacza usunięcia wizytówki Google ani innych stron. Profil w portalu i jego widoczność w wyszukiwarce to odrębne kwestie.'],
    ], ['usuwanie-aleo', 'usuwanie-opinii', 'usuwanie-panorama-firm'],
    { source: 'portals', target: 'profile', portal: 'gowork' }),
  page('usuwanie-panorama-firm', 'Usuwanie firmy z Panoramy Firm | Zgłoszenie',
    'Nieaktualny profil w Panoramie Firm? Uporządkujmy go.',
    'Błędna prezentacja firmy może kierować klientów do nieaktualnych informacji. Pomagamy ocenić możliwość usunięcia profilu z Panoramy Firm i obsługujemy zgłoszenie od identyfikacji firmy po monitorowanie sprawy.',
    'usuwanie-profili', 'Sprawdź możliwość usunięcia', [
      ['Katalog firm też wpływa na decyzję klienta', 'Dane znalezione w katalogu bywają traktowane jak aktualna wizytówka przedsiębiorstwa. Stary adres, dawny zakres działalności lub profil, którego nie prowadzisz, mogą wprowadzać zamieszanie. Warto ocenić, czy właściwym celem jest usunięcie profilu, czy inny zakres uporządkowania obecności firmy. Gdy klient korzysta z kilku źródeł informacji, spójność prezentacji nabiera znaczenia. Zgłoszenie pozwala wskazać, czego nie chcesz już wiązać z aktualną działalnością.'],
      ['Usługa dopasowana do konkretnego podmiotu', 'Podobna nazwa firmy nie wystarcza, aby zidentyfikować właściwy profil. Dlatego w naszym formularzu zaczynasz od NIP. Dane rejestrowe pozwalają przypisać zgłoszenie do właściwej firmy i sprawdzić, czy możemy przyjąć sprawę do realizacji.'],
      ['Bez wymogu podawania adresu profilu', 'Nie musisz szukać linku do Panoramy Firm ani zakładać tam konta, żeby rozpocząć zgłoszenie. Po weryfikacji wybierasz portal z listy. Jeśli potrzebujesz obsługi również w innych katalogach, możesz zaznaczyć kilka pozycji i zobaczyć łączną cenę.'],
      ['Przejrzyste podsumowanie i płatność', 'W formularzu widzisz zakres zamówienia oraz ceny wybranych portali. Usuwanie profili jest opłacane przez PayU przy składaniu zgłoszenia. Dane do faktury możesz pobrać z wcześniej wyszukanej firmy albo wpisać osobno.'],
      ['Usunięcie profilu to konkretny zakres pracy', 'Nie obiecujemy zniknięcia wszystkich śladów firmy w sieci. Inne katalogi i wizytówka Google wymagają osobnej obsługi. W przypadku Panoramy Firm oceniamy konkretny profil, a odpowiedź i termin działania zależą również od administratora serwisu.'],
    ], [
      ['Czy mogę zgłosić firmę, która nadal działa?', 'Opisz aktualną sytuację i oczekiwany rezultat. Możliwość realizacji oceniamy dla konkretnego podmiotu; samo prowadzenie działalności nie opisuje całej sprawy.'],
      ['Czy usunięcie profilu obejmuje pozostałe katalogi?', 'Nie automatycznie. W formularzu wybierasz portale, których ma dotyczyć zlecenie. Każdy z nich ma osobną cenę.'],
      ['Co jeśli problem dotyczy tylko opinii?', 'Wybierz usuwanie opinii zamiast całego profilu. Dokładnie zbadamy zgłoszone treści pod kątem naruszeń.'],
      ['Czy dostanę potwierdzenie zgłoszenia?', 'Tak. Po przesłaniu zapytania potwierdzamy jego odbiór i kontaktujemy się z gotową analizą.'],
    ], ['usuwanie-aleo', 'usuwanie-gowork', 'usuwanie-firmy-z-google'],
    { source: 'portals', target: 'profile', portal: 'panorama-firm' }),
  page('usuwanie-firmy-z-google', 'Usuwanie firmy z Google | Sprawdź zakres usługi',
    'Chcesz usunąć firmę z Google? Zacznijmy od właściwego celu.',
    'Wizytówka w Mapach, opinie i wyniki prowadzące do innych stron to różne obszary. Pomożemy określić, czego dotyczy problem, i dobrać usługę zamiast działać na przypadkowym profilu.',
    'usuwanie-wizytowki', 'Zgłoś firmę do sprawdzenia', [
      ['Co oznacza usuwanie firmy z Google?', 'Pod tym hasłem kryje się kilka potrzeb: usunięcie wizytówki, uporządkowanie starej lokalizacji albo obsługa opinii. Nie każda z nich wymaga tego samego działania. Najpierw identyfikujemy profil i oczekiwany rezultat, aby zgłoszenie dotyczyło rzeczywistego problemu Twojej firmy. Możesz opisać cel zwykłym językiem: mniej pomyłek klientów, uporządkowanie zamkniętej lokalizacji lub ocenę konkretnych wpisów. Dobór zakresu nie wymaga wiedzy technicznej.'],
      ['Nieaktualna obecność może kosztować zapytania', 'Klient, który trafia na dawny adres lub profil nieodpowiadający obecnej działalności, może zrezygnować z kontaktu. Jeżeli w Google funkcjonuje niepotrzebny profil, warto sprawdzić możliwość jego usunięcia. Zakres obsługi dopasowujemy do sytuacji, a nie do samej nazwy usługi.'],
      ['Negatywne opinie nie zawsze oznaczają potrzebę usuwania firmy', 'Jeśli właściwe dane firmy są aktualne, a problemem są konkretne komentarze, rozważ zgłoszenie opinii. Nie każda niska ocena może zostać usunięta. Ocenimy wskazane treści i ustalimy jasne warunki współpracy.'],
      ['Wyszukaj właściwą wizytówkę i określ zakres', 'W formularzu możesz znaleźć firmę przez wyszukiwarkę Map Google. Wskaż profil, opisz sytuację i podaj dane do kontaktu. Nie prosimy o hasło do konta Google. Podsumowanie pozwala sprawdzić wybraną usługę przed zakończeniem zgłoszenia.'],
      ['Jedna usługa nie usuwa całej firmy z internetu', 'Usunięcie profilu Google nie obejmuje automatycznie katalogów firm, portali z opiniami ani strony internetowej. Jeżeli problem występuje w kilku miejscach, zgłoś właściwe obszary osobno. Ostateczna możliwość zmiany profilu zależy od zasad i decyzji Google.'],
    ], [
      ['Czy usuniecie wszystkie wyniki z nazwą mojej firmy?', 'Nie. Usługa dotycząca wizytówki obejmuje określony profil w Google, a nie wszystkie strony i wzmianki widoczne w wyszukiwarce.'],
      ['Czy usunięcie dostępu do konta usuwa wizytówkę?', 'Nie jest to równoznaczne z usunięciem publicznego profilu. Dlatego przyjmując sprawę, rozróżniamy dostęp do zarządzania i widoczność firmy.'],
      ['Czy mogę zgłosić tylko opinie?', 'Tak. W formularzu możesz wybrać zakres dotyczący samych opinii – wówczas przeanalizujemy tylko wskazane komentarze.'],
      ['Czy usunięcie wizytówki jest gwarantowane?', 'Nie gwarantujemy usunięcia każdego profilu. Oceniamy konkretną sytuację, a decyzję o publikacji podejmuje Google.'],
    ], ['usuwanie-wizytowki-google', 'jak-usunac-firme-z-google', 'usuwanie-opinii-google'],
    { source: 'google', target: 'profile', portal: 'google' }),
  page('usuwanie-wizytowki-google', 'Usuwanie wizytówki Google | Zgłoś profil firmy',
    'Niepotrzebna wizytówka Google? Zleć nam obsługę sprawy.',
    'Stary profil, duplikat lub wizytówka nieodpowiadająca aktualnej działalności? Sprawdzimy możliwość usunięcia i pomożemy uporządkować obecność firmy w Mapach Google.',
    'usuwanie-wizytowki', 'Zgłoś wizytówkę Google', [
      ['Kiedy warto sprawdzić możliwość usunięcia wizytówki?', 'Po zmianie lokalizacji, zakończeniu działalności lub odkryciu dodatkowego profilu warto ocenić, co widzą klienci. Nie każda taka sytuacja kończy się usunięciem wizytówki. Nasza obsługa zaczyna się od rozpoznania profilu i celu, który ma osiągnąć Twoja firma. Szczególnie ważne jest odróżnienie niepotrzebnego wpisu od wizytówki, która nadal przynosi zapytania. W zgłoszeniu wskaż, co ma pozostać bez zmian.'],
      ['Duplikat i aktywny profil wymagają innej oceny', 'Dwie wizytówki o podobnej nazwie nie muszą oznaczać tego samego problemu. Znaczenie mają lokalizacja, status działalności i informacje publikowane w profilu. Analizujemy kontekst, aby nie traktować każdej sprawy jak identycznego zlecenia.'],
      ['Usuwanie wizytówki nie jest usługą zerowania ocen', 'Jeśli zależy Ci przede wszystkim na konkretnych komentarzach, wybierz analizę opinii. Usunięcie całej wizytówki to inny zakres działania i nie stanowi gwarantowanego sposobu na pozbycie się krytyki. Pomagamy dobrać usługę do faktycznej sytuacji.'],
      ['Od wyszukania firmy do podsumowania', 'Wyszukaj wizytówkę w formularzu, wybierz profil i opisz powód zgłoszenia. Przed rozpoczęciem procesu poznasz pełny zakres i warunki realizacji. Przedstawiamy dokładną wycenę i strategię postępowania, abyś miał pełną jasność co do kolejnych kroków i ustaleń.'],
      ['Spokojny przebieg zgłoszenia', 'Przejmujemy kompleksowy kontakt z platformą oraz przygotowanie wszelkiej niezbędnej dokumentacji. O wynikach i postępach informujemy po otrzymaniu oficjalnej odpowiedzi od Google, dzięki czemu oszczędzasz czas i możesz skupić się na prowadzeniu biznesu.'],
    ], [
      ['Czy można usunąć aktywną wizytówkę?', 'Każdy przypadek wymaga oceny. Samo życzenie właściciela nie przesądza o usunięciu profilu z publicznych Map Google.'],
      ['Czy potrzebujecie hasła do Google?', 'Nie podawaj hasła ani kodów logowania w formularzu. Ewentualny zakres dostępu uzgadniamy osobno.'],
      ['Ile potrwa usunięcie profilu?', 'Czas zależy od sytuacji wizytówki i odpowiedzi Google. Nie podajemy jednego gwarantowanego terminu dla wszystkich zgłoszeń.'],
      ['Czy usunięcie wizytówki obejmuje GoWork lub Aleo?', 'Nie. Profile w innych serwisach stanowią osobne usługi i wymagają wskazania odpowiednich portali.'],
    ], ['usuwanie-firmy-z-google', 'usuwanie-opinii-google', 'odwieszanie-wizytowek-google'],
    { source: 'google', target: 'profile', portal: 'google' }),
  page('jak-usunac-firme-z-google', 'Jak usunąć firmę z Google? | Ocena i obsługa',
    'Zanim usuniesz firmę z Google, ustal, co naprawdę wymaga zmiany.',
    'Nie musisz poznawać wszystkich procedur Google. Wystarczy określić problem: nieaktualna wizytówka, dodatkowy profil czy opinie. Pomożemy wybrać zakres obsługi odpowiedni dla Twojej firmy.',
    'usuwanie-wizytowki', 'Sprawdź swoją sprawę', [
      ['Najpierw cel biznesowy, później wybór usługi', 'Chcesz ograniczyć pomyłki klientów, uporządkować dawną lokalizację czy zająć się komentarzami? Każdy z tych celów wymaga innej oceny. Usuwanie firmy z Google nie jest jedną uniwersalną procedurą i nie zawsze będzie najlepszą odpowiedzią na problem. Warto również zaznaczyć, które informacje nadal pomagają klientom znaleźć Twoją firmę. Ustalony cel powinien uwzględniać aktualną działalność, a nie tylko pojedynczy niekorzystny wpis.'],
      ['Trzy obszary, których nie warto mylić', 'Publiczny profil firmy, dostęp do zarządzania i treści na zewnętrznych stronach to różne kwestie. Zmiana jednej z nich nie musi zmienić pozostałych. Podczas analizy rozdzielamy te obszary, aby przed przyjęciem zlecenia jasno opisać oczekiwany rezultat.'],
      ['Gdy problemem są opinie, oceniaj zakres opinii', 'Usunięcie całej wizytówki nie jest gwarantowanym sposobem na zmianę ocen. Przy komentarzach analizujemy konkretne treści i kontekst publikacji. Zgłoszenie możesz przesłać do bezpłatnej oceny.'],
      ['Co przekazać specjaliście?', 'Wskaż właściwą wizytówkę, opisz aktualną sytuację firmy i napisz, co chcesz osiągnąć. Te informacje pomagają uniknąć pomylenia starego profilu z aktywną lokalizacją. Nie potrzebujemy haseł ani kodów logowania do rozpoczęcia oceny sprawy.'],
      ['Zleć ocenę zamiast szukać uniwersalnej obietnicy', 'Google decyduje o publikacji profilu zgodnie ze swoimi zasadami. Dlatego nie obiecujemy usunięcia każdej firmy ani trwałego wymazania jej z internetu. Zaproponujemy zakres obsługi i przedstawimy warunki, aby decyzja o zleceniu opierała się na konkretach.'],
    ], [
      ['Czy każdą firmę da się usunąć z Google?', 'Nie. Możliwość działania zależy od konkretnego profilu, sytuacji firmy i zasad Google.'],
      ['Czy zamknięta firma znika automatycznie?', 'Zakończenie działalności nie oznacza automatycznego usunięcia wszystkich publicznych informacji. Warto ocenić aktualny stan wizytówki.'],
      ['Czy muszę znać procedury przed zgłoszeniem?', 'Nie. Opisz problem i wskaż firmę. Ocena zakresu i prowadzenie uzgodnionej sprawy należą do naszej obsługi.'],
      ['Od czego rozpocząć współpracę?', 'Otwórz formularz, wybierz właściwy profil i podaj dane kontaktowe. Jeśli chodzi tylko o komentarze, zmień zakres na opinie.'],
    ], ['usuwanie-firmy-z-google', 'usuwanie-wizytowki-google', 'usuwanie-opinii'],
    { source: 'google', target: 'profile', portal: 'google' }),
  page('usuwanie-opinii-google', 'Usuwanie opinii Google | Skuteczna ochrona wizerunku',
    'Krzywdząca opinia w Google? Sprawdzimy, co można zrobić.',
    'Pojedynczy komentarz może zmienić sposób, w jaki klient patrzy na Twoją firmę. Zleć ocenę opinii i bezpieczną obsługę zgłoszenia. Wycenę i plan działania poznasz przed podjęciem decyzji.',
    'usuwanie-opinii', 'Zgłoś opinię do analizy', [
      ['Opinie Google są częścią Twojej sprzedaży', 'Zanim klient zadzwoni, często sprawdza ocenę i najnowsze komentarze. Wpis, który przedstawia firmę w nieprawdziwym kontekście, może odwrócić uwagę od oferty. Pomagamy ocenić zgłoszone treści i poprowadzić sprawę bez konieczności samodzielnego poznawania procedur. Nie obiecujemy automatycznego wzrostu sprzedaży po zmianie opinii. Celem zlecenia jest określony rezultat dotyczący wskazanych treści, a nie przewidywana liczba nowych klientów.'],
      ['Analiza konkretnej opinii, nie samej liczby gwiazdek', 'Istotne są treść, okoliczności i związek wpisu z działalnością firmy. Sama negatywna ocena nie przesądza o możliwości usunięcia. Sprawdzamy, czy są podstawy do działania, zamiast traktować każdą krytyczną wypowiedź jak wpis, który na pewno zniknie.'],
      ['Obsługa zamiast powtarzania przypadkowych zgłoszeń', 'Przyjmujemy informacje o sprawie, oceniamy zakres i prowadzimy uzgodnioną obsługę. Monitorujemy odpowiedź platformy. Ty możesz skupić się na firmie, zamiast samodzielnie mierzyć się z procedurami.'],
      ['Przejrzyste warunki współpracy', 'Wycenę oraz strategię działania przedstawiamy przed rozpoczęciem pracy. Dokładnie badamy każdy wpis pod kątem naruszeń prawa i oficjalnych wytycznych platformy Google. Otrzymujesz jasne informacje o kosztach i etapach realizacji przed podjęciem ostatecznej decyzji.'],
      ['Zacznij od wskazania firmy i problemu', 'Wyszukaj wizytówkę Google, podaj kontakt i opisz wpisy, które budzą zastrzeżenia. Możesz wskazać więcej niż jedną opinię w opisie. Ostateczną decyzję podejmuje Google, dlatego nie gwarantujemy usunięcia wszystkich zgłoszonych treści ani jednego terminu dla każdej sprawy.'],
    ], [
      ['Czy można usunąć każdą negatywną opinię Google?', 'Nie. Rzetelna krytyka nie kwalifikuje się automatycznie do usunięcia. Ocenie podlegają konkretna treść i okoliczności publikacji.'],
      ['Czy zapłacę przy zgłoszeniu opinii?', 'Nie. Wysłanie zapytania i wstępna weryfikacja są całkowicie bezpłatne. Wycenę przedstawiamy po analizie profilu.'],
      ['Czy usuwanie opinii jest legalne?', 'Tak. Działamy w oparciu o obowiązujące przepisy prawa, ochronę dóbr osobistych oraz oficjalne regulaminy serwisów.'],
      ['Czy mogę zgłosić kilka opinii?', 'Tak. Opisz wpisy dotyczące wybranej wizytówki. Zakres i wycenę potwierdzimy przed rozpoczęciem obsługi.'],
    ], ['usuwanie-opinii-google-cena', 'usuwanie-opinii-formularz', 'usuwanie-opinii'],
    { source: 'google', target: 'reviews', portal: 'google' }),
  page('usuwanie-opinii-google-cena', 'Usuwanie opinii Google — wycena i zasady',
    'Indywidualna wycena i jasne zasady współpracy.',
    'Chcesz wiedzieć, ile kosztuje usunięcie opinii Google? Prześlij wpis do bezpłatnej wyceny. Przed rozpoczęciem potwierdzimy dokładną ofertę i plan działania.',
    'usuwanie-opinii', 'Sprawdź wycenę swojej sprawy', [
      ['Co obejmuje cena usuwania opinii Google?', 'Usługa dotyczy obsługi wskazanych opinii: oceny sprawy, przygotowania działań prawno-regulaminowych i monitorowania przebiegu. Dokładny zakres potwierdzamy przed startem. Dzięki temu wiesz, których wpisów dotyczy zlecenie. Oceniając ofertę, porównuj ten sam zakres, a nie wyłącznie samą kwotę. Obsługa jednej opinii i kilku różnych wpisów nie opisuje identycznego zamówienia.'],
      ['Dlaczego potrzebujemy konkretnej opinii do wyceny?', 'Sprawy różnią się treścią wpisów, ich liczbą i kontekstem. Bez wskazania firmy oraz problemu jedna kwota nie opisuje rzetelnie całej usługi. Prześlij zgłoszenie, a otrzymasz warunki odnoszące się do Twojej sytuacji, zamiast ogólnej obietnicy bez określonego zakresu.'],
      ['Jasna wycena przed rozpoczęciem', 'Zanim podejmiemy jakiekolwiek kroki, dokładnie analizujemy treść opinii i przedstawiamy wycenę. Wiesz dokładnie, na jakich warunkach współpracujemy, jaki jest harmonogram działań oraz czego możesz oczekiwać na każdym etapie obsługi sprawy.'],
      ['Kilka wpisów? Ustalmy wspólny zakres', 'Jeżeli problem dotyczy kilku opinii o tej samej firmie, opisz je w zgłoszeniu. Nie zakładamy, że każdy wpis ma identyczne podstawy do działania. Możemy ocenić sprawę łącznie, a warunki powinny jasno wskazywać, co obejmuje ustalona wycena.'],
      ['Koszt opinii i koszt profilu to inne usługi', 'Usuwanie całej wizytówki lub profilu portalowego nie ma tych samych zasad co usuwanie opinii. Przy profilach cena jest prezentowana w formularzu, a płatność następuje przez PayU. Wybierz właściwy zakres, aby otrzymać odpowiednie podsumowanie.'],
    ], [
      ['Czy analiza zgłoszenia oznacza obowiązek zapłaty?', 'Samo przesłanie zapytania jest całkowicie bezpłatne i niezobowiązujące. Decyzję podejmujesz po otrzymaniu wyceny.'],
      ['Kiedy otrzymam wycenę?', 'Zazwyczaj w ciągu 24–48 godzin roboczych od przesłania zgłoszenia.'],
      ['Czy podana cena zmieni się bez mojej wiedzy?', 'Zmiana zakresu wymaga nowych ustaleń. Przed startem powinieneś znać kwotę i wpisy objęte zleceniem.'],
      ['Czy wycena oznacza gwarancję usunięcia?', 'Nie. Możliwość usunięcia zależy od podstaw sprawy i decyzji Google. Cena opisuje warunki usługi, a nie gwarancję decyzji platformy.'],
    ], ['usuwanie-opinii-google', 'usuwanie-opinii-formularz', 'usuwanie-opinii'],
    { source: 'google', target: 'reviews', portal: 'google' }),
  page('usuwanie-opinii-formularz', 'Usuwanie opinii — formularz zgłoszeniowy',
    'Zgłoś opinię. My zajmiemy się oceną sprawy.',
    'Wskaż firmę, wybierz miejsce publikacji i krótko opisz problem. Formularz obsługuje Mapy Google oraz portale z opiniami. Przesłanie zapytania jest całkowicie bezpłatne.',
    'usuwanie-opinii', 'Otwórz formularz opinii', [
      ['Zgłoszenie bez znajomości procedur', 'Nie musisz wiedzieć, jak nazwać problem językiem konkretnego serwisu. Napisz własnymi słowami, czego dotyczy opinia i dlaczego zgłaszasz zastrzeżenia. My ocenimy sprawę oraz zakres możliwej obsługi. Nie przesyłaj haseł, kodów logowania ani zbędnych danych wrażliwych. Jeśli sprawa była już zgłaszana, zaznacz to w opisie. Informacja o wcześniejszej odpowiedzi pomoże zrozumieć sytuację, ale nie musisz przygotowywać rozbudowanej dokumentacji na start.'],
      ['Google lub portal — wybierz właściwe miejsce', 'Pierwszy wybór w formularzu pozwala rozdzielić opinie w Mapach Google od wpisów w innych serwisach. W Google możesz wyszukać wizytówkę po nazwie i miejscowości. Przy portalach wyszukujemy firmę po NIP w GUS, aby powiązać zgłoszenie z właściwym podmiotem.'],
      ['Krótki opis, który pozwala rozpocząć ocenę', 'Wskaż opinię lub opisz kilka wpisów dotyczących tej samej firmy. Przydatne są treść, autor i kontekst, który Twoim zdaniem ma znaczenie. Nie potrzebujemy gotowego uzasadnienia ani znajomości regulaminów. Ewentualne dodatkowe informacje ustalimy podczas obsługi zgłoszenia.'],
      ['Bez opłat za przesłanie zgłoszenia', 'Wysłanie zapytania w formularzu jest bezpłatne. Ocenimy sprawę, sprawdzimy podstawy prawne i wrócimy z konkretnymi warunkami współpracy.'],
      ['Sprawny kontakt zwrotny', 'Po przesłaniu formularza nasz specjalista zapoznaje się ze sprawą i kontaktuje się bezpośrednio z propozycją rozwiązania problemu. Przyjęcie sprawy nie oznacza gwarancji usunięcia: każda opinia wymaga oceny, a o publikacji decyduje odpowiednia platforma.'],
    ], [
      ['Czy formularz służy tylko do opinii Google?', 'Nie. Możesz wybrać Mapy Google lub obsługiwany portal z opiniami. Dalsze kroki dopasują się do wybranego miejsca.'],
      ['Czy muszę założyć konto?', 'Nie. Do przesłania zapytania wystarczy podać podstawowe dane kontaktowe.'],
      ['Czy wystawiacie fakturę VAT?', 'Tak, za wszystkie wykonane usługi wystawiamy fakturę VAT.'],
      ['Co się dzieje po wysłaniu formularza?', 'Sprawa trafia do weryfikacji. Kontaktujemy się z analizą i propozycją warunków obsługi.'],
    ], ['usuwanie-opinii', 'usuwanie-opinii-google', 'usuwanie-opinii-google-cena']),
  page('weryfikacja-wizytowek-google', 'Weryfikacja wizytówki Google | Pomoc dla firm',
    'Weryfikacja wizytówki stanęła w miejscu? Pomagamy ruszyć dalej.',
    'Brak potwierdzenia firmy utrudnia zarządzanie profilem i jego aktualizację. Sprawdzimy etap weryfikacji, ocenimy sytuację i pomożemy przygotować się do procesu wskazanego przez Google.',
    'weryfikacja', 'Zgłoś problem z weryfikacją', [
      ['Odzyskaj możliwość pracy nad wizytówką', 'Profil firmy ma wspierać kontakt z klientami, a nie być kolejnym niedokończonym zadaniem. Gdy weryfikacja zatrzymuje się lub powraca, warto ocenić sytuację całościowo. Pomagamy ustalić, co wymaga uporządkowania przed kolejnym etapem procesu. W zgłoszeniu zaznacz, czy to nowy profil, zmiana danych czy ponowna prośba o potwierdzenie firmy. Te sytuacje mogą wymagać różnego zakresu współpracy i udziału właściciela.'],
      ['Dopasowanie do rzeczywiście działającej firmy', 'Dane firmy, sposób prowadzenia działalności i informacje w wizytówce powinny tworzyć spójny obraz. Analizujemy przekazaną sytuację w odniesieniu do profilu. Nie tworzymy fikcyjnych lokalizacji ani materiałów przedstawiających nieprawdziwą działalność.'],
      ['Pomoc bez przekazywania hasła', 'Do rozpoczęcia zgłoszenia wystarczą informacje o firmie i krótki opis problemu. Nie wpisuj hasła do Google ani kodów jednorazowych. Jeśli dalsze działania wymagają dostępu, jego zakres uzgodnimy osobno, tak aby właściciel zachował kontrolę nad kontem.'],
      ['Zakres i warunki przed rozpoczęciem', 'Po ocenie zgłoszenia określamy, w czym możemy pomóc i jak będzie wyglądać współpraca. Metodę weryfikacji udostępnia Google; nie obiecujemy wyboru dowolnej metody ani pominięcia udziału właściciela, jeśli proces go wymaga.'],
      ['Weryfikacja a zawieszenie profilu', 'Jeśli wizytówka została zawieszona, potrzebna jest ocena innego problemu niż samo potwierdzenie firmy. Wskaż taki komunikat w zgłoszeniu lub przejdź do usługi odwieszania. Właściwe rozpoznanie sytuacji pozwala dobrać zakres zamiast powielać niedopasowane działania.'],
    ], [
      ['Czy wybieracie metodę weryfikacji Google?', 'Nie. Dostępne metody wskazuje Google. Nasza pomoc dotyczy przygotowania i obsługi procesu w zakresie ustalonym dla danej firmy.'],
      ['Czy potrzebny będzie mój udział?', 'Może być konieczny, zależnie od metody wskazanej przez Google. Ustalimy zakres pomocy po ocenie sytuacji.'],
      ['Czy gwarantujecie potwierdzenie profilu?', 'Nie gwarantujemy decyzji Google. Pomagamy rzeczywiście działającym firmom; ocena profilu pozostaje po stronie platformy.'],
      ['Czy przy zgłoszeniu pobieracie opłatę?', 'Formularz tej usługi służy kontaktowi i weryfikacji sprawy. Cenę oraz zasady współpracy ustalamy przed rozpoczęciem.'],
    ], ['odwieszanie-wizytowek-google', 'usuwanie-wizytowki-google', 'pozycjonowanie-wizytowki-google.html']),
  page('odwieszanie-wizytowek-google', 'Odwieszanie wizytówki Google | Pomoc z profilem',
    'Zawieszona wizytówka Google? Zajmijmy się przyczyną.',
    'Utrata widoczności lub ograniczenie profilu może przerwać dopływ zapytań od klientów. Pomagamy ocenić zawieszenie i przygotować obsługę sprawy o przywrócenie wizytówki.',
    'odwieszanie', 'Zgłoś zawieszoną wizytówkę', [
      ['Zawieszenie to problem z obecnością firmy, nie tylko komunikat', 'Gdy klient nie znajduje właściwego profilu, trudniej o telefon, wyznaczenie trasy i pierwsze zaufanie. Wiemy, dlaczego właściciel chce szybko wrócić do normalnej pracy. Zaczynamy od oceny sytuacji, aby działania odnosiły się do konkretnego profilu. Opisz, od kiedy występuje problem i czy ogranicza widoczność firmy, czy możliwość zarządzania. Takie rozróżnienie pomaga ustalić oczekiwania wobec usługi bez obiecywania wyniku przed analizą.'],
      ['Analiza przed kolejną próbą przywrócenia', 'Sprawdzamy przekazane informacje o firmie, profilu i dotychczasowym przebiegu sprawy. Podobny komunikat może towarzyszyć różnym sytuacjom. Nie obiecujemy skuteczności jednego uniwersalnego zgłoszenia; zakres pomocy ustalamy dopiero po poznaniu kontekstu.'],
      ['Uporządkowane informacje o realnym biznesie', 'Współpraca opiera się na rzeczywistej działalności i prawdziwych danych. Pomagamy określić zakres materiałów potrzebnych do obsługi sprawy. Nie proponujemy fikcyjnych dokumentów, lokalizacji ani obchodzenia decyzji przez tworzenie pozornie nowych firm.'],
      ['Przejrzysty plan i warunki obsługi', 'Przed rozpoczęciem ustalamy dokładny zakres współpracy, plan działań oraz ostateczną cenę. Potrzebny udział właściciela i ewentualny dostęp do profilu uzgadniamy osobno — nie podawaj hasła do konta Google w formularzu.'],
      ['Decyzja Google bez obietnic konkretnego terminu', 'Przywrócenie wizytówki zależy od oceny platformy. Czas odpowiedzi może się różnić między sprawami, a wcześniejsza obecność profilu nie gwarantuje ponownej publikacji. Nasza rola to obsługa uzgodnionego procesu i informowanie o jego przebiegu.'],
    ], [
      ['Czy odwieszacie każdą wizytówkę?', 'Nie możemy zagwarantować przywrócenia każdego profilu. Najpierw oceniamy rzeczywistą sytuację firmy i zakres możliwej pomocy.'],
      ['Czy pomożecie po wcześniejszej odmowie?', 'Opisz dotychczasowy przebieg sprawy w zgłoszeniu. Możliwość dalszej obsługi ocenimy indywidualnie; odmowa nie pozwala z góry przesądzić wyniku.'],
      ['Ile trwa przywrócenie wizytówki?', 'Zależy to od sprawy i odpowiedzi Google. Nie obiecujemy jednego terminu ani ekspresowej decyzji platformy.'],
      ['Czy weryfikacja i odwieszenie to to samo?', 'Nie. Potwierdzenie firmy i przywrócenie zawieszonego profilu to różne potrzeby. Wskaż komunikat, który widzisz, aby dopasować usługę.'],
    ], ['weryfikacja-wizytowek-google', 'pozycjonowanie-wizytowki-google.html', 'usuwanie-opinii-google']),
  page('usuwanie-opinii', 'Usuwanie opinii w internecie | Google i portale',
    'Twoja firma to więcej niż jeden komentarz.',
    'Pomagamy w usuwaniu opinii z Google i portali takich jak GoWork, Aleo czy Panorama Firm. Zgłoś problem do bezpłatnej oceny i poznaj zakres obsługi. Wycenę i strategię ustalamy przed podjęciem działań.',
    'usuwanie-opinii', 'Zgłoś opinię do bezpłatnej oceny', [
      ['Zadbaj o moment, w którym klient sprawdza Twoją firmę', 'Opinie towarzyszą decyzjom o zakupie, kontakcie i współpracy. Nieprawdziwy lub nieadekwatny wpis może budować obraz, który nie odpowiada rzeczywistości. Nasza obsługa pomaga ocenić wskazane treści i podjąć uzasadnione działania, bez przerzucania procedur na właściciela firmy. Odróżniamy przy tym ocenę publikacji od obietnic poprawy oceny całego przedsiębiorstwa. Zakres zlecenia zawsze odnosi się do określonych opinii lub wskazanego profilu.'],
      ['Google i portale — jeden punkt kontaktu', 'Obsługujemy zgłoszenia dotyczące Map Google oraz wybranych portali z opiniami, w tym GoWork, Aleo i Panoramy Firm. W formularzu wybierasz miejsce publikacji. Dzięki temu od początku wiemy, z jakim rodzajem sprawy mamy do czynienia i jaki zakres trzeba ocenić.'],
      ['Negatywna opinia nie zawsze nadaje się do usunięcia', 'Ocenie podlegają treść i okoliczności, a nie tylko liczba gwiazdek lub emocje autora. Nie usuwamy krytyki przez sam fakt, że jest niekorzystna dla firmy. Jasno rozróżniamy możliwość zgłoszenia sprawy od gwarancji, że platforma wycofa publikację.'],
      ['Jasne warunki współpracy', 'Formularz usuwania opinii nie wymaga opłat przy przesłaniu zapytania. Przed rozpoczęciem potwierdzamy zakres, cenę i plan działania. Wycena jest zawsze przejrzysta i znana z góry.'],
      ['Potrzebujesz usunięcia całego profilu?', 'To osobny zakres usługi. W formularzu możesz wybrać profil zamiast opinii; wtedy zmienią się warunki i zakres działań. Przy portalach najpierw weryfikujemy firmę po NIP, a dopiero później pokazujemy dostępne portale z cenami.'],
    ], [
      ['Z jakich miejsc można zgłosić opinie?', 'Z Map Google oraz obsługiwanych portali widocznych w formularzu. Wybierz właściwe miejsce publikacji przed opisaniem problemu.'],
      ['Czy przyjmujecie zgłoszenia od spółek i fundacji?', 'Tak, usuwanie opinii nie ma ograniczenia do JDG i spółek cywilnych. Odrębne kryteria dotyczą usuwania całych profili na portalach.'],
      ['Czy gwarantujecie usunięcie każdej opinii?', 'Nie. Sprawdzamy podstawy działania, ale o pozostawieniu lub usunięciu treści decyduje platforma.'],
      ['Jak zacząć współpracę?', 'Otwórz formularz, wybierz miejsce oraz opinie i wskaż firmę. Przeanalizujemy sprawę i przedstawimy bezpłatną wycenę oraz plan działania.'],
    ], ['usuwanie-opinii-google', 'usuwanie-opinii-google-cena', 'usuwanie-opinii-formularz']),
];

export const defaultPages: ContentPage[] = [
  ...legacyPages.filter(page => !serviceLandings.some(landing => page.slug === landing.slug + '.html')),
  ...serviceLandings,
];

export function landingFor(slug: string) {
  return serviceLandings.find(page => page.slug === slug);
}
