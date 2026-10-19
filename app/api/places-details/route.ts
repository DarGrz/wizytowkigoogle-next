import { NextRequest, NextResponse } from 'next/server';
import { recordCompanySearch } from '@/lib/visit-tracker';

interface GooglePlaceDetailsResult {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types?: string[];
  opening_hours?: {
    weekday_text?: string[];
    open_now?: boolean;
  };
  photos?: unknown[];
  editorial_summary?: {
    overview?: string;
  };
}

interface GooglePlaceDetailsResponse {
  result?: GooglePlaceDetailsResult;
  status: string;
  error_message?: string;
}

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  googleMapsUrl: string;
  rating?: number;
  user_ratings_total?: number;
  businessStatus?: string;
  types?: string[];
  hasOpeningHours?: boolean;
  hasPhotos?: boolean;
  hasDescription?: boolean;
  openingHoursText?: string[];
  description?: string;
}

const cache = new Map<string, { data: PlaceDetails; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId')?.trim();

    if (!placeId) {
      return NextResponse.json({ error: 'Brak parametru placeId' }, { status: 400 });
    }

    const cached = cache.get(placeId);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json({ details: cached.data });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY is not configured');
      return NextResponse.json({ error: 'Brak konfiguracji klucza Google API.' }, { status: 500 });
    }

    const fields = [
      'name',
      'formatted_address',
      'formatted_phone_number',
      'website',
      'url',
      'rating',
      'user_ratings_total',
      'business_status',
      'types',
      'opening_hours',
      'photos',
      'editorial_summary',
    ].join(',');

    const url = `${PLACES_DETAILS_URL}?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=pl&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google API status: ${res.status}`);
    }

    const data = (await res.json()) as GooglePlaceDetailsResponse;
    if (data.status !== 'OK' || !data.result) {
      throw new Error(data.error_message || `Nie znaleziono szczegółów (${data.status})`);
    }

    const details: PlaceDetails = {
      id: placeId,
      name: data.result.name,
      address: data.result.formatted_address,
      phoneNumber: data.result.formatted_phone_number,
      website: data.result.website,
      googleMapsUrl: data.result.url || `https://maps.google.com/?cid=${placeId}`,
      rating: data.result.rating,
      user_ratings_total: data.result.user_ratings_total,
      businessStatus: data.result.business_status,
      types: data.result.types,
      hasOpeningHours: Boolean(
        data.result.opening_hours &&
        (data.result.opening_hours.weekday_text?.length || data.result.opening_hours.open_now !== undefined)
      ),
      hasPhotos: Boolean(data.result.photos && data.result.photos.length > 0),
      hasDescription: Boolean(data.result.editorial_summary?.overview),
      openingHoursText: data.result.opening_hours?.weekday_text,
      description: data.result.editorial_summary?.overview,
    };

    cache.set(placeId, { data: details, expires: Date.now() + CACHE_TTL });

    void recordCompanySearch(request, {
      searchType: 'places_details',
      searchQuery: details.name,
      companyName: details.name,
      companyAddress: details.address,
      companyPhone: details.phoneNumber || null,
      companyWebsite: details.website || null,
      companyRating: details.rating || null,
      companyReviewsCount: details.user_ratings_total || null,
      placeId: details.id,
      companyData: details,
    });

    return NextResponse.json({ details });
  } catch (error) {
    console.error('Place details error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas pobierania szczegółów wizytówki.' },
      { status: 500 }
    );
  }
}
