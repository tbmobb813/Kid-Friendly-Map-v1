import { RegionConfig } from "@/types/region";

export const newYorkConfig: RegionConfig = {
  id: "nyc",
  name: "New York City",
  country: "United States",
  timezone: "America/New_York",
  currency: "USD",
  language: "en",
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  transitSystems: [
    {
      id: "mta-subway",
      name: "MTA Subway",
      type: "subway",
      color: "#0039A6",
      routes: ["A", "B", "C", "D", "E", "F", "G", "J", "L", "M", "N", "Q", "R", "W", "Z", "1", "2", "3", "4", "5", "6", "7"]
    },
    {
      id: "mta-bus",
      name: "MTA Bus",
      type: "bus",
      color: "#4285F4"
    },
    {
      id: "lirr",
      name: "Long Island Rail Road",
      type: "train",
      color: "#34A853"
    }
  ],
  emergencyNumber: "911",
  safetyTips: [
    "Always stay with a trusted adult when using public transportation",
    "Keep your MetroCard or OMNY card in a safe place",
    "Stand clear of the closing doors",
    "Let passengers exit before boarding",
    "Hold the handrail on escalators"
  ],
  funFacts: [
    "The NYC subway system has 472 stations - more than any other transit system!",
    "The subway runs 24/7, making it one of the few systems that never closes.",
    "Some subway tunnels are over 100 years old.",
    "The longest subway ride you can take is 2 hours and 45 minutes!",
    "Central Park has over 25,000 trees from 150 different species!"
  ],
  popularPlaces: [
    {
      name: "Central Park",
      category: "park",
      description: "A large public park in Manhattan with playgrounds, lakes, and walking paths"
    },
    {
      name: "Brooklyn Bridge",
      category: "landmark",
      description: "Historic bridge connecting Manhattan and Brooklyn with great views"
    },
    {
      name: "Times Square",
      category: "landmark",
      description: "Busy commercial intersection known for its bright lights and theaters"
    }
  ],
  transitApiEndpoint: "https://api.mta.info/",
  mapStyle: "standard"
};
