// lib/strava.ts

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://www.strava.com/api/v3/oauth/token";

export interface StravaSegment {
  name: string;
  distance: number;
  average_grade: number;
  elevation_gain: number;
}

export interface StravaRouteDetails {
  id: string; // Strava Route ID
  distance: number; // in meters (convert to km later)
  elevation_gain: number; // in meters
  estimated_moving_time: number; // in seconds
  top_segments?: StravaSegment[];
}

let cachedAccessToken: string | null = null;
let tokenExpirationTime: number | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    console.warn("Strava environment variables are missing.");
    return null;
  }

  // Check if token is still valid (with a 5-minute buffer)
  if (cachedAccessToken && tokenExpirationTime && Date.now() < tokenExpirationTime - 300000) {
    return cachedAccessToken;
  }

  try {
    const params = new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Strava Token Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    cachedAccessToken = data.access_token;
    tokenExpirationTime = data.expires_at * 1000; // expires_at is in seconds

    return cachedAccessToken;
  } catch (error) {
    console.error("Error fetching Strava token:", error);
    return null;
  }
}

export async function fetchRouteDetails(routeId: string): Promise<StravaRouteDetails | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`https://www.strava.com/api/v3/routes/${routeId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 3600 * 24 }, // Cache the route details for 24 hours to avoid rate limits
    });

    if (!response.ok) {
      if (response.status !== 404) {
        console.error(`Strava Route Error for ${routeId}: ${response.status} ${response.statusText}`);
      }
      return null;
    }

    const data = await response.json();

    let top_segments: StravaSegment[] = [];
    if (data.segments && Array.isArray(data.segments)) {
      // Calculer l'élévation mathématiquement via pente et distance
      // elevation = distance * (average_grade / 100)
      const parsedSegments = data.segments
        .filter((s: any) => s.average_grade > 0) // uniquement les montées
        .map((s: any) => ({
          name: s.name,
          distance: s.distance,
          average_grade: s.average_grade,
          elevation_gain: s.distance * (s.average_grade / 100),
        }));

      // Trier par dénivelé décroissant et prendre le top 3
      top_segments = parsedSegments
        .sort((a: StravaSegment, b: StravaSegment) => b.elevation_gain - a.elevation_gain)
        .slice(0, 3);
    }

    return {
      id: routeId,
      distance: data.distance,
      elevation_gain: data.elevation_gain,
      estimated_moving_time: data.estimated_moving_time,
      top_segments,
    };
  } catch (error) {
    console.error(`Error fetching Strava route ${routeId}:`, error);
    return null;
  }
}
