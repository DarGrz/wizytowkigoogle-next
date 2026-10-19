import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNip, validNip, isEligiblePortalProfileCompany, suggestProfileRemoval, type RegistryCompany } from '../lib/company';
import { parseCompanies, parseLegalForm, searchGus } from '../lib/gus';
import { POST } from '../app/api/gus/route';

const nip = '5261040828';
const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const soap = (operation: string, value: string) => `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body><${operation}Response><${operation}Result>${escape(value)}</${operation}Result></${operation}Response></s:Body></s:Envelope>`;
const row = `<dane><Nazwa>Firma &amp; Partnerzy</Nazwa><Nip>${nip}</Nip><Regon>000331501</Regon><Ulica>Testowa</Ulica><NrNieruchomosci>2</NrNieruchomosci><NrLokalu>3</NrLokalu><KodPocztowy>00-001</KodPocztowy><Miejscowosc>Warszawa</Miejscowosc></dane>`;
const response = soap('DaneSzukajPodmioty', `<root>${row}</root>`);

test('NIP requires a correct checksum and supports common formatting', () => {
  assert.equal(normalizeNip('526-104-08-28'), nip);
  assert.equal(validNip('526 104 08 28'), true);
  for (const input of ['', '0000000000', '1234567890', 'PL5261040828', '<5261040828>', '526104082']) assert.equal(validNip(input), false);
});

test('parses escaped SOAP XML, MTOM wrappers, addresses and multiple companies', () => {
  const expected = [{ name: 'Firma & Partnerzy', nip, regon: '000331501', address: 'Testowa 2/3, 00-001 Warszawa' }];
  assert.deepEqual(parseCompanies(response), expected);
  assert.deepEqual(parseCompanies(`--boundary\r\nContent-Type: application/xop+xml\r\n\r\n${response}\r\n--boundary--`), expected);
  assert.equal(parseCompanies(soap('DaneSzukajPodmioty', `<root>${row}${row}</root>`)).length, 2);
  assert.deepEqual(parseCompanies(soap('DaneSzukajPodmioty', '')), []);
  assert.deepEqual(parseCompanies(soap('DaneSzukajPodmioty', '<root/>')), []);
  assert.deepEqual(parseCompanies(soap('DaneSzukajPodmioty', '<root><dane><ErrorCode>4</ErrorCode></dane></root>')), []);
});

test('rejects malformed XML, SOAP faults, error reports and incomplete records', () => {
  for (const value of [
    'not xml',
    '<s:Envelope xmlns:s="soap"><s:Body><s:Fault>error</s:Fault></s:Body></s:Envelope>',
    soap('DaneSzukajPodmioty', '<root><dane>'),
    soap('DaneSzukajPodmioty', '<!DOCTYPE root [<!ENTITY x "secret">]><root>&x;</root>'),
    soap('DaneSzukajPodmioty', '<root><dane><ErrorCode>7</ErrorCode></dane></root>'),
    soap('DaneSzukajPodmioty', '<root><dane><Nazwa>Firma</Nazwa></dane></root>'),
  ]) assert.throws(() => parseCompanies(value));
});

test('GUS uses server credentials, correct SOAP action, session header and logout', async (t) => {
  t.mock.property(process, 'env', { ...process.env, BIR_API_URL: 'https://gus.example/service', BIR_API_KEY: 'test-key-not-a-secret' });
  const operations: string[] = [];
  t.mock.method(globalThis, 'fetch', async (_url: string, init: RequestInit) => {
    const headers = new Headers(init.headers);
    const operation = headers.get('SOAPAction')!.split('/').pop()!;
    operations.push(operation);
    assert.equal(init.cache, 'no-store');
    if (operation === 'Zaloguj') {
      assert.ok(String(init.body).includes('test-key-not-a-secret'));
      return new Response(soap('Zaloguj', 'session12345678901234'));
    }
    assert.equal(headers.get('sid'), 'session12345678901234');
    if (operation === 'Wyloguj') return new Response(soap('Wyloguj', 'true'));
    assert.ok(String(init.body).includes(`<d:Nip>${nip}</d:Nip>`));
    return new Response(response);
  });
  assert.equal((await searchGus(nip))[0].nip, nip);
  assert.deepEqual(operations, ['Zaloguj', 'DaneSzukajPodmioty', 'Wyloguj']);
});

test('lookup failures still close the GUS session', async (t) => {
  t.mock.property(process, 'env', { ...process.env, BIR_API_URL: 'https://gus.example/service', BIR_API_KEY: 'test-key' });
  let loggedOut = false;
  t.mock.method(globalThis, 'fetch', async (_url: string, init: RequestInit) => {
    const operation = new Headers(init.headers).get('SOAPAction')!.split('/').pop();
    if (operation === 'Zaloguj') return new Response(soap('Zaloguj', 'session12345678901234'));
    if (operation === 'Wyloguj') { loggedOut = true; return new Response(soap('Wyloguj', 'true')); }
    return new Response('Unavailable', { status: 503 });
  });
  await assert.rejects(searchGus(nip), /GUS_HTTP_503/);
  assert.equal(loggedOut, true);
});

