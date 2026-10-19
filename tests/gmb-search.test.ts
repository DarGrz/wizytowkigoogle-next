import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET } from '../app/api/gmb-search/route';

test('Google provider failures are reported instead of appearing as empty search results', async (t) => {
  t.mock.property(process, 'env', { ...process.env, GOOGLE_PLACES_API_KEY: 'test-key' });
  t.mock.method(globalThis, 'fetch', async () => Response.json({ status: 'REQUEST_DENIED', predictions: [] }));
  const response = await GET(new NextRequest('http://localhost:3000/api/gmb-search?query=denied-search'));
  assert.equal(response.status, 500);
  assert.ok((await response.json()).error);
});

test('Google returns named places with address and identifier', async (t) => {
  t.mock.property(process, 'env', { ...process.env, GOOGLE_PLACES_API_KEY: 'test-key' });
  t.mock.method(globalThis, 'fetch', async () => Response.json({ status: 'OK', predictions: [{ description: 'Firma Warszawa', place_id: 'place123', structured_formatting: { main_text: 'Firma', secondary_text: 'Warszawa' } }] }));
  const response = await GET(new NextRequest('http://localhost:3000/api/gmb-search?query=successful-search'));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).results[0], { id: 'gmb-0-place123', name: 'Firma', address: 'Warszawa', placeId: 'place123' });
});
