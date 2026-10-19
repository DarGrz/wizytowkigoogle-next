import { hasDatabase, exec } from './db';

export interface CompanySearchLog {
  searchType: 'google_maps' | 'places_details' | 'gus';
  searchQuery?: string | null;
  companyName?: string | null;
  companyNip?: string | null;
  companyRegon?: string | null;
  companyAddress?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  companyRating?: number | null;
  companyReviewsCount?: number | null;
  placeId?: string | null;
  companyData?: unknown;
}

export interface VisitorLogPayload {
  action?: string;
  phoneNumber?: string | null;
  time?: string | null;
  ip?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  keyword?: string | null;
  gclid?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  campaignId?: string | null;
  gadSource?: string | null;
  placement?: string | null;
  userAgent?: string | null;
  screenResolution?: string | null;
  timezone?: string | null;
  language?: string | null;
  platform?: string | null;
  fingerprintHash?: string | null;
  referrer?: string | null;
  hardwareConcurrency?: string | null;
  deviceMemory?: string | null;
  connectionType?: string | null;
  cookieEnabled?: string | null;
  searchType?: string | null;
  companyName?: string | null;
  companyNip?: string | null;
  companyRegon?: string | null;
  companyAddress?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  companyRating?: number | null;
  companyReviewsCount?: number | null;
  placeId?: string | null;
  companyData?: unknown;
}

export function extractClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '127.0.0.1';
}

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')) return true;
  return false;
}

export async function resolveGeoLocation(
  req: Request,
  ip: string
): Promise<{ city: string | null; region: string | null; country: string | null }> {
  const vCity = req.headers.get('x-vercel-ip-city');
  const vRegion = req.headers.get('x-vercel-ip-country-region');
  const vCountry = req.headers.get('x-vercel-ip-country');

  let city: string | null = vCity ? decodeURIComponent(vCity) : null;
  let region: string | null = vRegion ? decodeURIComponent(vRegion) : null;
  let country: string | null = vCountry ? decodeURIComponent(vCountry) : null;

  if (country === 'PL') country = 'Poland';

  // If Vercel headers provided city and country, use them
  if (city && country) {
    return { city, region, country };
  }

  // If not running in test and IP is public, fallback to ip-api lookup
  if (process.env.NODE_ENV !== 'test' && !isPrivateIp(ip)) {
    try {
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const data = (await res.json()) as { status?: string; country?: string; regionName?: string; city?: string };
        if (data.status === 'success') {
          city = city || data.city || null;
          region = region || data.regionName || null;
          country = country || data.country || null;
        }
      }
    } catch {
      // Ignore geo lookup timeout or error
    }
  }

  return { city, region, country };
}

export async function recordVisitorLog(req: Request, data: VisitorLogPayload): Promise<void> {
  if (!hasDatabase()) return;

  try {
    const rawIp = extractClientIp(req);
    const ip = data.ip && data.ip !== 'Server-determined' && !isPrivateIp(data.ip) ? data.ip : rawIp;
    const geo = await resolveGeoLocation(req, ip);
    const city = data.city && data.city !== 'Server-determined' ? data.city : geo.city;
    const region = data.region && data.region !== 'Server-determined' ? data.region : geo.region;
    const country = data.country && data.country !== 'Server-determined' ? data.country : geo.country;

    const visitTime = data.time || new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    const userAgent = data.userAgent || req.headers.get('user-agent')?.slice(0, 500) || null;
    const action = data.action || 'PAGE_VISIT';
    const keyword = data.keyword && data.keyword !== 'None' ? data.keyword : null;
    const gclid = data.gclid && data.gclid !== 'None' ? data.gclid : null;
    const utmSource = data.utmSource && data.utmSource !== 'None' ? data.utmSource : null;
    const utmMedium = data.utmMedium && data.utmMedium !== 'None' ? data.utmMedium : null;
    const utmCampaign = data.utmCampaign && data.utmCampaign !== 'None' ? data.utmCampaign : null;
    const utmTerm = data.utmTerm && data.utmTerm !== 'None' ? data.utmTerm : null;
    const utmContent = data.utmContent && data.utmContent !== 'None' ? data.utmContent : null;
    const campaignId = data.campaignId && data.campaignId !== 'None' ? data.campaignId : null;
    const gadSource = data.gadSource && data.gadSource !== 'None' ? data.gadSource : null;
    const placement = data.placement && data.placement !== 'None' ? data.placement : null;
    const companyDataStr = data.companyData ? JSON.stringify(data.companyData) : null;

    await exec(
      `INSERT INTO visits (
        action, ip_address, city, region, country, visit_time, phone_number,
        keyword, gclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        campaign_id, gad_source, placement, user_agent, screen_resolution, timezone,
        language, platform, fingerprint_hash, referrer, hardware_concurrency,
        device_memory, connection_type, cookie_enabled, search_type, company_name,
        company_nip, company_regon, company_address, company_phone, company_website,
        company_rating, company_reviews_count, place_id, company_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        action,
        ip,
        city,
        region,
        country,
        visitTime,
        data.phoneNumber || null,
        keyword,
        gclid,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        campaignId,
        gadSource,
        placement,
        userAgent,
        data.screenResolution || null,
        data.timezone || null,
        data.language || null,
        data.platform || null,
        data.fingerprintHash || null,
        data.referrer || null,
        data.hardwareConcurrency || null,
        data.deviceMemory || null,
        data.connectionType || null,
        data.cookieEnabled || null,
        data.searchType || null,
        data.companyName || null,
        data.companyNip || null,
        data.companyRegon || null,
        data.companyAddress || null,
        data.companyPhone || null,
        data.companyWebsite || null,
        typeof data.companyRating === 'number' ? data.companyRating : null,
        typeof data.companyReviewsCount === 'number' ? data.companyReviewsCount : null,
        data.placeId || null,
        companyDataStr
      ]
    );
  } catch (error) {
    console.error('Failed to record visitor log:', error);
  }
}

export async function recordCompanySearch(req: Request, log: CompanySearchLog): Promise<void> {
  const action = log.searchType === 'gus' ? 'GUS_LOOKUP' : 'BUSINESS_LOOKUP';
  await recordVisitorLog(req, {
    action,
    searchType: log.searchType,
    keyword: log.searchQuery || log.companyName || log.companyNip || 'Wyszukiwanie firmy',
    companyName: log.companyName,
    companyNip: log.companyNip,
    companyRegon: log.companyRegon,
    companyAddress: log.companyAddress,
    companyPhone: log.companyPhone,
    companyWebsite: log.companyWebsite,
    companyRating: log.companyRating,
    companyReviewsCount: log.companyReviewsCount,
    placeId: log.placeId,
    companyData: log.companyData
  });
}
