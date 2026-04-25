'use client';

import { useState, useMemo } from 'react';
import { SortieConfig } from '@/lib/sorties';
import { StravaRouteDetails } from '@/lib/strava';
import { Calendar, MapPin, Route, Clock, TrendingUp, LayoutList, CalendarDays, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import MapModal from './MapModal';

interface MapTableProps {
  sorties: SortieConfig[];
  routeStats: Record<string, StravaRouteDetails>;
}

const STRAVA_GROUPS = [
  {
    key: 'debutants',
    label: 'Débutants',
    colorText: 'text-emerald-400',
    colorBorder: 'border-emerald-500/40',
    colorBg: 'bg-emerald-500/10',
    groupColorConfig: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    idKey: 'stravaDebutants' as const,
  },
  {
    key: 'intermediaires',
    label: 'Intermédiaires',
    colorText: 'text-violet-400',
    colorBorder: 'border-violet-500/40',
    colorBg: 'bg-violet-500/10',
    groupColorConfig: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
    idKey: 'stravaIntermediaires' as const,
  },
  {
    key: 'confirmes',
    label: 'Confirmés',
    colorText: 'text-[#ff007f]',
    colorBorder: 'border-[#ff007f]/40',
    colorBg: 'bg-[#ff007f]/10',
    groupColorConfig: 'text-[#ff007f] border-[#ff007f]/40 bg-[#ff007f]/10',
    idKey: 'stravaConfirmes' as const,
  },
];

export default function MapTable({ sorties, routeStats }: MapTableProps) {
  const [selectedRoute, setSelectedRoute] = useState<{
    id: string;
    title: string;
    groupLabel: string;
    groupColor: string;
  } | null>(null);

  const [targetSpeed, setTargetSpeed] = useState(28); // default 28 km/h
  const [viewMode, setViewMode] = useState<'chronological' | 'list'>('chronological');

  type SortKey = 'date' | 'distance' | 'time' | 'elevation';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover/th:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#ff007f]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#ff007f]" />
    );
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
    return `${mins} min`;
  };

  const getCleanRouteId = (id: string) => {
    const routeMatch = id.match(/routes\/(\d+)/);
    const activityMatch = id.match(/activities\/(\d+)/);
    if (routeMatch) return routeMatch[1];
    if (activityMatch) return activityMatch[1];
    return id.trim();
  };

  const formatLocation = (loc: string) => {
    if (!loc) return 'Île-de-France';
    return loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase();
  };

  // Calcul de la liste plate des tracés pour la vue Catalogue
  const uniqueRoutes = useMemo(() => {
    const list: Array<{ rawRouteId: string; cleanRouteId: string; stats?: StravaRouteDetails; dateStr: string; location: string; dateObj: Date }> = [];
    const seen = new Set<string>();

    sorties.forEach((sortie) => {
      STRAVA_GROUPS.forEach((group) => {
        const rawRouteId = sortie[group.idKey];
        if (!rawRouteId) return;
        const cleanRouteId = getCleanRouteId(rawRouteId);
        
        if (!seen.has(cleanRouteId)) {
          seen.add(cleanRouteId);
          list.push({
            rawRouteId,
            cleanRouteId,
            stats: routeStats[cleanRouteId],
            location: sortie.lieu,
            dateObj: new Date(sortie.date),
            dateStr: new Date(sortie.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
          });
        }
      });
    });

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortConfig.key) {
        case 'distance':
          valA = a.stats?.distance ?? 0;
          valB = b.stats?.distance ?? 0;
          break;
        case 'time':
          valA = a.stats?.estimated_moving_time ?? 0;
          valB = b.stats?.estimated_moving_time ?? 0;
          break;
        case 'elevation':
          valA = a.stats?.elevation_gain ?? 0;
          valB = b.stats?.elevation_gain ?? 0;
          break;
        case 'date':
        default:
          valA = a.dateObj.getTime();
          valB = b.dateObj.getTime();
          break;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [sorties, routeStats, sortConfig]);

  return (
    <div className="w-full">
      {/* Simulateur d'allure */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="w-full lg:w-auto text-center lg:text-left">
          <h3 className="text-white font-bold text-lg mb-1 flex items-center justify-center lg:justify-start gap-2">
            <Clock className="w-5 h-5 text-[#ff007f]" /> 
            Simulateur d'Allure
          </h3>
          <p className="text-sm text-gray-400">Estimez la durée des parcours selon la vitesse moyenne visée.</p>
        </div>
        <div className="w-full max-w-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <span className="text-gray-500 font-medium text-xs">20</span>
            <input 
               type="range" 
               min="20" 
               max="40" 
               step="0.5"
               value={targetSpeed} 
               onChange={(e) => setTargetSpeed(parseFloat(e.target.value))}
               className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#ff007f]"
            />
            <span className="text-gray-500 font-medium text-xs">40</span>
          </div>
          <span className="text-[#ff007f] font-black text-xl whitespace-nowrap text-right shrink-0">
            {targetSpeed} <span className="text-sm font-medium text-gray-400">km/h</span>
          </span>
        </div>
      </div>

      <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-xl w-fit mx-auto mb-10 text-white">
        <button 
          onClick={() => setViewMode('chronological')}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'chronological' ? 'bg-[#ff007f] shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <CalendarDays className="w-4 h-4" />
          Vue Historique
        </button>
        <button 
          onClick={() => setViewMode('list')}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-[#ff007f] shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <LayoutList className="w-4 h-4" />
          Vue Catalogue
        </button>
      </div>

      {viewMode === 'chronological' ? (
      <div className="grid gap-6">
        {sorties.map((sortie, index) => {
          const d = new Date(sortie.date);
          const dateStr = d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          return (
            <div
              key={`${sortie.date}-${index}`}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group"
            >
              {/* Header de la sortie */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#4a00e0]/20 text-[#4a00e0] rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white capitalize">{dateStr}</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatLocation(sortie.lieu)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Les 3 routes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STRAVA_GROUPS.map((group) => {
                  const rawRouteId = sortie[group.idKey];
                  if (!rawRouteId) return null; // Ne pas afficher de bloc s'il n'y a pas de tracé

                  const cleanRouteId = getCleanRouteId(rawRouteId);
                  const stats = routeStats[cleanRouteId];

                  return (
                    <div
                      key={group.key}
                      onClick={() => {
                        if (rawRouteId) {
                          setSelectedRoute({
                            id: rawRouteId,
                            title: group.label,
                            groupLabel: group.label,
                            groupColor: group.groupColorConfig,
                          });
                        }
                      }}
                      className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:bg-white/10 ${group.colorBorder} ${group.colorBg} group/card`}
                    >
                      <div className={`font-bold uppercase tracking-widest text-xs mb-3 ${group.colorText}`}>
                        {group.label}
                      </div>

                      {stats ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5 text-gray-300"><Route className="w-4 h-4"/> Distance</span>
                            <span className="font-bold text-white">{(stats.distance / 1000).toFixed(1)} km</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5 text-gray-300"><TrendingUp className="w-4 h-4"/> Dénivelé</span>
                            <span className="font-bold text-white">{Math.round(stats.elevation_gain)} m</span>
                          </div>
                          <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                            <span className="flex items-center gap-1.5 text-gray-300" title="Temps estimé par Strava"><Clock className="w-3.5 h-3.5 text-gray-500"/> Estimation Strava</span>
                            <span className="font-medium text-gray-400">{formatTime(stats.estimated_moving_time)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5 text-white font-medium"><Clock className="w-4 h-4 text-[#ff007f]"/> À {targetSpeed} km/h</span>
                            <span className="font-black text-[#ff007f]">{formatTime((stats.distance / 1000 / targetSpeed) * 3600)}</span>
                          </div>

                          {/* Segments Majeurs dans la vue Historique */}
                          {stats.top_segments && stats.top_segments.length > 0 && (
                            <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
                               <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Segments Majeurs</div>
                               <div className="grid grid-cols-1 gap-1.5">
                                 {stats.top_segments.map((segment, idx) => (
                                    <div key={idx} className="flex flex-col bg-black/20 border border-white/5 rounded p-2 text-xs justify-center hover:border-white/10 transition-colors">
                                      <span className="font-semibold text-gray-300 text-center whitespace-normal mb-0.5">{segment.name}</span>
                                      <span className="text-gray-500 font-mono tracking-tighter text-center">
                                        {(segment.distance / 1000).toFixed(1)}km <span className="text-gray-400 font-bold">{segment.average_grade.toFixed(1)}%</span>
                                      </span>
                                    </div>
                                 ))}
                               </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 py-3 flex items-center justify-center h-full">
                          Cliquez pour voir Strava
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                         <MapPin className="w-5 h-5 text-white/50" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* En-têtes pour Desktop */}
          <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-4 px-6 py-4 border-b border-white/10 bg-black/20">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Localisation</div>
            <div 
              className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right cursor-pointer group/th hover:text-white transition-colors select-none"
              onClick={() => handleSort('distance')}
            >
              <div className="flex items-center justify-end gap-1.5 truncate">
                 Distance {renderSortIcon('distance')}
              </div>
            </div>
            <div 
              className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right cursor-pointer group/th hover:text-white transition-colors select-none"
              onClick={() => handleSort('elevation')}
            >
              <div className="flex items-center justify-end gap-1.5 truncate">
                 Dénivelé {renderSortIcon('elevation')}
              </div>
            </div>
            <div 
              className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right cursor-pointer group/th hover:text-white transition-colors select-none"
              onClick={() => handleSort('time')}
            >
              <div className="flex items-center justify-end gap-1.5 truncate">
                 Temps est. {renderSortIcon('time')}
              </div>
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center min-w-[60px]">Tracé</div>
          </div>

          {/* Lignes */}
          <div className="flex flex-col divide-y divide-white/5">
            {uniqueRoutes.map((route) => (
              <div 
                key={route.cleanRouteId}
                className="flex flex-col md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-start md:items-center gap-y-4 gap-x-4 p-5 md:px-6 md:py-4 hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => {
                    setSelectedRoute({
                      id: route.rawRouteId,
                      title: "Détails du Tracé",
                      groupLabel: "Tracé",
                      groupColor: "text-white border-white/40 bg-white/10",
                    });
                }}
              >
                {/* Colonne 1: Localisation et Segments */}
                <div className="flex flex-col min-w-0 w-full">
                  <div className="flex items-center justify-between w-full mb-3 md:mb-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="p-2 border border-white/10 bg-white/5 rounded-lg text-gray-400 group-hover:text-white group-hover:border-[#ff007f]/30 group-hover:bg-[#ff007f]/10 transition-colors shrink-0">
                         <MapPin className="w-4 h-4" />
                       </div>
                       <span className="font-bold text-white text-base sm:text-lg truncate max-w-[200px] sm:max-w-xs block" title={formatLocation(route.location)}>
                          {formatLocation(route.location)}
                       </span>
                    </div>
                    {/* Action Bouton sur mobile (caché desktop car il a sa propre colonne) */}
                    <button className="md:hidden inline-flex items-center justify-center p-2 rounded-full bg-white/5 text-[#ff007f] transition-colors shrink-0" aria-label="Voir la carte">
                        <Route className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Segments encapsulés sous le nom de parcours */}
                  {route.stats?.top_segments && route.stats.top_segments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:mt-3 w-full">
                      {route.stats.top_segments.map((segment, idx) => (
                        <div key={idx} className="flex flex-col border-l border-[#ff007f]/50 pl-2 text-xs justify-center overflow-hidden">
                          <span className="font-semibold text-gray-300 truncate block w-full mb-0.5" title={segment.name}>{segment.name}</span>
                          <span className="text-gray-500 font-mono tracking-tighter truncate block w-full">
                            {(segment.distance / 1000).toFixed(1)}km <span className="text-gray-400 font-bold ml-1">{segment.average_grade.toFixed(1)}%</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Métriques: Grille sur mobile, layout natif de la grid parente sur desktop */}
                <div className="grid grid-cols-3 gap-3 md:contents min-w-0 w-full md:w-auto">
                   {/* Distance */}
                   <div className="flex flex-col md:block md:text-right overflow-hidden break-words">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest md:hidden mb-1 block truncate">Distance</span>
                      <span className="font-bold text-white text-base md:text-lg block">
                        {route.stats ? (route.stats.distance / 1000).toFixed(1) : '-'} <span className="text-gray-500 font-normal text-xs md:text-sm">km</span>
                      </span>
                   </div>
                   
                   {/* Dénivelé */}
                   <div className="flex flex-col md:block md:text-right overflow-hidden break-words">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest md:hidden mb-1 block truncate">Dénivelé</span>
                      <span className="font-bold text-white text-base md:text-lg block">
                        {route.stats ? Math.round(route.stats.elevation_gain) : '-'} <span className="text-gray-500 font-normal text-xs md:text-sm">m</span>
                      </span>
                   </div>
                   
                   {/* Temps */}
                   <div className="flex flex-col md:block md:text-right overflow-hidden break-words">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest md:hidden mb-1 block truncate">Temps</span>
                      {route.stats ? (
                          <div className="flex flex-col md:items-end w-full">
                            <span className="font-black text-[#ff007f] text-base md:text-lg truncate block max-w-full">
                              {formatTime((route.stats.distance / 1000 / targetSpeed) * 3600)}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium tracking-tighter truncate block max-w-full" title={`STRAVA: ${formatTime(route.stats.estimated_moving_time)}`}>
                              STRAVA: {formatTime(route.stats.estimated_moving_time)}
                            </span>
                          </div>
                      ) : (
                          <span className="text-gray-600 block">-</span>
                      )}
                   </div>
                </div>

                {/* Bouton Action sur Desktop */}
                <div className="hidden md:flex justify-end min-w-[60px] pl-2">
                   <button className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 group-hover:bg-[#ff007f] text-gray-300 group-hover:text-white transition-colors" aria-label="Voir la carte">
                     <Route className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
            
            {uniqueRoutes.length === 0 && (
              <div className="px-6 py-16 text-center text-gray-500 flex flex-col items-center justify-center">
                 <Route className="w-12 h-12 text-gray-600 mb-3" />
                 <p>Aucun itinéraire historique trouvé.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <MapModal
        isOpen={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
        routeId={selectedRoute?.id || ''}
        title={selectedRoute?.title || ''}
        groupLabel={selectedRoute?.groupLabel || ''}
        groupColor={selectedRoute?.groupColor || ''}
      />
    </div>
  );
}
