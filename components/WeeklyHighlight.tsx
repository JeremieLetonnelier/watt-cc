'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Trophy, Star } from 'lucide-react';
import { riders } from '@/lib/data';

export default function WeeklyHighlight() {
  // Select a random rider for the highlight (or hardcode one for demo)
  const highlightedRider = riders.find(r => r.id === '1'); // Camille Dupont

  if (!highlightedRider) return null;

  return (
    <section className="py-24 bg-[#0a0514] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/30 text-[#ff007f] font-bold uppercase tracking-widest text-sm mb-6"
          >
            <Star className="w-4 h-4" />
            Coureur de la semaine
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f]">Exceptionnelle</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden aspect-[4/5] lg:aspect-square shadow-2xl shadow-[#ff007f]/20 group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-transparent to-transparent z-10" />
            <Image
              src={highlightedRider.avatarUrl || 'https://picsum.photos/seed/highlight/800/1000'}
              alt={highlightedRider.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4a00e0] to-[#ff007f] flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase">{highlightedRider.name}</h3>
                  <p className="text-[#ff007f] font-bold tracking-widest uppercase">{highlightedRider.category}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
                Victoire au Prix de Satory
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed">
                Une performance incroyable de {highlightedRider.name} ce week-end. Elle a dominé la course de bout en bout, s'échappant dans le dernier tour pour s'imposer en solitaire. Une victoire qui rapporte 50 points précieux pour le classement général FFC.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-[#0a0514] rounded-xl p-4 border border-white/5">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Points Gagnés</div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f]">+50 pts</div>
                </div>
                <div className="bg-[#0a0514] rounded-xl p-4 border border-white/5">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Position</div>
                  <div className="text-3xl font-black text-white">1ère</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
