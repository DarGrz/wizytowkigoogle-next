import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { z } from 'zod';
import { normalizeNip, validNip, type RegistryCompany } from './company';

const namespace = 'http://CIS/BIR/PUBL/2014/07';
const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true, parseTagValue: false });
const record = z.record(z.string(), z.unknown());

function xml(value: string): unknown {
  if (/<!DOCTYPE|<!ENTITY/i.test(value) || XMLValidator.validate(value) !== true) {
    throw new Error('GUS_INVALID_XML');
  }
  return parser.parse(value);
}

function result(response: string, operation: string): string {
  // BIR can wrap the SOAP envelope in a multipart/related (MTOM) response.
  const envelope = response.match(/<(?:[\w-]+:)?Envelope\b[\s\S]*?<\/(?:[\w-]+:)?Envelope>/)?.[0];
  if (!envelope) throw new Error('GUS_INVALID_ENVELOPE');
  const root = record.parse(xml(envelope));
  const body = record.parse(record.parse(root.Envelope).Body);
  if ('Fault' in body) throw new Error('GUS_SOAP_FAULT');
  return z.string().parse(record.parse(body[operation + 'Response'])[operation + 'Result']);
}

const companyRow = z.object({
  Nazwa: z.string().min(1).max(200),
  Nip: z.string().regex(/^\d{10}$/),
  Regon: z.string().regex(/^\d{9}(?:\d{5})?$/),
  Ulica: z.string().default(''),
  NrNieruchomosci: z.string().default(''),
  NrLokalu: z.string().default(''),
  KodPocztowy: z.string().default(''),
  Miejscowosc: z.string().default(''),
  Typ: z.enum(['P', 'F', 'LP', 'LF']).optional(),
});

export function parseCompanies(response: string): RegistryCompany[] {
  const payload = result(response, 'DaneSzukajPodmioty');
  if (!payload.trim()) return [];
  const root = record.parse(xml(payload)).root;
  if (root === '') return [];
  const data = record.parse(root).dane;
  if (!data) throw new Error('GUS_INVALID_COMPANY_RESPONSE');
  return (Array.isArray(data) ? data : [data]).flatMap((entry) => {
    const raw = record.parse(entry);
    if (raw.ErrorCode === '4') return [];
    if ('ErrorCode' in raw) throw new Error('GUS_SEARCH_ERROR');
    const company = companyRow.parse(raw);
    const building = company.NrNieruchomosci + (company.NrLokalu ? '/' + company.NrLokalu : '');
    return [{
      name: company.Nazwa,
      nip: company.Nip,
      regon: company.Regon,
      address: [[company.Ulica, building].filter(Boolean).join(' '), [company.KodPocztowy, company.Miejscowosc].filter(Boolean).join(' ')].filter(Boolean).join(', '),
      ...(company.Typ ? { entityType: company.Typ } : {}),
    }];
  });
}

export function parseLegalForm(response: string, regon: string, entityType: NonNullable<RegistryCompany['entityType']>): Pick<RegistryCompany, 'legalForm' | 'legalFormLabel' | 'legalFormCode'> {
  const payload = result(response, 'DanePobierzPelnyRaport');
  const data = record.parse(record.parse(xml(payload)).root).dane;
  const entry = record.parse(data);
  const prefix = entityType === 'F' || entityType === 'LF' ? 'fiz' : 'praw';
  if (entry[`${prefix}_regon9`] !== regon.slice(0, 9)) throw new Error('GUS_REPORT_REGON_MISMATCH');
  const code = z.string().regex(/^\d{1,3}$/).parse(entry[`${prefix}_szczegolnaFormaPrawna_Symbol`]).padStart(3, '0');
  const label = z.string().min(1).max(300).parse(entry[`${prefix}_szczegolnaFormaPrawna_Nazwa`]);
  return {
    legalForm: prefix === 'fiz' && code === '099' ? 'sole-trader' : prefix === 'praw' && code === '019' ? 'civil-partnership' : 'other',
    legalFormCode: code,
    legalFormLabel: label,
  };
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
}

export async function searchGus(nip: string): Promise<RegistryCompany[]> {
  if (!validNip(nip)) throw new Error('GUS_INVALID_NIP');
  const url = process.env.BIR_API_URL;
  const key = process.env.BIR_API_KEY;
  if (!url || !key) throw new Error('GUS_NOT_CONFIGURED');
  if (new URL(url).protocol !== 'https:') throw new Error('GUS_HTTPS_REQUIRED');

  async function call(operation: string, content: string, sid?: string) {
    const action = `${namespace}/IUslugaBIRzewnPubl/${operation}`;
    const response = await fetch(url!, {
      method: 'POST',
      headers: {
        'Content-Type': `application/soap+xml; charset=utf-8; action="${action}"`,
        SOAPAction: action,
        ...(sid ? { sid } : {}),
      },
      body: `<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:n="${namespace}" xmlns:d="${namespace}/DataContract"><s:Header><a:Action>${action}</a:Action><a:To>${escapeXml(url!)}</a:To></s:Header><s:Body><n:${operation}>${content}</n:${operation}></s:Body></s:Envelope>`,
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`GUS_HTTP_${response.status}`);
    return response.text();
  }

  const sid = result(await call('Zaloguj', `<n:pKluczUzytkownika>${escapeXml(key)}</n:pKluczUzytkownika>`), 'Zaloguj');
  if (!/^[a-zA-Z0-9]{10,64}$/.test(sid)) throw new Error('GUS_LOGIN_FAILED');
  try {
    const companies = parseCompanies(await call('DaneSzukajPodmioty', `<n:pParametryWyszukiwania><d:Nip>${normalizeNip(nip)}</d:Nip></n:pParametryWyszukiwania>`, sid));
    if (companies.some((company) => company.nip !== normalizeNip(nip))) throw new Error('GUS_NIP_MISMATCH');
    const enriched: RegistryCompany[] = [];
    for (const company of companies) {
      if (!company.entityType) {
        enriched.push({ ...company, legalForm: 'unknown' });
        continue;
      }
      const physical = company.entityType === 'F' || company.entityType === 'LF';
      const report = physical ? 'BIR11OsFizycznaDaneOgolne' : 'BIR11OsPrawna';
      const response = await call('DanePobierzPelnyRaport', `<n:pRegon>${company.regon.slice(0, 9)}</n:pRegon><n:pNazwaRaportu>${report}</n:pNazwaRaportu>`, sid);
      enriched.push({ ...company, ...parseLegalForm(response, company.regon, company.entityType) });
    }
    return enriched;
  } finally {
    try {
      const loggedOut = result(await call('Wyloguj', `<n:pIdentyfikatorSesji>${escapeXml(sid)}</n:pIdentyfikatorSesji>`, sid), 'Wyloguj');
      if (loggedOut !== 'true') console.error('GUS_LOGOUT_REJECTED');
    } catch {
      console.error('GUS_LOGOUT_FAILED');
    }
  }
}
