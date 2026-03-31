import GFNYResults from '@/components/GFNYResults';

export default function GFNYPage() {
  return (
    <div className="min-h-screen bg-[#0a0514] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
          Résultats <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">GFNY</span>
        </h1>
        <p className="text-xl text-gray-400 mt-4 max-w-2xl">
          Les performances de nos coureurs sur les cyclosportives du circuit mondial GFNY.
        </p>
      </div>
      <GFNYResults />
    </div>
  );
}
