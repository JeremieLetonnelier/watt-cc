import Leaderboard from '@/components/Leaderboard';

export default function FFCPage() {
  return (
    <div className="min-h-screen bg-[#0a0514] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
          Classement <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f]">FFC</span>
        </h1>
        <p className="text-xl text-gray-400 mt-4 max-w-2xl">
          Retrouvez le classement complet des coureurs du club WATT.CC et le classement général du Comité d'Ile de France (CIF).
        </p>
      </div>
      <Leaderboard />
    </div>
  );
}
