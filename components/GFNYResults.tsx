'use client';

import { motion } from 'motion/react';
import { gfnyResults, riders } from '@/lib/data';
import { Flag, MapPin, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function GFNYResults() {
  // Group results by race
  const races = Array.from(new Set(gfnyResults.map(r => r.raceName)));

  return (
    <section className="py-24 bg-[#0a0514] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#4a00e0]/20 via-[#0a0514] to-[#0a0514]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold uppercase tracking-widest text-sm mb-6"
          >
            <Flag className="w-4 h-4" />
            Cyclosportives
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Résultats <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">GFNY</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Les performances de nos coureurs sur le circuit mondial GFNY.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {races.map((raceName, index) => {
            const raceResults = gfnyResults.filter(r => r.raceName === raceName);
            const date = raceResults[0]?.date;

            return (
              <motion.div
                key={raceName}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-green-500/50 transition-colors group"
              >
                <div className="h-48 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] to-transparent z-10" />
                  <Image
                    src={`https://picsum.photos/seed/${raceName.replace(/\s/g, '')}/800/600`}
                    alt={raceName}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Calendar className="w-3 h-3 text-green-400" />
                    {new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div className="p-6 relative z-20 -mt-12">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-green-500" />
                    {raceName}
                  </h3>

                  <div className="space-y-4">
                    {raceResults.sort((a, b) => a.position - b.position).map((result) => {
                      const rider = riders.find(r => r.id === result.riderId);
                      if (!rider) return null;

                      return (
                        <div key={result.id} className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white/20">
                              {rider.avatarUrl ? (
                                <Image src={rider.avatarUrl} alt={rider.name} fill className="object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs font-bold">{rider.name.charAt(0)}</div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white">{rider.name}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{rider.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-green-400">{result.position}e</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{result.points} pts</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
