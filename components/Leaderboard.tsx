"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ffcResults,
  getLeaderboard,
  Category,
  WATT_CLUB_NAME,
} from "@/lib/data";
import Image from "next/image";
import { Trophy, Filter, Medal } from "lucide-react";

type Tab = "general" | "watt";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>("watt");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    "All",
  );

  const categories: (Category | "All")[] = [
    "All",
    "Access 1",
    "Access 2",
    "Access 3",
    "Access 4",
    "Open 1",
    "Open 2",
    "Open 3",
  ];

  const leaderboardData = useMemo(() => {
    return getLeaderboard(
      ffcResults,
      activeTab === "watt" ? WATT_CLUB_NAME : undefined,
      selectedCategory === "All" ? undefined : selectedCategory,
    );
  }, [activeTab, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Trophy className="w-10 h-10 text-[#ff007f]" />
            Classement FFC
          </h2>
          <p className="text-gray-400 mt-2 text-lg">
            Comité d&apos;Ile de France (CIF)
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab("watt")}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all ${
              activeTab === "watt"
                ? "bg-gradient-to-r from-[#4a00e0] to-[#ff007f] text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            WATT.CC
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all ${
              activeTab === "general"
                ? "bg-gradient-to-r from-[#4a00e0] to-[#ff007f] text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Général
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 text-gray-400 font-medium uppercase text-sm mr-4">
          <Filter className="w-4 h-4" />
          Catégorie
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm transition-colors border ${
              selectedCategory === cat
                ? "bg-[#ff007f]/20 border-[#ff007f] text-white"
                : "bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {cat === "All" ? "Toutes" : cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-gray-400 uppercase text-xs tracking-widest border-b border-white/10">
                <th className="p-4 font-semibold w-16 text-center">Pos</th>
                <th className="p-4 font-semibold">Coureur</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Club</th>
                <th className="p-4 font-semibold hidden md:table-cell">
                  Catégorie
                </th>
                <th className="p-4 font-semibold text-right">Pts Challenge</th>
                <th className="p-4 font-semibold text-center">Montée (Pts / Vict)</th>
              </tr>
            </thead>
            <tbody>
                {leaderboardData.length === 0 ? (
                  <tr key="empty-state">
                    <td
                      colSpan={5}
                      className="p-8 text-center text-gray-500 italic"
                    >
                      Aucun résultat trouvé pour ces filtres.
                    </td>
                  </tr>
                ) : (
                  leaderboardData.map((rider, index) => (
                    <tr
                      key={rider.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 text-center">
                        {index === 0 ? (
                          <Medal className="w-6 h-6 text-yellow-400 mx-auto" />
                        ) : index === 1 ? (
                          <Medal className="w-6 h-6 text-gray-300 mx-auto" />
                        ) : index === 2 ? (
                          <Medal className="w-6 h-6 text-amber-600 mx-auto" />
                        ) : (
                          <span className="text-gray-500 font-bold">
                            {index + 1}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border-2 border-transparent group-hover:border-[#ff007f] transition-colors">
                            {rider.avatarUrl ? (
                              <Image
                                src={rider.avatarUrl}
                                alt={rider.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-[#1a0b2e]">
                                {rider.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {rider.name}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {rider.club}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-gray-300 font-medium">
                        {rider.club === WATT_CLUB_NAME ? (
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a00e0] to-[#ff007f] font-black tracking-wider">
                            {rider.club}
                          </span>
                        ) : (
                          rider.club
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-gray-300">
                          {rider.category}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-2xl font-black text-white">
                          {rider.totalPoints}
                        </span>
                        <span className="text-xs text-gray-500 ml-1 uppercase font-bold">
                          pts
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${rider.totalPromotionPoints >= 25 ? 'text-green-400' : 'text-gray-300'}`}>
                            {rider.totalPromotionPoints} <span className="text-xs text-gray-500 uppercase">pts</span>
                          </span>
                          {rider.totalWins > 0 && (
                            <span className={`flex items-center gap-1 text-xs font-bold mt-1 ${rider.totalWins >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {rider.totalWins} <Trophy className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
