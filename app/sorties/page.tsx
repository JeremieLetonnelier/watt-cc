import {
  fetchRegistrations,
  fetchSortieConfig,
  fetchWeather,
  LOCATIONS,
} from '@/lib/sorties';
import StravaWidget from '@/components/sorties/StravaWidget';
import ParticipantsWidget from '@/components/sorties/ParticipantsWidget';
import WeatherWidget from '@/components/sorties/WeatherWidget';
import { Sun, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Sorties du Dimanche | WATT.CC',
  description: 'Tracés Strava, inscriptions et météo pour les sorties club du dimanche.',
};

const STRAVA_GROUPS = [
  {
    key: 'debutants' as const,
    label: 'Débutants',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    titleKey: 'stravaDebutants' as const,
  },
  {
    key: 'intermediaires' as const,
    label: 'Intermédiaires',
    color: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
    titleKey: 'stravaIntermediaires' as const,
  },
  {
    key: 'confirmes_ffc' as const,
    label: 'Confirmés & FFC',
    color: 'text-[#ff007f] border-[#ff007f]/40 bg-[#ff007f]/10',
    titleKey: 'stravaConfirmes' as const,
  },
];

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function SortiesPage() {
  const [config, registrations] = await Promise.all([
    fetchSortieConfig(),
    fetchRegistrations(),
  ]);

  const location = LOCATIONS[config.lieu] ?? LOCATIONS[''];
  const weather = await fetchWeather(location.lat, location.lon);

  const routeIds: Record<string, string> = {
    stravaDebutants: config.stravaDebutants,
    stravaIntermediaires: config.stravaIntermediaires,
    stravaConfirmes: config.stravaConfirmes,
  };

  const formattedDate = formatDate(config.date);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0514] to-[#1a0b2e]">
      {/* Hero */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#4a00e0_0%,_transparent_60%)] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/30 text-[#ff007f] font-bold uppercase tracking-widest text-sm mb-6">
              <Sun className="w-4 h-4" />
              Sortie Club
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none mb-4">
              Sortie du{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f]">
                Dimanche
              </span>
            </h1>
            {formattedDate ? (
              <div className="flex items-center justify-center gap-2 text-gray-300 text-lg capitalize">
                <Calendar className="w-5 h-5 text-[#ff007f]" />
                {formattedDate}
              </div>
            ) : (
              <p className="text-gray-500">Aucune sortie configurée pour le moment</p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">

        {/* ── Tracés Strava ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Les{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f]">
                Tracés
              </span>
            </h2>
            <p className="text-gray-400 mt-2">Routes Strava pour chaque groupe</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {STRAVA_GROUPS.map((group) => (
              <StravaWidget
                key={group.key}
                routeId={routeIds[group.titleKey]}
                title={group.label}
                groupLabel={group.label}
                groupColor={group.color}
              />
            ))}
          </div>
        </section>

        {/* ── Inscriptions & Météo ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Infos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f]">
                Pratiques
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParticipantsWidget registrations={registrations} />
            <WeatherWidget weather={weather} locationLabel={location.label} />
          </div>
        </section>

      </div>
    </div>
  );
}
