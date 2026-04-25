import { fetchAllSorties } from '@/lib/sorties';
import { fetchRouteDetails, StravaRouteDetails } from '@/lib/strava';
import MapTable from '@/components/maps/MapTable';
import { Map } from 'lucide-react';

export const metadata = {
  title: 'Mappemonde | WATT.CC',
  description: 'Historique des tracés et statistiques des sorties du club.',
};

export const dynamic = 'force-dynamic'; // Ensures this page stays fresh if the Google Sheet updates

const getCleanRouteId = (id: string) => {
  const routeMatch = id.match(/routes\/(\d+)/);
  const activityMatch = id.match(/activities\/(\d+)/);
  if (routeMatch) return routeMatch[1];
  if (activityMatch) return activityMatch[1];
  return id.trim();
};

export default async function MapsPage() {
  const sorties = await fetchAllSorties();

  // Extract all unique Route IDs from the history
  const uniqueRouteIds = new Set<string>();
  for (const sortie of sorties) {
    if (sortie.stravaDebutants) uniqueRouteIds.add(getCleanRouteId(sortie.stravaDebutants));
    if (sortie.stravaIntermediaires) uniqueRouteIds.add(getCleanRouteId(sortie.stravaIntermediaires));
    if (sortie.stravaConfirmes) uniqueRouteIds.add(getCleanRouteId(sortie.stravaConfirmes));
  }

  // Fetch stats for all unique routes concurrently
  const routePromises = Array.from(uniqueRouteIds).map(async (id) => {
    if (!id) return null;
    const details = await fetchRouteDetails(id);
    return { id, details };
  });

  const resolvedRoutes = await Promise.allSettled(routePromises);
  const routeStats: Record<string, StravaRouteDetails> = {};

  resolvedRoutes.forEach((res) => {
    if (res.status === 'fulfilled' && res.value && res.value.details) {
      routeStats[res.value.id] = res.value.details;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0514] to-[#1a0b2e]">
      {/* Hero section */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#ff007f_0%,_transparent_60%)] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/30 text-[#ff007f] font-bold uppercase tracking-widest text-sm mb-6">
              <Map className="w-4 h-4" />
              Mappemonde
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-tight sm:leading-none mb-6">
              Historique des{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff007f] to-[#ff66b2] block sm:inline">
                Tracés
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400">
              Retrouvez l&apos;ensemble des parcours proposés lors des sorties dominicales du club.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {sorties.length > 0 ? (
          <MapTable sorties={sorties} routeStats={routeStats} />
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Aucune donnée historique</h3>
            <p className="text-gray-400">Restez connectés, les premiers tracés arrivent bientôt !</p>
          </div>
        )}
      </section>
    </div>
  );
}
