import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reputationPortalsQuote, reputationQuote, reviewPortals } from '../lib/reputation-pricing';

test('profile quotes match the Wizaro net prices plus 23 percent VAT', () => {
  assert.deepEqual(reputationQuote('profile', 'google'), {
    kind: 'payu', serviceName: 'Usunięcie wizytówki Google', netCents: 99_900, totalCents: 122_877,
  });
  assert.deepEqual(reputationQuote('profile', 'gowork'), {
    kind: 'payu', serviceName: 'Usunięcie profilu GoWork', netCents: 99_900, totalCents: 122_877,
  });
  for (const portal of reviewPortals.filter(({ id }) => id !== 'gowork')) {
    assert.equal(reputationQuote('profile', portal.id).totalCents, 67_527);
  }
});

test('review removal is not charged upfront', () => {
  assert.deepEqual(reputationQuote('reviews', 'google'), {
    kind: 'result', serviceName: 'Usunięcie opinii Google', netCents: 19_900, totalCents: 24_477,
  });

  test('multi-portal profile quote sums each selected portal price', () => {
    const quote = reputationPortalsQuote('profile', ['aleo', 'gowork', 'panorama-firm']);
    assert.deepEqual(quote, {
      kind: 'payu',
      serviceName: 'Usunięcie profilu Aleo, Usunięcie profilu GoWork, Usunięcie profilu Panorama Firm',
      netCents: 209_700,
      totalCents: 257_931,
    });
  });
  for (const portal of reviewPortals) {
    const quote = reputationQuote('reviews', portal.id);
    assert.equal(quote.kind, 'result');
    assert.equal(quote.totalCents, null);
  }
});
