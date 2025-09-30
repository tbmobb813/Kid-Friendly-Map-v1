import { useMemo } from "react";
import { useRegionStore } from "@/stores/regionStore";
import { formatCurrency, formatDistance, formatTemperature, getLocalizedTime } from "@/utils/regionUtils";

export function useRegionalData() {
  const { currentRegion, userPreferences } = useRegionStore();

  const formatters = useMemo(() => ({
    currency: (amount: number) => formatCurrency(amount, currentRegion.currency),
    distance: (meters: number) => formatDistance(meters, userPreferences.preferredUnits),
    temperature: (celsius: number) => formatTemperature(celsius, userPreferences.preferredUnits),
    time: (date: Date) => getLocalizedTime(date, currentRegion.timezone),
  }), [currentRegion, userPreferences]);

  const regionalContent = useMemo(() => ({
    transitSystems: currentRegion.transitSystems,
    emergencyNumber: currentRegion.emergencyNumber,
    safetyTips: currentRegion.safetyTips,
    funFacts: currentRegion.funFacts,
    popularPlaces: currentRegion.popularPlaces,
    language: currentRegion.language,
    timezone: currentRegion.timezone,
  }), [currentRegion]);

  return {
    currentRegion,
    userPreferences,
    formatters,
    regionalContent,
  };
}
