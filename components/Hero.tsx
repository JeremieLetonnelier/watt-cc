'use client';

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#0a0514] min-h-[60vh] flex items-center justify-center">
      {/* Background Gradient matching the image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#4a00e0]/40 to-[#ff007f]/20 mix-blend-multiply" />
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff007f]/30 via-transparent to-transparent opacity-50 blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#4a00e0]/40 via-transparent to-transparent opacity-60 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
            Bienvenue chez <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ff007f]">WATT</span>
          </h1>
          
          <div className="flex flex-col items-center justify-center gap-2">
            <h2 className="text-2xl md:text-4xl font-bold tracking-widest text-white/90 uppercase">
              Women Are Talented
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#4a00e0] to-[#ff007f] rounded-full mt-4" />
          </div>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 font-medium">
            Le classement officiel des coureurs du club WATT.CC sur les courses FFC (CIF) et les cyclosportives GFNY.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/ffc">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#ff007f] to-[#4a00e0] text-white font-bold rounded-full shadow-lg shadow-[#ff007f]/25 flex items-center gap-2 uppercase tracking-wide"
              >
                Classement FFC <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/gfny">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 uppercase tracking-wide"
              >
                Résultats GFNY
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
