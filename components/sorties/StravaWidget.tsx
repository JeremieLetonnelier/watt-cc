'use client';

import { motion } from 'motion/react';
import { ExternalLink, Map } from 'lucide-react';

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

  const stravaUrl = `https://www.strava.com/routes/${routeId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
    >
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

      {/* Strava Embed */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.strava.com/routes/${routeId}/embed`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
}
