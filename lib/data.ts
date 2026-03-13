export type Category = 'Access 1' | 'Access 2' | 'Access 3' | 'Access 4' | 'Open 1' | 'Open 2' | 'Open 3';

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

export const WATT_CLUB_NAME = 'WATT.CC';

export const riders: Rider[] = [
  { id: '1', name: 'Camille Dupont', club: WATT_CLUB_NAME, category: 'Access 1', avatarUrl: 'https://picsum.photos/seed/camille/150/150' },
  { id: '2', name: 'Sarah Martin', club: WATT_CLUB_NAME, category: 'Open 2', avatarUrl: 'https://picsum.photos/seed/sarah/150/150' },
  { id: '3', name: 'Léa Bernard', club: WATT_CLUB_NAME, category: 'Access 3', avatarUrl: 'https://picsum.photos/seed/lea/150/150' },
  { id: '4', name: 'Emma Thomas', club: WATT_CLUB_NAME, category: 'Open 1', avatarUrl: 'https://picsum.photos/seed/emma/150/150' },
  { id: '5', name: 'Chloé Petit', club: WATT_CLUB_NAME, category: 'Access 2', avatarUrl: 'https://picsum.photos/seed/chloe/150/150' },
  { id: '6', name: 'Manon Robert', club: 'Paris Cycliste Olympique', category: 'Open 1' },
  { id: '7', name: 'Julie Richard', club: 'Argenteuil Val de Seine', category: 'Access 1' },
  { id: '8', name: 'Alice Dubois', club: 'Team 94 Cycling', category: 'Open 2' },
  { id: '9', name: 'Sophie Moreau', club: WATT_CLUB_NAME, category: 'Access 4', avatarUrl: 'https://picsum.photos/seed/sophie/150/150' },
  { id: '10', name: 'Laura Laurent', club: 'US Métro Transports', category: 'Open 3' },
];

export const ffcResults: RaceResult[] = [
  { id: 'r1', raceName: 'Prix de Satory', date: '2026-03-01', riderId: '1', position: 1, points: 50 },
  { id: 'r2', raceName: 'Prix de Satory', date: '2026-03-01', riderId: '7', position: 2, points: 35 },
  { id: 'r3', raceName: 'Boucles de Seine', date: '2026-03-08', riderId: '4', position: 3, points: 25 },
  { id: 'r4', raceName: 'Boucles de Seine', date: '2026-03-08', riderId: '6', position: 1, points: 50 },
  { id: 'r5', raceName: 'Grand Prix de Rungis', date: '2026-02-22', riderId: '2', position: 5, points: 18 },
  { id: 'r6', raceName: 'Grand Prix de Rungis', date: '2026-02-22', riderId: '8', position: 2, points: 35 },
  { id: 'r7', raceName: 'Prix de Satory', date: '2026-03-01', riderId: '3', position: 1, points: 50 },
  { id: 'r8', raceName: 'Prix de Satory', date: '2026-03-01', riderId: '5', position: 4, points: 20 },
  { id: 'r9', raceName: 'Critérium de Longchamp', date: '2026-03-10', riderId: '1', position: 2, points: 35 },
  { id: 'r10', raceName: 'Critérium de Longchamp', date: '2026-03-10', riderId: '4', position: 1, points: 50 },
  { id: 'r11', raceName: 'Critérium de Longchamp', date: '2026-03-10', riderId: '9', position: 3, points: 25 },
];

export const gfnyResults: RaceResult[] = [
  { id: 'g1', raceName: 'GFNY Cannes', date: '2026-03-29', riderId: '1', position: 12, points: 100 },
  { id: 'g2', raceName: 'GFNY Cannes', date: '2026-03-29', riderId: '2', position: 45, points: 50 },
  { id: 'g3', raceName: 'GFNY Villard de Lans', date: '2025-05-25', riderId: '4', position: 8, points: 150 },
  { id: 'g4', raceName: 'GFNY Lourdes Tourmalet', date: '2025-06-22', riderId: '1', position: 5, points: 200 },
];

// Helper to calculate total points for a rider
export const calculateTotalPoints = (riderId: string, results: RaceResult[]) => {
  return results
    .filter(r => r.riderId === riderId)
    .reduce((total, r) => total + r.points, 0);
};

// Helper to get leaderboard
export const getLeaderboard = (results: RaceResult[], filterClub?: string, filterCategory?: Category) => {
  let filteredRiders = riders;
  
  if (filterClub) {
    filteredRiders = filteredRiders.filter(r => r.club === filterClub);
  }
  
  if (filterCategory) {
    filteredRiders = filteredRiders.filter(r => r.category === filterCategory);
  }

  const leaderboard = filteredRiders.map(rider => ({
    ...rider,
    totalPoints: calculateTotalPoints(rider.id, results),
  })).filter(r => r.totalPoints > 0);

  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
};
