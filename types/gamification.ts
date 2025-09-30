export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
};

export type UserStats = {
  totalTrips: number;
  totalPoints: number;
  placesVisited: number;
  favoriteTransitMode: string;
  streakDays: number;
  level: number;
};

export type SafetyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
};

export type TripJournal = {
  id: string;
  date: Date;
  from: string;
  to: string;
  photos: string[];
  notes: string;
  rating: number;
  funFacts: string[];
};
