'use client';

import { motion } from 'motion/react';
import { ExternalLink, Map } from 'lucide-react';
import Script from 'next/script';

interface StravaWidgetProps {
  routeId: string;
  title: string;
  groupLabel: string;
  groupColor: string;
}

export default function StravaWidget({
  routeId,
  title,
  groupLabel,
  groupColor,
}: StravaWidgetProps) {
  if (!routeId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px] backdrop-blur-sm"
      >
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${groupColor}`}>
          {groupLabel}
        </div>
        <Map className="w-12 h-12 text-white/20" />
        <p className="text-gray-500 text-sm text-center">Tracé non encore publié</p>
      </motion.div>
    );
  }

  const getEmbedData = (id: string) => {
    // Keep it robust to match IDs from URLs (routes or activities)
    const routeMatch = id.match(/routes\/(\d+)/);
    const activityMatch = id.match(/activities\/(\d+)/);
    
    if (routeMatch) return { id: routeMatch[1], type: 'route' };
    if (activityMatch) return { id: activityMatch[1], type: 'activity' };
    
    // Default to route if it's just a numeric ID
    return { id: id.trim(), type: 'route' };
  };

  const { id: cleanId, type: embedType } = getEmbedData(routeId);
  const stravaUrl = `https://www.strava.com/${embedType === 'route' ? 'routes' : 'activities'}/${cleanId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm group"
    >
      <Script src="https://strava-embeds.com/embed.js" strategy="afterInteractive" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${groupColor}`}>
            {groupLabel}
          </div>
          <span className="text-white font-semibold">{title}</span>
        </div>
        <a
          href={stravaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[#FC4C02] hover:text-[#FC4C02]/80 transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Strava
        </a>
      </div>

      {/* Strava Embed Container (The placeholder for embed.js) */}
      <div className="relative w-full bg-[#121212] min-h-[450px] flex items-center justify-center">
        <div 
          className="strava-embed-placeholder w-full" 
          data-embed-type={embedType} 
          data-embed-id={cleanId} 
          data-style="dark"
          data-from-embed="true"
        />
        
        {/* Skeleton/Loading State */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 bg-[#121212]">
          <div className="w-8 h-8 border-2 border-[#FC4C02]/20 border-t-[#FC4C02] rounded-full animate-spin" />
        </div>
        
        {/* Help Tip Overlay */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-gray-400">
            Route non affichée ? Vérifiez la visibilité "Tout le monde".
          </div>
        </div>
      </div>
    </motion.div>
  );
}
