export const reviewPortals = [
  { id: 'aleo', name: 'Aleo' },
  { id: 'gowork', name: 'GoWork' },
  { id: 'panorama-firm', name: 'Panorama Firm' },
  { id: 'biznes-finder', name: 'Biznes Finder' },
  { id: 'pkt-pl', name: 'PKT.pl' },
  { id: 'podobne-firmy', name: 'Podobne Firmy' },
  { id: 'puls-biznesu', name: 'Puls Biznesu' },
] as const;

export type ReviewPortal = typeof reviewPortals[number]['id'] | 'google';
export type ReputationTarget = 'reviews' | 'profile';

export type ServiceQuote = {
  kind: 'payu';
  serviceName: string;
  netCents: number;
  totalCents: number;
} | {
  kind: 'result';
  serviceName: string;
  netCents: number | null;
  totalCents: number | null;
};

const profileNames: Record<ReviewPortal, string> = {
  google: 'Usunięcie wizytówki Google',
  'aleo': 'Usunięcie profilu Aleo',
  gowork: 'Usunięcie profilu GoWork',
  'panorama-firm': 'Usunięcie profilu Panorama Firm',
  'biznes-finder': 'Usunięcie profilu Biznes Finder',
  'pkt-pl': 'Usunięcie profilu PKT.pl',
  'podobne-firmy': 'Usunięcie profilu Podobne Firmy',
  'puls-biznesu': 'Usunięcie profilu Puls Biznesu',
};

const reviewNames: Record<ReviewPortal, string> = {
  google: 'Usunięcie opinii Google',
  'aleo': 'Usunięcie opinii z Aleo',
  gowork: 'Usunięcie opinii z GoWork',
  'panorama-firm': 'Usunięcie opinii z Panoramy Firm',
  'biznes-finder': 'Usunięcie opinii z Biznes Finder',
  'pkt-pl': 'Usunięcie opinii z PKT.pl',
  'podobne-firmy': 'Usunięcie opinii z Podobne Firmy',
  'puls-biznesu': 'Usunięcie opinii z Pulsu Biznesu',
};

export const outcomeServiceIds = new Set(['usuwanie-opinii', 'usuwanie-opinii-portale']);
export const isOutcomeService = (service: string) => outcomeServiceIds.has(service);
export const isReviewPortal = (portal: string): portal is ReviewPortal =>
  portal === 'google' || reviewPortals.some((item) => item.id === portal);

export function reputationQuote(target: ReputationTarget, portal: ReviewPortal): ServiceQuote {
  if (target === 'reviews') {
    return {
      kind: 'result',
      serviceName: reviewNames[portal],
      netCents: portal === 'google' ? 19_900 : null,
      totalCents: portal === 'google' ? 24_477 : null,
    };
  }

  const netCents = portal === 'google' || portal === 'gowork' ? 99_900 : 54_900;
  return {
    kind: 'payu',
    serviceName: profileNames[portal],
    netCents,
    totalCents: Math.round(netCents * 1.23),
  };
}

export function reputationPortalsQuote(target: ReputationTarget, portals: ReviewPortal[]): ServiceQuote {
  if (portals.length === 1) return reputationQuote(target, portals[0]);
  if (target === 'reviews') {
    return {
      kind: 'result',
      serviceName: portals.map((portal) => reviewNames[portal]).join(', '),
      netCents: null,
      totalCents: null,
    };
  }
  const quotes = portals.map((portal) => reputationQuote(target, portal));
  if (!quotes.every((quote) => quote.kind === 'payu')) throw new Error('Invalid portal profile quote');
  return {
    kind: 'payu',
    serviceName: quotes.map((quote) => quote.serviceName).join(', '),
    netCents: quotes.reduce((total, quote) => total + quote.netCents, 0),
    totalCents: quotes.reduce((total, quote) => total + quote.totalCents, 0),
  };
}

export function formatPln(cents: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cents / 100);
}
