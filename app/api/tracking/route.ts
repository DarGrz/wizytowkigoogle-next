import { recordVisitorLog, type VisitorLogPayload } from '@/lib/visit-tracker';

// 1x1 transparent GIF buffer
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function parseParams(searchParams: URLSearchParams): VisitorLogPayload {
  return {
    action: searchParams.get('action') || 'PAGE_VISIT',
    phoneNumber: searchParams.get('phone_number') || searchParams.get('phone') || null,
    time: searchParams.get('time') || null,
    ip: searchParams.get('ip') || null,
    city: searchParams.get('city') || null,
    region: searchParams.get('region') || null,
    country: searchParams.get('country') || null,
    keyword: searchParams.get('keyword') || searchParams.get('q') || null,
    gclid: searchParams.get('gclid') || null,
    utmSource: searchParams.get('utm_source') || null,
    utmMedium: searchParams.get('utm_medium') || null,
    utmCampaign: searchParams.get('utm_campaign') || null,
    utmTerm: searchParams.get('utm_term') || null,
    utmContent: searchParams.get('utm_content') || null,
    campaignId: searchParams.get('campaign_id') || searchParams.get('utm_id') || searchParams.get('gad_campaignid') || null,
    gadSource: searchParams.get('gad_source') || null,
    placement: searchParams.get('placement') || null,
    userAgent: searchParams.get('user_agent') || null,
    screenResolution: searchParams.get('screen_resolution') || null,
    timezone: searchParams.get('timezone') || null,
    language: searchParams.get('language') || null,
    platform: searchParams.get('platform') || null,
    fingerprintHash: searchParams.get('fingerprint_hash') || null,
    referrer: searchParams.get('referrer') || null,
    hardwareConcurrency: searchParams.get('hardware_concurrency') || null,
    deviceMemory: searchParams.get('device_memory') || null,
    connectionType: searchParams.get('connection_type') || null,
    cookieEnabled: searchParams.get('cookie_enabled') || null,
  };
}

export async function POST(req: Request) {
  try {
    let payload: VisitorLogPayload = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await req.json();
      payload = {
        action: json.action || 'PAGE_VISIT',
        phoneNumber: json.phone_number || json.phoneNumber || null,
        time: json.time || null,
        ip: json.ip || null,
        city: json.city || null,
        region: json.region || null,
        country: json.country || null,
        keyword: json.keyword || null,
        gclid: json.gclid || null,
        utmSource: json.utm_source || json.utmSource || null,
        utmMedium: json.utm_medium || json.utmMedium || null,
        utmCampaign: json.utm_campaign || json.utmCampaign || null,
        utmTerm: json.utm_term || json.utmTerm || null,
        utmContent: json.utm_content || json.utmContent || null,
        campaignId: json.campaign_id || json.campaignId || null,
        gadSource: json.gad_source || json.gadSource || null,
        placement: json.placement || null,
        userAgent: json.user_agent || json.userAgent || null,
        screenResolution: json.screen_resolution || json.screenResolution || null,
        timezone: json.timezone || null,
        language: json.language || null,
        platform: json.platform || null,
        fingerprintHash: json.fingerprint_hash || json.fingerprintHash || null,
        referrer: json.referrer || null,
        hardwareConcurrency: json.hardware_concurrency || json.hardwareConcurrency || null,
        deviceMemory: json.device_memory || json.deviceMemory || null,
        connectionType: json.connection_type || json.connectionType || null,
        cookieEnabled: json.cookie_enabled || json.cookieEnabled || null,
        searchType: json.search_type || json.searchType || null,
        companyName: json.company_name || json.companyName || null,
        companyNip: json.company_nip || json.companyNip || null,
        companyRegon: json.company_regon || json.companyRegon || null,
        companyAddress: json.company_address || json.companyAddress || null,
        companyPhone: json.company_phone || json.companyPhone || null,
        companyWebsite: json.company_website || json.companyWebsite || null,
        companyRating: json.company_rating || json.companyRating || null,
        companyReviewsCount: json.company_reviews_count || json.companyReviewsCount || null,
        placeId: json.place_id || json.placeId || null,
        companyData: json.company_data || json.companyData || null,
      };
    } else {
      const formData = await req.formData();
      const params = new URLSearchParams();
      formData.forEach((val, key) => {
        if (typeof val === 'string') params.set(key, val);
      });
      payload = parseParams(params);
    }

    await recordVisitorLog(req, payload);

    return Response.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: unknown) {
    console.error('Tracking API error:', err);
    return Response.json({ error: 'Failed to record tracking' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payload = parseParams(searchParams);

    await recordVisitorLog(req, payload);

    return new Response(PIXEL_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: unknown) {
    console.error('Tracking pixel error:', err);
    return new Response(PIXEL_GIF, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' }
    });
  }
}
