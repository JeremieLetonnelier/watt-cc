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
  require("../scripts/data/ffcResults.json").default;

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

export const WATT_CLUB_NAME = "WATT.CC";

export const riders: Rider[] = [
  {
    id: "ilian-ferguenis",
    name: "Ilian Ferguenis",
    club: WATT_CLUB_NAME,
    category: "Access 1",
    avatarUrl: "https://picsum.photos/seed/camille/150/150",
  },
  {
    id: "sarah-martin",
    name: "Sarah Martin",
    club: WATT_CLUB_NAME,
    category: "Open 2",
    avatarUrl: "https://picsum.photos/seed/sarah/150/150",
  },
  {
    id: "3",
    name: "Léa Bernard",
    club: WATT_CLUB_NAME,
    category: "Access 3",
    avatarUrl: "https://picsum.photos/seed/lea/150/150",
  },
  {
    id: "4",
    name: "Emma Thomas",
    club: WATT_CLUB_NAME,
    category: "Open 1",
    avatarUrl: "https://picsum.photos/seed/emma/150/150",
  },
  {
    id: "5",
    name: "Chloé Petit",
    club: WATT_CLUB_NAME,
    category: "Access 2",
    avatarUrl: "https://picsum.photos/seed/chloe/150/150",
  },
  {
    id: "6",
    name: "Manon Robert",
    club: "Paris Cycliste Olympique",
    category: "Open 1",
  },
  {
    id: "7",
    name: "Julie Richard",
    club: "Argenteuil Val de Seine",
    category: "Access 1",
  },
  {
    id: "8",
    name: "Alice Dubois",
    club: "Team 94 Cycling",
    category: "Open 2",
  },
  {
    id: "9",
    name: "Sophie Moreau",
    club: WATT_CLUB_NAME,
    category: "Access 4",
    avatarUrl: "https://picsum.photos/seed/sophie/150/150",
  },
  {
    id: "10",
    name: "Laura Laurent",
    club: "US Métro Transports",
    category: "Open 3",
  },
];

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
    .map((rider) => ({
      ...rider,
      totalPoints: calculateTotalPoints(rider.id, results),
    }))
    .filter((r) => r.totalPoints > 0);

  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
};
