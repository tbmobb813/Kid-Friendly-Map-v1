import { RegionConfig } from "@/types/region";

export const chicagoConfig: RegionConfig = {
  id: "chicago",
  name: "Chicago",
  country: "United States",
  timezone: "America/Chicago",
  currency: "USD",
  language: "en",
  coordinates: {
    latitude: 41.8781,
    longitude: -87.6298
  },
  transitSystems: [
    {
      id: "cta-l",
      name: "CTA L Train",
      type: "subway",
      color: "#0066CC",
      routes: ["Red", "Blue", "Brown", "Green", "Orange", "Pink", "Purple", "Yellow"]
    },
    {
      id: "cta-bus",
      name: "CTA Bus",
      type: "bus",
      color: "#4285F4"
    },
    {
      id: "metra",
      name: "Metra",
      type: "train",
      color: "#34A853"
    }
  ],
  emergencyNumber: "911",
  safetyTips: [
    "Always stay with a trusted adult when using public transportation",
    "Keep your Ventra card in a safe place",
    "Stand clear of the closing doors on the L",
    "Let passengers exit before boarding",
    "Hold the handrail on escalators and moving walkways"
  ],
  funFacts: [
    "The Chicago L is the second-largest rapid transit system in the US!",
    "Some L tracks are elevated above the streets - that's why it's called the 'L'!",
    "The Loop gets its name from the elevated tracks that loop around downtown.",
    "Chicago has the world's largest food festival - Taste of Chicago!",
    "Millennium Park's Cloud Gate sculpture is nicknamed 'The Bean'!"
  ],
  popularPlaces: [
    {
      name: "Millennium Park",
      category: "park",
      description: "Famous park with Cloud Gate sculpture and Crown Fountain"
    },
    {
      name: "Navy Pier",
      category: "landmark",
      description: "Popular pier with rides, restaurants, and lake views"
    },
    {
      name: "Lincoln Park Zoo",
      category: "attraction",
      description: "Free zoo with animals from around the world"
    }
  ],
  transitApiEndpoint: "https://api.transitchicago.com/",
  mapStyle: "standard"
};
