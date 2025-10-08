// ...existing code...

export interface Station {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  lines: string[];
  accessible: boolean;
  kidFriendly: {
    hasElevator: boolean;
    hasBathroom: boolean;
    hasWideGates: boolean;
    safetyRating: number; // 1-5 scale
    nearbyAttractions?: string[];
  };
  entrances: {
    street: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }[];
}

export const nycStations: Station[] = [
  {
    id: 'main-st-station',
    name: 'Main St Station',
    coordinates: {
      latitude: 40.7589,
      longitude: -73.9851,
    },
    lines: ['A', 'C'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 4,
      nearbyAttractions: ['Central Park', "Children's Museum"],
    },
    entrances: [
      {
        street: 'Main St & 42nd Ave',
        coordinates: {
          latitude: 40.7589,
          longitude: -73.9851,
        },
      },
    ],
  },
  {
    id: 'central-park-station',
    name: 'Central Park Station',
    coordinates: {
      latitude: 40.7679,
      longitude: -73.9781,
    },
    lines: ['B', 'D'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 5,
      nearbyAttractions: ['Central Park Zoo', 'Alice in Wonderland Statue', 'Playground'],
    },
    entrances: [
      {
        street: 'Central Park West & 72nd St',
        coordinates: {
          latitude: 40.7679,
          longitude: -73.9781,
        },
      },
    ],
  },
  {
    id: 'downtown-station',
    name: 'Downtown Station',
    coordinates: {
      latitude: 40.7505,
      longitude: -73.9934,
    },
    lines: ['E', 'F'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: false,
      hasWideGates: true,
      safetyRating: 4,
      nearbyAttractions: ['Times Square', 'Broadway Shows'],
    },
    entrances: [
      {
        street: 'Broadway & 42nd St',
        coordinates: {
          latitude: 40.7505,
          longitude: -73.9934,
        },
      },
    ],
  },
  {
    id: 'school-station',
    name: 'School Station',
    coordinates: {
      latitude: 40.7549,
      longitude: -73.984,
    },
    lines: ['G'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 5,
      nearbyAttractions: ['Public Library', 'Science Museum', 'School Zone'],
    },
    entrances: [
      {
        street: 'School Ave & Education Blvd',
        coordinates: {
          latitude: 40.7549,
          longitude: -73.984,
        },
      },
    ],
  },
  {
    id: 'brooklyn-bridge-station',
    name: 'Brooklyn Bridge Station',
    coordinates: {
      latitude: 40.7038,
      longitude: -73.9903,
    },
    lines: ['4', '5', '6'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 4,
      nearbyAttractions: ['Brooklyn Bridge', 'South Street Seaport', 'Stone Street'],
    },
    entrances: [
      {
        street: 'Park Row & Centre St',
        coordinates: {
          latitude: 40.7038,
          longitude: -73.9903,
        },
      },
    ],
  },
  {
    id: 'times-square-station',
    name: 'Times Square Station',
    coordinates: {
      latitude: 40.756,
      longitude: -73.9866,
    },
    lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 3,
      nearbyAttractions: ['Times Square', 'M&M Store', 'Toy Stores'],
    },
    entrances: [
      {
        street: '42nd St & Broadway',
        coordinates: {
          latitude: 40.756,
          longitude: -73.9866,
        },
      },
    ],
  },
];

// Helper function to find station by ID
export function findStationById(id: string): Station | undefined {
  return nycStations.find((station) => station.id === id);
}

// Helper function to find stations by line
export function findStationsByLine(line: string): Station[] {
  return nycStations.filter((station) => station.lines.includes(line));
}

// Helper function to find nearest stations to a location
export function findNearestStations(
  latitude: number,
  longitude: number,
  limit: number = 5,
): { station: Station; distance: number }[] {
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return nycStations
    .map((station) => ({
      station,
      distance: calculateDistance(
        latitude,
        longitude,
        station.coordinates.latitude,
        station.coordinates.longitude,
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
