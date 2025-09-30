import { RegionConfig } from "@/types/region";

export const philadelphiaConfig: RegionConfig = {
  id: "philadelphia",
  name: "Philadelphia",
  country: "United States",
  timezone: "America/New_York",
  currency: "USD",
  language: "en",
  coordinates: {
    latitude: 39.9526,
    longitude: -75.1652
  },
  transitSystems: [
    {
      id: "septa-subway",
      name: "SEPTA Subway",
      type: "subway",
      color: "#0066CC",
      routes: ["Broad Street Line", "Market-Frankford Line"]
    },
    {
      id: "septa-bus",
      name: "SEPTA Bus",
      type: "bus",
      color: "#E31837"
    },
    {
      id: "septa-trolley",
      name: "SEPTA Trolley",
      type: "tram",
      color: "#34A853",
      routes: ["10", "11", "13", "15", "34", "36"]
    },
    {
      id: "septa-regional",
      name: "SEPTA Regional Rail",
      type: "train",
      color: "#80276C"
    }
  ],
  emergencyNumber: "911",
  safetyTips: [
    "Always stay with a trusted adult when using public transportation",
    "Keep your SEPTA Key card in a safe place",
    "Be careful of the gap between the train and platform",
    "Let passengers exit before boarding",
    "Hold handrails on stairs and escalators"
  ],
  funFacts: [
    "Philadelphia has the oldest subway tunnel in the US, built in 1907!",
    "The Liberty Bell is a symbol of American independence.",
    "Philadelphia was the first capital of the United States.",
    "The city has more outdoor sculptures than any other US city!",
    "Philadelphia's Reading Terminal Market has been serving food since 1893!"
  ],
  popularPlaces: [
    {
      name: "Independence Hall",
      category: "landmark",
      description: "Historic building where the Declaration of Independence was signed"
    },
    {
      name: "Philadelphia Zoo",
      category: "attraction",
      description: "America's first zoo with over 1,300 animals"
    },
    {
      name: "Fairmount Park",
      category: "park",
      description: "Large urban park system with trails and historic mansions"
    }
  ],
  transitApiEndpoint: "https://api.septa.org/",
  mapStyle: "standard"
};
