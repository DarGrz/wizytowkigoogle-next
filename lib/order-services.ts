import catalog from './order-services.json';

export type OrderContext = 'google' | 'reputation';
export type BusinessSource = 'google' | 'portals';
export const googleServices = catalog.google;
export const portalServices = catalog.portals;
export const legacyServices = catalog.legacy;
export const reputationGoogleServices = googleServices.filter((service) =>
  ['usuwanie-opinii', 'usuwanie-wizytowki', 'resetowanie-wizytowki'].includes(service.id)
);

export function orderServices(context: OrderContext, source: BusinessSource, initialService = '') {
  if (context === 'reputation') return source === 'portals' ? portalServices : reputationGoogleServices;
  const legacy = legacyServices.find((service) => service.id === initialService);
  return legacy ? [...googleServices, legacy] : googleServices;
}
