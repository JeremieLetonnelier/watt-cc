// ─── Types ────────────────────────────────────────────────────────────────────

export type GroupKey =
  | 'debutants'
  | 'debutants_plus'
  | 'intermediaires'
  | 'confirmes_ffc';

export interface GroupCount {
  oui: number;
  peutEtre: number;
  total: number;
}

export interface Registrations {
  [key: string]: GroupCount;
}

export interface SortieConfig {
  date: string;
  lieu: 'chevreuse' | 'seine-et-marne' | '';
  stravaDebutants: string;
  stravaIntermediaires: string;
  stravaConfirmes: string;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

// ─── WMO Weather Codes ────────────────────────────────────────────────────────

export function getWeatherLabel(code: number): string {
  if (code === 0) return 'Ciel dégagé';
  if (code <= 2) return 'Partiellement nuageux';
  if (code === 3) return 'Couvert';
  if (code <= 49) return 'Brouillard';
  if (code <= 59) return 'Bruine';
  if (code <= 69) return 'Pluie';
  if (code <= 79) return 'Neige';
  if (code <= 84) return 'Averses';
  if (code <= 99) return 'Orage';
  return 'Inconnu';
}

export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌦️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '❄️';
  if (code <= 84) return '🌦️';
  if (code <= 99) return '⛈️';
  return '❓';
}

// ─── Locations ────────────────────────────────────────────────────────────────

export const LOCATIONS = {
  chevreuse: { lat: 48.7, lon: 2.03, label: 'Vallée de Chevreuse' },
  'seine-et-marne': { lat: 48.54, lon: 2.9, label: 'Seine-et-Marne' },
  '': { lat: 48.8566, lon: 2.3522, label: 'Île-de-France' },
} as const;

// ─── Group name normalizer ────────────────────────────────────────────────────

const GROUP_MAP: Record<string, GroupKey> = {
  'débutants': 'debutants',
  'debutants': 'debutants',
  'débutants+': 'debutants_plus',
  'debutants +': 'debutants_plus',
  'débutants +': 'debutants_plus',
  'intermédiaires': 'intermediaires',
  'intermediaires': 'intermediaires',
  'confirmés et ffc/cyclo': 'confirmes_ffc',
  'confirmes et ffc/cyclo': 'confirmes_ffc',
  'confirmés et ffc': 'confirmes_ffc',
};

function normalizeGroup(raw: string): GroupKey | null {
  return GROUP_MAP[raw.toLowerCase().trim()] ?? null;
}

// ─── Fetch Registrations (Tally sheet) ───────────────────────────────────────

export async function fetchRegistrations(): Promise<Registrations> {
  const sheetId = process.env.NEXT_PUBLIC_TALLY_SHEET_ID;

  const empty: Registrations = {
    debutants: { oui: 0, peutEtre: 0, total: 0 },
    debutants_plus: { oui: 0, peutEtre: 0, total: 0 },
    intermediaires: { oui: 0, peutEtre: 0, total: 0 },
    confirmes_ffc: { oui: 0, peutEtre: 0, total: 0 },
  };

  if (!sheetId) {
    console.warn('[sorties] NEXT_PUBLIC_TALLY_SHEET_ID is not set — skipping registrations fetch');
    return empty;
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return empty;

    const text = await res.text();
    const lines = text.split('\n').slice(1); // skip header

    for (const line of lines) {
      // CSV columns: SubmissionID, RespondentID, SubmittedAt, Nom, Statut, Groupe
      const cols = line.split(',');
      const statut = (cols[4] ?? '').trim();
      const groupe = (cols[5] ?? '').trim();

      if (!statut || !groupe) continue;

      const key = normalizeGroup(groupe);
      if (!key) continue;

      if (statut.toLowerCase() === 'oui') {
        empty[key].oui++;
        empty[key].total++;
      } else if (statut.toLowerCase().startsWith('peut')) {
        empty[key].peutEtre++;
        empty[key].total++;
      }
    }
  } catch {
    // silent fail – return empty counts
  }

  return empty;
}

// ─── Fetch Sortie Config (personal sheet) ────────────────────────────────────

export async function fetchSortieConfig(): Promise<SortieConfig> {
  const sheetId = process.env.NEXT_PUBLIC_CONFIG_SHEET_ID;
  if (!sheetId) {
    console.warn('[sorties] NEXT_PUBLIC_CONFIG_SHEET_ID is not set — returning empty config');
    return { date: '', lieu: '', stravaDebutants: '', stravaIntermediaires: '', stravaConfirmes: '' };
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

  const defaultConfig: SortieConfig = {
    date: '',
    lieu: '',
    stravaDebutants: '',
    stravaIntermediaires: '',
    stravaConfirmes: '',
  };

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return defaultConfig;

    const text = await res.text();
    // CSV: date,lieu,strava_debutants,strava_intermediaires,strava_confirmes
    const lines = text.split('\n').filter(Boolean);
    if (lines.length < 2) return defaultConfig;

    const data = lines[lines.length - 1].split(','); // take last row
    return {
      date: data[0]?.trim() ?? '',
      lieu: (data[1]?.trim() as SortieConfig['lieu']) ?? '',
      stravaDebutants: data[2]?.trim() ?? '',
      stravaIntermediaires: data[3]?.trim() ?? '',
      stravaConfirmes: data[4]?.trim() ?? '',
    };
  } catch {
    return defaultConfig;
  }
}

// ─── Fetch Weather (Open-Meteo) ───────────────────────────────────────────────

export async function fetchWeather(lat: number, lon: number): Promise<WeatherDay | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe%2FParis&forecast_days=7`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = await res.json();
    const dates: string[] = json.daily.time;
    const tempMax: number[] = json.daily.temperature_2m_max;
    const tempMin: number[] = json.daily.temperature_2m_min;
    const codes: number[] = json.daily.weathercode;

    // Find next Sunday (day 0)
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      if (d.getDay() === 0 && d >= today) {
        return {
          date: dates[i],
          tempMax: Math.round(tempMax[i]),
          tempMin: Math.round(tempMin[i]),
          weatherCode: codes[i],
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}
