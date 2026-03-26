'use client';

import { motion } from 'motion/react';
import { Users, CheckCircle, Clock } from 'lucide-react';
import type { Registrations } from '@/lib/sorties';

interface ParticipantsWidgetProps {
  registrations: Registrations;
}

const GROUPS = [
  {
    key: 'debutants',
    label: 'Débutants',
    color: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
  },
  {
    key: 'debutants_plus',
    label: 'Débutants+',
    color: 'from-cyan-500 to-blue-500',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
  },
  {
    key: 'intermediaires',
    label: 'Intermédiaires',
    color: 'from-violet-500 to-purple-500',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
  },
  {
    key: 'confirmes_ffc',
    label: 'Confirmés & FFC',
    color: 'from-[#ff007f] to-[#4a00e0]',
    border: 'border-[#ff007f]/30',
    bg: 'bg-[#ff007f]/10',
    text: 'text-[#ff007f]',
  },
] as const;

export default function ParticipantsWidget({ registrations }: ParticipantsWidgetProps) {
  const totalOui = Object.values(registrations).reduce((s, g) => s + g.oui, 0);
  const totalPeutEtre = Object.values(registrations).reduce((s, g) => s + g.peutEtre, 0);
  const totalAll = totalOui + totalPeutEtre;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
    >
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#ff007f]/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#ff007f]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Inscriptions</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wider">via Tally</p>
        </div>
        {/* Total badge */}
        <div className="ml-auto flex items-center gap-2">
          <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-black text-white">{totalAll}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">participants</div>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xl font-black text-emerald-400">{totalOui}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Confirmés</div>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-xl font-black text-amber-400">{totalPeutEtre}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Peut-être</div>
          </div>
        </div>
      </div>

      {/* Per group */}
      <div className="space-y-3">
        {GROUPS.map((group) => {
          const data = registrations[group.key];
          const barWidth = totalAll > 0 ? (data.total / totalAll) * 100 : 0;

          return (
            <div key={group.key} className={`rounded-xl p-4 border ${group.bg} ${group.border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${group.text}`}>{group.label}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-emerald-400 font-bold">{data.oui} ✓</span>
                  <span className="text-amber-400 font-bold">{data.peutEtre} ~</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${barWidth}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${group.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
