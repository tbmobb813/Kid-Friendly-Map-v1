import { Place } from "@/types/navigation";

export const favoriteLocations: Place[] = [
  {
    id: "home",
    name: "Home",
    address: "123 Maple Street",
    category: "home",
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    isFavorite: true
  },
  {
    id: "school",
    name: "My School",
    address: "555 Learning Lane",
    category: "school",
    coordinates: {
      latitude: 40.7200,
      longitude: -74.0100
    },
    isFavorite: true
  },
  {
    id: "grandma",
    name: "Grandma's House",
    address: "42 Cookie Avenue",
    category: "family",
    coordinates: {
      latitude: 40.7300,
      longitude: -74.0200
    },
    isFavorite: true
  },
  {
    id: "park",
    name: "Central Park",
    address: "Central Park",
    category: "park",
    coordinates: {
      latitude: 40.7850,
      longitude: -73.9650
    },
    isFavorite: true
  }
];

export const recentSearches: Place[] = [
  {
    id: "library",
    name: "Public Library",
    address: "100 Book Street",
    category: "library",
    coordinates: {
      latitude: 40.7150,
      longitude: -74.0080
    }
  },
  {
    id: "pizzaplace",
    name: "Pizza Palace",
    address: "88 Cheese Boulevard",
    category: "restaurant",
    coordinates: {
      latitude: 40.7220,
      longitude: -74.0150
    }
  }
];
