import { NextRequest, NextResponse } from 'next/server';
import { recordCompanySearch } from '@/lib/visit-tracker';

interface GooglePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };
}

interface PlacesAutocompleteResponse {
  predictions: GooglePrediction[];
  status: string;
  error_message?: string;
}

export interface GmbLocation {
  id: string;
  name: string;
  address: string;
  placeId: string;
}

const cache = new Map<string, { data: GmbLocation[]; expires: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();

    if (!query || query.length < 2 || query.length > 200) {
      return NextResponse.json({ error: 'Wpisz od 2 do 200 znaków nazwy firmy i miejscowości.' }, { status: 400 });
    }

    const cacheKey = query.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json({ results: cached.data });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY is not configured');
      return NextResponse.json({ error: 'Brak konfiguracji klucza Google API.' }, { status: 500 });
    }

    // First search restricted to Poland
    let url = `${PLACES_API_URL}?input=${encodeURIComponent(query)}&types=establishment&language=pl&components=country:pl&key=${apiKey}`;
    let res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      throw new Error(`Google API status: ${res.status}`);
    }
    let data = (await res.json()) as PlacesAutocompleteResponse;
    if (!['OK', 'ZERO_RESULTS'].includes(data.status)) throw new Error(`Google API status: ${data.status}`);

    // Fallback to global search if no Polish results found
    if (!data.predictions || data.predictions.length === 0) {
      url = `${PLACES_API_URL}?input=${encodeURIComponent(query)}&types=establishment&language=pl&key=${apiKey}`;
      res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`Google API status: ${res.status}`);
      data = (await res.json()) as PlacesAutocompleteResponse;
      if (!['OK', 'ZERO_RESULTS'].includes(data.status)) throw new Error(`Google API status: ${data.status}`);
    }

    const results: GmbLocation[] = (data.predictions || []).map((p, idx) => ({
      id: `gmb-${idx}-${p.place_id}`,
      name: p.structured_formatting?.main_text || p.description,
      address: p.structured_formatting?.secondary_text || '',
      placeId: p.place_id,
    }));

    cache.set(cacheKey, { data: results, expires: Date.now() + CACHE_TTL });

    if (results.length > 0) {
      void recordCompanySearch(request, {
        searchType: 'google_maps',
        searchQuery: query,
        companyName: results[0]?.name || query,
        companyAddress: results[0]?.address || null,
        placeId: results[0]?.placeId || null,
        companyData: results,
      });
    }

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('GMB search error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas wyszukiwania wizytówek.' },
      { status: 500 }
    );
  }
}
