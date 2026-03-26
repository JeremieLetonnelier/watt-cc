'use client';

import { motion } from 'motion/react';
import { Cloud, Thermometer, MapPin } from 'lucide-react';
import { getWeatherEmoji, getWeatherLabel } from '@/lib/sorties';
import type { WeatherDay } from '@/lib/sorties';

interface WeatherWidgetProps {
  weather: WeatherDay | null;
  locationLabel: string;
}

export default function WeatherWidget({ weather, locationLabel }: WeatherWidgetProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
    >
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Météo du dimanche</h3>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            {locationLabel}
          </div>
        </div>
      </div>

      {!weather ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <span className="text-5xl">🌈</span>
          <p className="text-gray-500 text-sm text-center">Météo non disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Date */}
          <p className="text-gray-400 text-sm capitalize">{formatDate(weather.date)}</p>

          {/* Main weather */}
          <div className="flex items-center gap-4">
            <span className="text-7xl leading-none">{getWeatherEmoji(weather.weatherCode)}</span>
            <div>
              <div className="text-3xl font-black text-white">
                {weather.tempMax}°C
              </div>
              <div className="text-gray-400 font-medium">
                {getWeatherLabel(weather.weatherCode)}
              </div>
            </div>
          </div>

          {/* Temp range */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
            <Thermometer className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-sky-400 font-bold">{weather.tempMin}°</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[60px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-orange-400"
                  style={{
                    width: `${Math.min(100, ((weather.tempMax - weather.tempMin) / 20) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-orange-400 font-bold">{weather.tempMax}°</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 text-center uppercase tracking-wider">
            Données Open-Meteo
          </p>
        </div>
      )}
    </motion.div>
  );
}
