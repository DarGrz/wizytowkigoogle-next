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

export async function recordCompanySearch(req: Request, log: CompanySearchLog): Promise<void> {
  if (!hasDatabase()) return;

  try {
    const ip = extractClientIp(req);
    const { city, region, country } = await resolveGeoLocation(req, ip);
    const visitTime = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;
    const keyword = log.searchQuery || log.companyName || log.companyNip || 'Wyszukiwanie';
    const companyDataStr = log.companyData ? JSON.stringify(log.companyData) : null;

    await exec(
      `INSERT INTO visits (
        ip_address, city, region, country, visit_time, keyword,
        search_type, company_name, company_nip, company_regon,
        company_address, company_phone, company_website,
        company_rating, company_reviews_count, place_id,
        company_data, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        ip,
        city,
        region,
        country,
        visitTime,
        keyword,
        log.searchType,
        log.companyName || null,
        log.companyNip || null,
        log.companyRegon || null,
        log.companyAddress || null,
        log.companyPhone || null,
        log.companyWebsite || null,
        typeof log.companyRating === 'number' ? log.companyRating : null,
        typeof log.companyReviewsCount === 'number' ? log.companyReviewsCount : null,
        log.placeId || null,
        companyDataStr,
        userAgent,
      ]
    );
  } catch (error) {
    console.error('Failed to record company visit:', error);
  }
}
