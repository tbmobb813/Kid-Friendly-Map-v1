import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegionConfig, UserRegionPreferences } from "@/types/region";
import { newYorkConfig } from "@/config/regions/newYork";
import { londonConfig } from "@/config/regions/london";
import { tokyoConfig } from "@/config/regions/tokyo";
import { chicagoConfig } from "@/config/regions/chicago";
import { sanFranciscoConfig } from "@/config/regions/sanFrancisco";
import { washingtonConfig } from "@/config/regions/washington";
import { bostonConfig } from "@/config/regions/boston";
import { losAngelesConfig } from "@/config/regions/losAngeles";
import { seattleConfig } from "@/config/regions/seattle";
import { philadelphiaConfig } from "@/config/regions/philadelphia";
import { atlantaConfig } from "@/config/regions/atlanta";
import { miamiConfig } from "@/config/regions/miami";

type RegionState = {
  availableRegions: RegionConfig[];
  currentRegion: RegionConfig;
  userPreferences: UserRegionPreferences;
  isConfigured: boolean;
  isHydrated: boolean;
  
  // Actions
  setRegion: (regionId: string) => void;
  updatePreferences: (preferences: Partial<UserRegionPreferences>) => void;
  completeOnboarding: () => void;
  addCustomRegion: (region: RegionConfig) => void;
  removeRegion: (regionId: string) => void;
  updateRegionTransitData: (regionId: string, transitData: Partial<RegionConfig>) => void;
  getCurrentTransitSystems: () => RegionConfig['transitSystems'];
  getEmergencyNumber: () => string;
  getSafetyTips: () => string[];
  getFunFacts: () => string[];
  getRegionsByCountry: (country: string) => RegionConfig[];
  searchRegions: (query: string) => RegionConfig[];
  setHydrated: () => void;
};

const defaultPreferences: UserRegionPreferences = {
  selectedRegion: "nyc",
  preferredLanguage: "en",
  preferredUnits: "imperial",
  accessibilityMode: false,
  parentalControls: true,
};

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      availableRegions: [
        newYorkConfig, 
        chicagoConfig, 
        sanFranciscoConfig, 
        washingtonConfig, 
        bostonConfig, 
        losAngelesConfig, 
        seattleConfig,
        philadelphiaConfig,
        atlantaConfig,
        miamiConfig,
        londonConfig, 
        tokyoConfig
      ],
      currentRegion: newYorkConfig,
      userPreferences: defaultPreferences,
      isConfigured: false,
      isHydrated: false,

      setRegion: (regionId) => set((state) => {
        const region = state.availableRegions.find(r => r.id === regionId);
        if (region) {
          return {
            currentRegion: region,
            userPreferences: {
              ...state.userPreferences,
              selectedRegion: regionId,
            },
          };
        }
        return state;
      }),

      updatePreferences: (preferences) => set((state) => ({
        userPreferences: { ...state.userPreferences, ...preferences },
      })),

      completeOnboarding: () => set({ isConfigured: true }),

      addCustomRegion: (region) => set((state) => ({
        availableRegions: [...state.availableRegions, region],
      })),

      removeRegion: (regionId) => set((state) => ({
        availableRegions: state.availableRegions.filter(r => r.id !== regionId),
      })),

      updateRegionTransitData: (regionId, transitData) => set((state) => ({
        availableRegions: state.availableRegions.map(region => 
          region.id === regionId 
            ? { ...region, ...transitData }
            : region
        ),
        currentRegion: state.currentRegion.id === regionId 
          ? { ...state.currentRegion, ...transitData }
          : state.currentRegion
      })),

      getCurrentTransitSystems: () => {
        return get().currentRegion.transitSystems;
      },

      getEmergencyNumber: () => {
        return get().currentRegion.emergencyNumber;
      },

      getSafetyTips: () => {
        return get().currentRegion.safetyTips;
      },

      getFunFacts: () => {
        return get().currentRegion.funFacts;
      },

      getRegionsByCountry: (country) => {
        return get().availableRegions.filter(region => region.country === country);
      },

      searchRegions: (query) => {
        const regions = get().availableRegions;
        const lowercaseQuery = query.toLowerCase();
        return regions.filter(region => 
          region.name.toLowerCase().includes(lowercaseQuery) ||
          region.country.toLowerCase().includes(lowercaseQuery)
        );
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "region-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
