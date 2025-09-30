import { RegionConfig } from "@/types/region";

export const tokyoConfig: RegionConfig = {
  id: "tokyo",
  name: "Tokyo",
  country: "Japan",
  timezone: "Asia/Tokyo",
  currency: "JPY",
  language: "ja",
  coordinates: {
    latitude: 35.6762,
    longitude: 139.6503
  },
  transitSystems: [
    {
      id: "jr-yamanote",
      name: "JR Yamanote Line",
      type: "train",
      color: "#9ACD32",
      routes: ["Yamanote"]
    },
    {
      id: "tokyo-metro",
      name: "Tokyo Metro",
      type: "subway",
      color: "#0066CC",
      routes: ["Ginza", "Marunouchi", "Hibiya", "Tozai", "Chiyoda", "Yurakucho", "Hanzomon", "Namboku", "Fukutoshin"]
    },
    {
      id: "toei-subway",
      name: "Toei Subway",
      type: "subway",
      color: "#B6007A",
      routes: ["Asakusa", "Mita", "Shinjuku", "Oedo"]
    }
  ],
  emergencyNumber: "110",
  safetyTips: [
    "Always stay with a trusted adult when using trains",
    "Keep your IC card (Suica/Pasmo) safe",
    "Bow slightly when entering and exiting trains",
    "Keep conversations quiet on trains",
    "Stand on the left side of escalators in Tokyo"
  ],
  funFacts: [
    "Tokyo's train system is one of the most punctual in the world!",
    "Shinjuku Station is the busiest train station in the world.",
    "Some train lines have women-only cars during rush hours.",
    "The Yamanote Line makes a complete loop around central Tokyo.",
    "Ueno Park has over 1,000 cherry blossom trees!"
  ],
  popularPlaces: [
    {
      name: "Ueno Park",
      category: "park",
      description: "Large park famous for cherry blossoms, museums, and zoo"
    },
    {
      name: "Tokyo Skytree",
      category: "landmark",
      description: "Tallest structure in Japan with observation decks"
    },
    {
      name: "Senso-ji Temple",
      category: "temple",
      description: "Ancient Buddhist temple in Asakusa district"
    }
  ],
  transitApiEndpoint: "https://api.tokyometro.jp/",
  mapStyle: "standard"
};
