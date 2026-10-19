export type RegistryCompany = {
  name: string;
  nip: string;
  regon: string;
  address: string;
  entityType?: 'P' | 'F' | 'LP' | 'LF';
  legalForm?: 'sole-trader' | 'civil-partnership' | 'other' | 'unknown';
  legalFormLabel?: string;
  legalFormCode?: string;
};

export function isEligiblePortalProfileCompany(company?: RegistryCompany) {
  return company?.legalForm === 'sole-trader' || company?.legalForm === 'civil-partnership';
}

export function suggestProfileRemoval(source: 'google' | 'portals', target: 'reviews' | 'profile', company?: RegistryCompany) {
  return source === 'portals' && target === 'reviews' &&
    isEligiblePortalProfileCompany(company);
}

export function normalizeNip(value: string) {
  return value.replace(/[\s-]/g, '');
}

export function validNip(value: string) {
  const nip = normalizeNip(value);
  if (!/^\d{10}$/.test(nip) || /^(\d)\1{9}$/.test(nip)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  return weights.reduce((sum, weight, index) => sum + weight * Number(nip[index]), 0) % 11 === Number(nip[9]);
}
