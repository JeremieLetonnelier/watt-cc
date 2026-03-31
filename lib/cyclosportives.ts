import rawCyclosportives from './data/cyclosportives.json';
import rawGfnyRaces from './data/gfny_races.json';

export interface Cyclosportive {
  name: string;
  date: string;
  distances: string[];
  price?: string;
  participantsCount: number;
  difficulty: "1" | "2" | "3" | "4" | "5";
  popularity: number;
  location: string;
  distanceFromParis: string;
  transportAccess: boolean;
  wattParticipated: boolean;
  lastYearResults?: string | null;
  link: string;
  source?: "gfny" | "manual";
}

/**
 * Returns all cyclosportives, merging:
 *   - lib/data/cyclosportives.json  — données manuelles (toutes épreuves)
 *   - lib/data/gfny_races.json      — généré automatiquement par scripts/fetch_gfny.py
 *
 * Les doublons sont dédupliqués par nom (le fichier manuel a priorité).
 * La liste est triée par date croissante.
 */
export const getCyclosportives = (): Cyclosportive[] => {
  const manual = (rawCyclosportives as unknown as Cyclosportive[]).map(r => ({ ...r, source: "manual" as const }));
  const gfny   = (rawGfnyRaces   as unknown as Cyclosportive[]).map(r => ({ ...r, source: "gfny"   as const }));

  // Deduplicate: manual entries win over GFNY entries with the same name
  const manualNames = new Set(manual.map(r => r.name));
  const uniqueGfny  = gfny.filter(r => !manualNames.has(r.name));

  const all = [...manual, ...uniqueGfny];

  // Sort by date ascending (undated entries go last)
  return all.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
};
