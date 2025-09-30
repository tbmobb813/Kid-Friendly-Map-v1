import { RegionConfig } from "@/types/region";

export const bostonConfig: RegionConfig = {
  id: "boston",
  name: "Boston",
  country: "United States",
  timezone: "America/New_York",
  currency: "USD",
  language: "en",
  coordinates: {
    latitude: 42.3601,
    longitude: -71.0589
  },
  transitSystems: [
    {
      id: "mbta-subway",
      name: "MBTA Subway (The T)",
      type: "subway",
      color: "#003DA5",
      routes: ["Red", "Blue", "Green", "Orange"]
    },
    {
      id: "mbta-bus",
      name: "MBTA Bus",
      type: "bus",
      color: "#FFC72C"
    },
    {
      id: "mbta-commuter",
      name: "Commuter Rail",
      type: "train",
      color: "#80276C"
    }
  ],
  emergencyNumber: "911",
  safetyTips: [
    "Always stay with a trusted adult when using public transportation",
    "Keep your CharlieCard or CharlieTicket safe",
    "Be careful of the gap between the train and platform",
    "Let passengers exit before boarding",
    "Hold handrails on stairs and escalators"
  ],
  funFacts: [
    "Boston's subway system is the oldest in the United States!",
    "The Green Line trolleys run both underground and above ground.",
    "Boston Common is America's oldest public park.",
    "The Freedom Trail is a 2.5-mile path through historic Boston.",
    "Boston Tea Party happened in Boston Harbor in 1773!"
  ],
  popularPlaces: [
    {
      name: "Boston Common",
      category: "park",
      description: "America's oldest public park with swan boats and playgrounds"
    },
    {
      name: "Fenway Park",
      category: "landmark",
      description: "Historic baseball stadium, home of the Red Sox"
    },
    {
      name: "Museum of Science",
      category: "attraction",
      description: "Interactive science museum with planetarium and IMAX"
    }
  ],
  transitApiEndpoint: "https://api-v3.mbta.com/",
  mapStyle: "standard"
};
