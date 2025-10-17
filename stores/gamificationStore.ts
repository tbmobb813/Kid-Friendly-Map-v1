import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, UserStats, SafetyContact, TripJournal } from '@/types/gamification';

type GamificationState = {
  userStats: UserStats;
  achievements: Achievement[];
  safetyContacts: SafetyContact[];
  tripJournal: TripJournal[];

  // Actions
  addPoints: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
  completeTrip: (from: string, to: string) => void;
  addSafetyContact: (contact: Omit<SafetyContact, 'id'>) => void;
  addTripEntry: (entry: Omit<TripJournal, 'id'>) => void;
  updateStats: (updates: Partial<UserStats>) => void;
};

const initialAchievements: Achievement[] = [
  {
    id: 'first-trip',
    title: 'First Adventure!',
    description: 'Complete your first trip using KidMap',
    icon: '🎉',
    points: 50,
    unlocked: false,
  },
  {
    id: 'subway-explorer',
    title: 'Subway Explorer',
    description: 'Use the subway 5 times',
    icon: '🚇',
    points: 100,
    unlocked: false,
  },
  {
    id: 'neighborhood-navigator',
    title: 'Neighborhood Navigator',
    description: 'Visit 10 different places',
    icon: '🗺️',
    points: 150,
    unlocked: false,
  },
  {
    id: 'safety-star',
    title: 'Safety Star',
    description: 'Add emergency contacts',
    icon: '⭐',
    points: 75,
    unlocked: false,
  },
  {
    id: 'photo-journalist',
    title: 'Photo Journalist',
    description: 'Take photos during 3 trips',
    icon: '📸',
    points: 80,
    unlocked: false,
  },
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userStats: {
        totalTrips: 0,
        totalPoints: 0,
        placesVisited: 0,
        favoriteTransitMode: 'walk',
        streakDays: 0,
        level: 1,
      },
      achievements: initialAchievements,
      safetyContacts: [],
      tripJournal: [],

      addPoints: (points) =>
        set((state) => {
          const newPoints = state.userStats.totalPoints + points;
          const newLevel = Math.floor(newPoints / 200) + 1;

          return {
            userStats: {
              ...state.userStats,
              totalPoints: newPoints,
              level: newLevel,
            },
          };
        }),

      unlockAchievement: (achievementId) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement || achievement.unlocked) return state;

          const updatedAchievements = state.achievements.map((a) =>
            a.id === achievementId ? { ...a, unlocked: true, unlockedAt: new Date() } : a,
          );

          return {
            achievements: updatedAchievements,
            userStats: {
              ...state.userStats,
              totalPoints: state.userStats.totalPoints + achievement.points,
            },
          };
        }),

      completeTrip: (from, to) =>
        set((state) => {
          const newStats = {
            ...state.userStats,
            totalTrips: state.userStats.totalTrips + 1,
            placesVisited: state.userStats.placesVisited + 1,
          };

          // Check for achievement unlocks
          const { unlockAchievement } = get();
          if (newStats.totalTrips === 1) {
            unlockAchievement('first-trip');
          }
          if (newStats.placesVisited >= 10) {
            unlockAchievement('neighborhood-navigator');
          }

          return { userStats: newStats };
        }),

      addSafetyContact: (contact) =>
        set((state) => {
          const newContact = {
            ...contact,
            id: Date.now().toString(),
          };

          const { unlockAchievement } = get();
          if (state.safetyContacts.length === 0) {
            unlockAchievement('safety-star');
          }

          return {
            safetyContacts: [...state.safetyContacts, newContact],
          };
        }),

      addTripEntry: (entry) =>
        set((state) => {
          const newEntry = {
            ...entry,
            id: Date.now().toString(),
          };

          const entriesWithPhotos = state.tripJournal.filter((e) => e.photos.length > 0).length;
          const { unlockAchievement } = get();
          if (entry.photos.length > 0 && entriesWithPhotos >= 2) {
            unlockAchievement('photo-journalist');
          }

          return {
            tripJournal: [...state.tripJournal, newEntry],
          };
        }),

      updateStats: (updates) =>
        set((state) => ({
          userStats: { ...state.userStats, ...updates },
        })),
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