test('API validates origin and input before contacting GUS', async (t) => {
  t.mock.property(process, 'env', { ...process.env, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' });
  const upstream = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Must not call upstream'); });
  const request = (value: string, origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/gus', { method: 'POST', headers: { origin }, body: value });
  assert.equal((await POST(request(JSON.stringify({ nip }), 'https://other.example'))).status, 403);
  assert.equal((await POST(request(JSON.stringify({ nip: '1234567890' })))).status, 400);
  assert.equal((await POST(request('{bad'))).status, 400);
  assert.equal(upstream.mock.callCount(), 0);
});

test('GUS API returns companies without needing the orders database', async (t) => {
  t.mock.property(process, 'env', { ...process.env, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000', BIR_API_URL: 'https://gus.example/service', BIR_API_KEY: 'test-key', DATABASE_URL: '' });
  t.mock.method(globalThis, 'fetch', async (_url: string, init: RequestInit) => {
    const operation = new Headers(init.headers).get('SOAPAction')!.split('/').pop();
    return new Response(operation === 'Zaloguj' ? soap('Zaloguj', 'session12345678901234') : operation === 'Wyloguj' ? soap('Wyloguj', 'true') : response);
  });
  const result = await POST(new Request('http://localhost:3000/api/gus', { method: 'POST', headers: { origin: 'http://localhost:3000' }, body: JSON.stringify({ nip }) }));
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  const data = await result.json();
  assert.equal(data.results[0].nip, nip);
  assert.equal(JSON.stringify(data).includes('session12345678901234'), false);
});

test('missing GUS configuration returns an explicit availability error', async (t) => {
  t.mock.property(process, 'env', { ...process.env, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000', BIR_API_KEY: '', BIR_API_URL: '' });
  const result = await POST(new Request('http://localhost:3000/api/gus', { method: 'POST', headers: { origin: 'http://localhost:3000' }, body: JSON.stringify({ nip }) }));
  assert.equal(result.status, 503);
  assert.ok((await result.json()).error);
});

test('legal forms come from official GUS codes and the matching REGON, not company names', () => {
  for (const [entity, prefix, code, expected] of [
    ['F','fiz','099','sole-trader'],
    ['P','praw','019','civil-partnership'],
    ['P','praw','19','civil-partnership'],
    ['P','praw','117','other'],
    ['P','praw','099','other'],
    ['F','fiz','019','other'],
  ] as const) {
    const report=soap('DanePobierzPelnyRaport',`<root><dane><${prefix}_regon9>000331501</${prefix}_regon9><${prefix}_szczegolnaFormaPrawna_Symbol>${code}</${prefix}_szczegolnaFormaPrawna_Symbol><${prefix}_szczegolnaFormaPrawna_Nazwa>Forma prawna</${prefix}_szczegolnaFormaPrawna_Nazwa></dane></root>`);
    assert.equal(parseLegalForm(report,'000331501',entity).legalForm,expected);
    assert.throws(()=>parseLegalForm(report,'000000001',entity),/REGON_MISMATCH/);
  }
  assert.throws(()=>parseLegalForm(soap('DanePobierzPelnyRaport','<root><dane><praw_regon9>000331501</praw_regon9></dane></root>'),'000331501','P'));
});

test('only portal reviews for JDG or civil partnerships receive the profile suggestion', () => {
  const company: RegistryCompany={name:'Spółka cywilna w nazwie to nie dowód',nip,regon:'000331501',address:'Warszawa'};
  for (const legalForm of ['sole-trader','civil-partnership','other','unknown',undefined] as const) {
    assert.equal(suggestProfileRemoval('portals','reviews',{...company,legalForm}),legalForm==='sole-trader'||legalForm==='civil-partnership');
    assert.equal(suggestProfileRemoval('google','reviews',{...company,legalForm}),false);
    assert.equal(suggestProfileRemoval('portals','profile',{...company,legalForm}),false);
  }
  assert.equal(suggestProfileRemoval('portals','reviews'),false);
});

test('only CEIDG sole traders and civil partnerships may request portal profile removal', () => {
  const company: RegistryCompany={name:'Firma testowa',nip,regon:'000331501',address:'Warszawa'};
  for (const legalForm of ['sole-trader','civil-partnership','other','unknown',undefined] as const) {
    assert.equal(isEligiblePortalProfileCompany({...company,legalForm}),legalForm==='sole-trader'||legalForm==='civil-partnership');
  }
  assert.equal(isEligiblePortalProfileCompany(undefined),false);
});

test('GUS lookup enriches physical and legal entities with the correct full report', async (t) => {
  t.mock.property(process,'env',{...process.env,BIR_API_URL:'https://gus.example/service',BIR_API_KEY:'test-key'});
  for (const [entity,prefix,code,reportName,expected] of [
    ['F','fiz','099','BIR11OsFizycznaDaneOgolne','sole-trader'],
    ['P','praw','019','BIR11OsPrawna','civil-partnership'],
  ] as const) {
    let fullReportRequested=false;
    const mock=t.mock.method(globalThis,'fetch',async (_url:string,init:RequestInit)=>{
      const operation=new Headers(init.headers).get('SOAPAction')!.split('/').pop();
      if(operation==='Zaloguj')return new Response(soap('Zaloguj','session12345678901234'));
      if(operation==='Wyloguj')return new Response(soap('Wyloguj','true'));
      if(operation==='DaneSzukajPodmioty')return new Response(soap(operation,`<root>${row.replace('</dane>',`<Typ>${entity}</Typ></dane>`)}</root>`));
      fullReportRequested=true;
      assert.equal(operation,'DanePobierzPelnyRaport');
      assert.ok(String(init.body).includes(`<n:pNazwaRaportu>${reportName}</n:pNazwaRaportu>`));
      return new Response(soap(operation,`<root><dane><${prefix}_regon9>000331501</${prefix}_regon9><${prefix}_szczegolnaFormaPrawna_Symbol>${code}</${prefix}_szczegolnaFormaPrawna_Symbol><${prefix}_szczegolnaFormaPrawna_Nazwa>Forma prawna</${prefix}_szczegolnaFormaPrawna_Nazwa></dane></root>`));
    });
    assert.equal((await searchGus(nip))[0].legalForm,expected);
    assert.equal(fullReportRequested,true);
    mock.mock.restore();
  }
});
