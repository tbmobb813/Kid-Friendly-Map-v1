import { RegionConfig } from "@/types/region";

export const atlantaConfig: RegionConfig = {
  id: "atlanta",
  name: "Atlanta",
  country: "United States",
  timezone: "America/New_York",
  currency: "USD",
  language: "en",
  coordinates: {
    latitude: 33.7490,
    longitude: -84.3880
  },
  transitSystems: [
    {
      id: "marta-rail",
      name: "MARTA Rail",
      type: "subway",
      color: "#0066CC",
      routes: ["Red", "Gold", "Blue", "Green"]
    },
    {
      id: "marta-bus",
      name: "MARTA Bus",
      type: "bus",
      color: "#E31837"
    },
    {
      id: "atlanta-streetcar",
      name: "Atlanta Streetcar",
      type: "tram",
      color: "#34A853"
    }
  ],
  emergencyNumber: "911",
  safetyTips: [
    "Always stay with a trusted adult when using public transportation",
    "Keep your Breeze card in a safe place",
    "Stand clear of closing doors",
    "Let passengers exit before boarding",
    "Be aware of your surroundings at all times"
  ],
  funFacts: [
    "Atlanta's MARTA system serves over 400,000 passengers daily!",
    "The city is known as the 'City in a Forest' for its tree coverage.",
    "Atlanta was the host city for the 1996 Summer Olympics.",
    "The Georgia Aquarium was the world's largest when it opened!",
    "Atlanta is the birthplace of Coca-Cola!"
  ],
  popularPlaces: [
    {
      name: "Georgia Aquarium",
      category: "attraction",
      description: "One of the largest aquariums in the world with whale sharks"
    },
    {
      name: "Centennial Olympic Park",
      category: "park",
      description: "Park built for the 1996 Olympics with fountains and events"
    },
    {
      name: "Zoo Atlanta",
      category: "attraction",
      description: "Zoo famous for its giant pandas and gorillas"
    }
  ],
  transitApiEndpoint: "https://api.itsmarta.com/",
  mapStyle: "standard"
};
