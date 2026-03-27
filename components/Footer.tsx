import Link from 'next/link';
import { Trophy, Flag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0514] border-t border-white/10 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ff007f]">
              WATT.CC
            </span>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="/ffc" className="hover:text-white transition-colors flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Classement FFC
            </Link>
            <Link href="/cyclosportives" className="hover:text-white transition-colors flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Cyclosportives
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} WATT.CC. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
