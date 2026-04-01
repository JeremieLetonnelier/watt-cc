// Define an interface for the JSON data structure
interface FfcResult {
  id: string;
  raceName: string;
  date: string;
  riderId: string;
  position: number;
  positionGender?: number;
  points: number;
  gender?: string;
}

// Import the JSON file with a type assertion
const ffcScrapedData: FfcResult[] =
  require("../scripts/data/ffcResults.json");

// Export the imported data
export default ffcScrapedData;

export type Category =
  | "Access 1"
  | "Access 2"
  | "Access 3"
  | "Access 4"
  | "Open 1"
  | "Open 2"
  | "Open 3";

export interface Rider {
  id: string;
  name: string;
  club: string;
  category: Category;
  gender?: string;
  avatarUrl?: string;
  age?: number;
  region?: string;
  hasBenefitedFromRelegation?: boolean;
}

export interface RaceResult {
  id: string;
  raceName: string;
  date: string;
  riderId: string;
  position: number;
  positionGender?: number;
  points: number;
  isRegionalChampionship?: boolean;
  totalStarters?: number;
  challengePoints?: number;
  promotionPoints?: number;
  gender?: string;
  category?: string;
}

export const WATT_CLUB_NAME = "WATT CYCLING CLUB";

const ffcRidersData: any[] = require("../scripts/data/ffcRiders.json");
export const riders: Rider[] = ffcRidersData as Rider[];

export const ffcResults: RaceResult[] = ffcScrapedData as RaceResult[];

export const gfnyResults: RaceResult[] = [
  {
    id: "g1",
    raceName: "GFNY Cannes",
    date: "2026-03-29",
    riderId: "1",
    position: 12,
    points: 100,
  },
  {
    id: "g2",
    raceName: "GFNY Cannes",
    date: "2026-03-29",
    riderId: "2",
    position: 45,
    points: 50,
  },
  {
    id: "g3",
    raceName: "GFNY Villard de Lans",
    date: "2025-05-25",
    riderId: "4",
    position: 8,
    points: 150,
  },
  {
    id: "g4",
    raceName: "GFNY Lourdes Tourmalet",
    date: "2025-06-22",
    riderId: "1",
    position: 5,
    points: 200,
  },
];

// Helper to calculate total points for a rider
export const calculateTotalPoints = (
  riderId: string,
  results: RaceResult[],
  riderCategory?: string
) => {
  return results
    .filter((r) => r.riderId === riderId)
    .filter((r) => !r.category || r.category === "Not known category" || !riderCategory || r.category === riderCategory)
    .reduce((total, r) => total + r.points, 0);
};

// Helper to get leaderboard
export const getLeaderboard = (
  results: RaceResult[],
  filterClub?: string,
  filterCategory?: Category,
  filterGender?: "H" | "F"
) => {
  let filteredRiders = riders;

  if (filterClub) {
    filteredRiders = filteredRiders.filter((r) => r.club === filterClub);
  }

  if (filterCategory) {
    filteredRiders = filteredRiders.filter(
      (r) => r.category === filterCategory,
    );
  }

  if (filterGender) {
    filteredRiders = filteredRiders.filter((r) => r.gender === filterGender);
  }

  // Create a fast lookup map for rider categories
  const riderCategoryMap = new Map<string, string>();
  for (const rider of riders) {
    riderCategoryMap.set(rider.id, rider.category);
  }

  // Pre-calculate points and wins per rider to avoid O(N*M) nested loops
  const riderStats = new Map<string, { points: number; promotionPoints: number; wins: number }>();
  for (const res of results) {
    const currentCategory = riderCategoryMap.get(res.riderId);
    
    // Only count points/wins if the result's category matches the rider's CURRENT category,
    // or if the result's category is unknown
    if (res.category && res.category !== "Not known category" && currentCategory && res.category !== currentCategory) {
      continue;
    }

    const stats = riderStats.get(res.riderId) || { points: 0, promotionPoints: 0, wins: 0 };
    stats.points += typeof res.challengePoints === "number" ? res.challengePoints : (res.points || 0);
    stats.promotionPoints += typeof res.promotionPoints === "number" ? res.promotionPoints : 0;
    if (res.position === 1) {
      stats.wins += 1;
    }
    riderStats.set(res.riderId, stats);
  }

  const leaderboard = filteredRiders
    .map((rider) => {
      const stats = riderStats.get(rider.id);
      return {
        ...rider,
        totalPoints: stats ? stats.points : 0,
        totalPromotionPoints: stats ? stats.promotionPoints : 0,
        totalWins: stats ? stats.wins : 0,
        hasResults: !!stats,
      };
    })
    .filter((r) => r.totalPoints > 0 || r.hasResults);

  return leaderboard.sort((a, b) => {
  // Si les catégories sont différentes, on trie alphabétiquement (Access 1 -> Access 2 -> Open 1...)
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
  // Si même catégorie, on trie par les points
  return b.totalPoints - a.totalPoints;
  });
};

export const calculateTotalWins = (riderId: string, results: RaceResult[], riderCategory?: string) => {
  if (!results || !Array.isArray(results)) return 0;
  return results
    .filter((r) => r.riderId === riderId && r.positionGender === 1)
    .filter((r) => !r.category || r.category === "Not known category" || !riderCategory || r.category === riderCategory)
    .length;
};
