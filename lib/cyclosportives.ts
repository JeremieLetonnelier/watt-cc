import rawCyclosportives from './data/cyclosportives.json';

export interface Cyclosportive {
  name: string;
  date: string;
  distances: string[];
  price: string;
  participantsCount: number;
  difficulty: "1" | "2" | "3" | "4" | "5";
  popularity: number;
  location: string;
  distanceFromParis: string;
  transportAccess: boolean;
  wattParticipated: boolean;
  lastYearResults?: string;
  link: string;
}

export const getCyclosportives = (): Cyclosportive[] => {
  return rawCyclosportives as Cyclosportive[];
};
