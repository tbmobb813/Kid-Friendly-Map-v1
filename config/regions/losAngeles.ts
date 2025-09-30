import { RegionConfig } from "@/types/region";

export const losAngelesConfig: RegionConfig = {
  id: "la",
  name: "Los Angeles",
  country: "United States",
  timezone: "America/Los_Angeles",
  currency: "USD",
  language: "en",
  coordinates: {
    latitude: 34.0522,
    longitude: -118.2437
  },
  transitSystems: [
    {
      id: "metro-rail",
      name: "Metro Rail",
      type: "subway",
      color: "#0066CC",
      routes: ["Red", "Purple", "Blue", "Expo", "Green", "Gold"]
    },
    {
      id: "metro-bus",
      name: "Metro Bus",
      type: "bus",
      color: "#E31837"
    },
    {
      id: "dash",
      name: "DASH",
      type: "bus",
      color: "#34A853"
    }
  ],
  emergencyNumber: "911",
  safetyTips: [
    "Always stay with a trusted adult when using public transportation",
    "Keep your TAP card in a safe place",
    "Be aware of your surroundings at all times",
    "Let passengers exit before boarding",
    "Stay seated while the vehicle is moving"
  ],
  funFacts: [
    "LA Metro Rail serves over 300,000 passengers daily!",
    "The Hollywood Sign was originally built in 1923.",
    "Los Angeles has more museums than any other city in the US!",
    "The La Brea Tar Pits have fossils that are over 50,000 years old.",
    "Santa Monica Pier has been entertaining families since 1909!"
  ],
  popularPlaces: [
    {
      name: "Griffith Observatory",
      category: "attraction",
      description: "Free observatory with planetarium and city views"
    },
    {
      name: "Santa Monica Pier",
      category: "landmark",
      description: "Historic pier with amusement park and beach access"
    },
    {
      name: "Exposition Park",
      category: "park",
      description: "Park with museums, gardens, and sports venues"
    }
  ],
  transitApiEndpoint: "https://api.metro.net/",
  mapStyle: "standard"
};
