import Hero from '@/components/Hero';
import WeeklyHighlight from '@/components/WeeklyHighlight';
import GFNYResults from '@/components/GFNYResults';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0514]">
      <Hero />
      <WeeklyHighlight />
      <div className="py-24 bg-gradient-to-b from-[#0a0514] to-[#1a0b2e]">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Aperçu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f]">FFC</span>
          </h2>
        </div>
        <Leaderboard />
      </div>
      <GFNYResults />
    </div>
  );
}
