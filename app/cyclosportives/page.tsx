'use client';

import { motion } from 'motion/react';
import { getCyclosportives } from '@/lib/cyclosportives';
import { Calendar, MapPin, Train, Euro, Users, Mountain, Trophy, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';

export default function CyclosportivesHub() {
  const cyclosportives = getCyclosportives();

  return (
    <div className="min-h-screen bg-[#0a0514] pt-24 pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#ff007f]/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[#4a00e0]/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff007f] to-[#4a00e0]">Cyclosportives</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Découvrez le calendrier des épreuves incontournables, les tracés légendaires et les résultats de la team WATT.CC.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cyclosportives.map((event, index) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff007f]/20 to-[#4a00e0]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300 flex flex-col">
                
                {/* Header Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-[#ff007f] tracking-widest uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric'})}
                  </div>
                  
                  {event.wattParticipated && (
                    <div className="px-3 py-1 bg-gradient-to-r from-[#4a00e0] to-[#ff007f] rounded-full text-xs font-bold text-white tracking-widest uppercase shadow-[0_0_10px_rgba(255,0,127,0.5)]">
                      WATT Approved
                    </div>
                  )}
                </div>

                {/* Event Name */}
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-[#ff007f] transition-colors">
                  {event.name}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location} • à {event.distanceFromParis} de Paris</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><Mountain className="w-3 h-3"/> Difficulté</span>
                    <span className="text-white font-bold">{event.difficulty}/5</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3"/> Distances</span>
                    <span className="text-white font-bold text-sm">{event.distances.join(' / ')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3"/> Pelotons</span>
                    <span className="text-white font-bold">{event.participantsCount.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><Euro className="w-3 h-3"/> Tarif</span>
                    <span className="text-white font-bold">{event.price}</span>
                  </div>
                </div>

                {/* Transport & Results */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  
                  <div className="flex items-center gap-2">
                    {event.transportAccess ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                        <Train className="w-3 h-3" /> Accès Train
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md">
                        Voiture requise
                      </span>
                    )}
                  </div>

                  <Link 
                    href={event.link} 
                    className="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-colors text-white"
                    title="Voir l'événement"
                  >
                    {event.link.startsWith('/') ? <Trophy className="w-5 h-5 text-[#ff007f]"/> : <ExternalLink className="w-5 h-5"/>}
                  </Link>

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
