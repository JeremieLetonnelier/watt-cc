// Define an interface for the JSON data structure
interface FfcResult {
  id: string;
  raceName: string;
  date: string;
  riderId: string;
  position: number;
  points: number;
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
  avatarUrl?: string;
}

export interface RaceResult {
  id: string;
  raceName: string;
  date: string;
  riderId: string;
  position: number;
  points: number;
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
) => {
  return results
    .filter((r) => r.riderId === riderId)
    .reduce((total, r) => total + r.points, 0);
};

// Helper to get leaderboard
export const getLeaderboard = (
  results: RaceResult[],
  filterClub?: string,
  filterCategory?: Category,
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

  const leaderboard = filteredRiders
    .map((rider) => {
      const riderResults = results.filter((res) => res.riderId === rider.id);
      return {
        ...rider,
        totalPoints: riderResults.reduce((total, res) => total + res.points, 0),
        totalWins: riderResults.filter((res) => res.position === 1).length,
        hasResults: riderResults.length > 0,
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

export const calculateTotalWins = (riderId: string, results: RaceResult[]) => {
  if (!results || !Array.isArray(results)) return 0;
  return results.filter((r) => r.riderId === riderId && r.position === 1)
    .length;
};
