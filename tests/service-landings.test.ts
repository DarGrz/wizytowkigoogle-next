import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultPages, serviceLandings } from '../lib/service-landings';
import config from '../next.config';
import { serviceIds } from '../lib/content';
import sitemap from '../app/sitemap';
import { orderSchema } from '../lib/validation';

const requested = ['usuwanie-aleo', 'usuwanie-firmy-z-google', 'usuwanie-gowork', 'usuwanie-opinii-formularz',
  'usuwanie-opinii-google-cena', 'usuwanie-opinii-google', 'usuwanie-panorama-firm', 'usuwanie-wizytowki-google',
  'weryfikacja-wizytowek-google', 'odwieszanie-wizytowek-google', 'jak-usunac-firme-z-google', 'usuwanie-opinii'];

test('all requested landing pages have unique canonical paths and substantive individual copy', () => {
  assert.deepEqual(serviceLandings.map(page => page.slug).sort(), requested.sort());
  assert.equal(defaultPages.length, 15);
  assert.equal(new Set(defaultPages.map(page => page.slug)).size, 15);
  for (const key of ['title', 'seoTitle', 'seoDescription', 'intro'] as const) {
    assert.equal(new Set(serviceLandings.map(page => page[key])).size, 12, key);
  }
  for (const page of serviceLandings) {
    assert.ok(serviceIds.includes(page.service), page.slug);
    assert.equal(page.sections.length, 5);
    assert.equal(page.faq.length, 4);
    assert.ok(page.seoDescription.length >= 100 && page.seoDescription.length <= 160, page.slug);
    assert.ok(page.sections.map(section => section.text).join(' ').split(/\s+/).length >= 180, page.slug);
    assert.doesNotMatch(JSON.stringify(page), /\bRODO\b/i);
    assert.ok(page.related.every(slug => defaultPages.some(other => other.slug === slug && slug !== page.slug)), page.slug);
    assert.ok(!defaultPages.some(other => other.slug === page.slug + '.html'));
  }
});

test('legacy HTML addresses redirect permanently to the extensionless canonical URLs', async () => {
  const redirects = await config.redirects!();
  for (const page of serviceLandings) {
    assert.ok(redirects.some(rule => rule.source === '/' + page.slug + '.html' && rule.destination === '/' + page.slug && rule.permanent));
  }
  const urls = sitemap().map(item => new URL(item.url).pathname);
  for (const page of serviceLandings) {
    assert.ok(urls.includes('/' + page.slug));
    assert.ok(!urls.includes('/' + page.slug + '.html'));
  }
});

test('landing page modal presets produce valid service and portal combinations', () => {
  for (const page of serviceLandings) {
    const selection = page.selection;
    if (!selection) continue;
    const company = { name: 'Firma Testowa', nip: '5261040828', regon: '000331501', address: 'Warszawa', legalForm: 'sole-trader' };
    const order = {
      service: page.service, company: company.name, email: 'test@example.com', phone: '500600700',
      profileUrl: '', keywords: '', description: 'Opis sprawy', privacy: true, website: '',
      requestId: 'b94ac8b7-749b-4f23-a556-a3b1e5560091', context: 'reputation',
      businessSource: selection.source, target: selection.target, portal: selection.portal,
      portals: [selection.portal], registryCompany: selection.source === 'portals' ? company : undefined,
    };
    assert.equal(orderSchema.safeParse(order).success, true, page.slug);
  }
});
