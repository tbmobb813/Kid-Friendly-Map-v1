/**
 * City Transit Lines Template
 *
 * Template for creating subway/metro/rail line information for any city.
 * Based on the NYC subway system but adaptable to any rail transit system.
 *
 * INSTRUCTIONS:
 * 1. Copy this file to config/transit-data/yourCity-lines.ts
 * 2. Replace placeholder values with your city's actual line information
 * 3. Update colors, stations, and attractions for each line
 * 4. Add or remove lines as needed for your city
 * 5. Update the line colors export at the bottom
 */

// Replace these types with actual line identifiers for your city
export type TransitLine = {
  id: string; // Line identifier (e.g., "central", "circle", "red")
  name: string; // Full line name (e.g., "Central Line", "Circle Line")
  color: string; // Hex color code for the line
  kidFriendlyName: string; // Simple name for kids (e.g., "The Red Line")
  description: string; // Brief description of where the line goes
  express: boolean; // Whether this is an express service
  terminalStations: string[]; // End stations of the line
  popularStops: {
    station: string; // Station name
    attractions: string[]; // Nearby attractions
    kidTip: string; // Kid-friendly tip for this station
  }[];
  funFacts: string[]; // Interesting facts about this line
  safetyNote: string; // Safety information specific to this line
};

export const cityTransitLines: TransitLine[] = [
  {
    id: 'REPLACE_LINE_ID_1', // e.g., "central", "red", "1"
    name: 'REPLACE_LINE_NAME_1', // e.g., "Central Line", "Red Line", "Line 1"
    color: '#FF0000', // Replace with actual line color
    kidFriendlyName: 'REPLACE_KID_FRIENDLY_NAME_1', // e.g., "The Red Line"
    description: 'REPLACE_DESCRIPTION_1', // e.g., "Goes from the airport to downtown"
    express: false, // Change to true if this is an express line
    terminalStations: ['REPLACE_TERMINAL_1', 'REPLACE_TERMINAL_2'],
    popularStops: [
      {
        station: 'REPLACE_POPULAR_STATION_1',
        attractions: ['REPLACE_ATTRACTION_1', 'REPLACE_ATTRACTION_2', 'REPLACE_ATTRACTION_3'],
        kidTip: 'REPLACE_KID_TIP_1',
      },
      {
        station: 'REPLACE_POPULAR_STATION_2',
        attractions: ['REPLACE_ATTRACTION_4', 'REPLACE_ATTRACTION_5'],
        kidTip: 'REPLACE_KID_TIP_2',
      },
      {
        station: 'REPLACE_POPULAR_STATION_3',
        attractions: ['REPLACE_ATTRACTION_6', 'REPLACE_ATTRACTION_7'],
        kidTip: 'REPLACE_KID_TIP_3',
      },
    ],
    funFacts: [
      'REPLACE_FUN_FACT_1', // e.g., "This line is the oldest in the city"
      'REPLACE_FUN_FACT_2', // e.g., "It goes under the main river"
      'REPLACE_FUN_FACT_3', // e.g., "The deepest station is 50 meters underground"
    ],
    safetyNote: 'REPLACE_SAFETY_NOTE_1',
  },
  {
    id: 'REPLACE_LINE_ID_2',
    name: 'REPLACE_LINE_NAME_2',
    color: '#0000FF', // Replace with actual line color
    kidFriendlyName: 'REPLACE_KID_FRIENDLY_NAME_2',
    description: 'REPLACE_DESCRIPTION_2',
    express: true, // This is an express line example
    terminalStations: ['REPLACE_TERMINAL_3', 'REPLACE_TERMINAL_4'],
    popularStops: [
      {
        station: 'REPLACE_POPULAR_STATION_4',
        attractions: ['REPLACE_ATTRACTION_8', 'REPLACE_ATTRACTION_9'],
        kidTip: 'REPLACE_KID_TIP_4',
      },
      {
        station: 'REPLACE_POPULAR_STATION_5',
        attractions: ['REPLACE_ATTRACTION_10', 'REPLACE_ATTRACTION_11'],
        kidTip: 'REPLACE_KID_TIP_5',
      },
    ],
    funFacts: ['REPLACE_FUN_FACT_4', 'REPLACE_FUN_FACT_5', 'REPLACE_FUN_FACT_6'],
    safetyNote: 'REPLACE_SAFETY_NOTE_2',
  },
  {
    id: 'REPLACE_LINE_ID_3',
    name: 'REPLACE_LINE_NAME_3',
    color: '#00FF00', // Replace with actual line color
    kidFriendlyName: 'REPLACE_KID_FRIENDLY_NAME_3',
    description: 'REPLACE_DESCRIPTION_3',
    express: false,
    terminalStations: ['REPLACE_TERMINAL_5', 'REPLACE_TERMINAL_6'],
    popularStops: [
      {
        station: 'REPLACE_POPULAR_STATION_6',
        attractions: ['REPLACE_ATTRACTION_12', 'REPLACE_ATTRACTION_13'],
        kidTip: 'REPLACE_KID_TIP_6',
      },
      {
        station: 'REPLACE_POPULAR_STATION_7',
        attractions: ['REPLACE_ATTRACTION_14', 'REPLACE_ATTRACTION_15'],
        kidTip: 'REPLACE_KID_TIP_7',
      },
    ],
    funFacts: ['REPLACE_FUN_FACT_7', 'REPLACE_FUN_FACT_8', 'REPLACE_FUN_FACT_9'],
    safetyNote: 'REPLACE_SAFETY_NOTE_3',
  },
  // Add more lines as needed for your city
];

// Educational content about the transit system
export const transitEducationalContent = {
  express_vs_local: {
    title: 'Express vs Local Service',
    local_explanation: 'REPLACE_LOCAL_EXPLANATION', // e.g., "Local trains stop at every station"
    express_explanation: 'REPLACE_EXPRESS_EXPLANATION', // e.g., "Express trains skip some stations to go faster"
    kid_tip: 'REPLACE_EXPRESS_KID_TIP', // e.g., "Check the map to see which stations express trains skip"
  },
  directions: {
    title: 'Understanding Directions',
    direction_1: 'REPLACE_DIRECTION_1', // e.g., "Northbound", "Uptown", "Inbound"
    direction_1_explanation: 'REPLACE_DIRECTION_1_EXPLANATION',
    direction_2: 'REPLACE_DIRECTION_2', // e.g., "Southbound", "Downtown", "Outbound"
    direction_2_explanation: 'REPLACE_DIRECTION_2_EXPLANATION',
    kid_tip: 'REPLACE_DIRECTIONS_KID_TIP',
  },
  transfers: {
    title: 'How to Transfer Between Lines',
    explanation: 'REPLACE_TRANSFER_EXPLANATION',
    steps: ['REPLACE_TRANSFER_STEP_1', 'REPLACE_TRANSFER_STEP_2', 'REPLACE_TRANSFER_STEP_3'],
    kid_tip: 'REPLACE_TRANSFER_KID_TIP',
  },
  how_trains_work: {
    title: 'How Trains Work',
    power_source: 'REPLACE_POWER_SOURCE', // e.g., "Electric from overhead wires"
    signal_system: 'REPLACE_SIGNAL_SYSTEM', // e.g., "Computers control train speeds"
    control_center: 'REPLACE_CONTROL_CENTER', // e.g., "A control room watches all trains"
    kid_tip: 'REPLACE_HOW_TRAINS_WORK_KID_TIP',
  },
};

// Map line IDs to their colors for easy reference
export const transitLineColors: Record<string, string> = {
  REPLACE_LINE_ID_1: '#FF0000',
  REPLACE_LINE_ID_2: '#0000FF',
  REPLACE_LINE_ID_3: '#00FF00',
  // Add all your line IDs and colors here
};

/*
 * EXAMPLE CONFIGURATIONS FOR DIFFERENT CITIES:
 *
 * LONDON UNDERGROUND:
 * {
 *   id: "central",
 *   name: "Central Line",
 *   color: "#E32017",
 *   kidFriendlyName: "The Red Line",
 *   description: "Runs from west London through the city center to the east",
 *   express: false,
 *   terminalStations: ["West Ruislip", "Epping"],
 *   popularStops: [
 *     {
 *       station: "Oxford Circus",
 *       attractions: ["Oxford Street Shopping", "Regent Street", "BBC Broadcasting House"],
 *       kidTip: "One of the busiest stations - hold hands tight!"
 *     }
 *   ]
 * }
 *
 * TOKYO METRO:
 * {
 *   id: "yamanote",
 *   name: "Yamanote Line",
 *   color: "#9ACD32",
 *   kidFriendlyName: "The Green Circle Line",
 *   description: "A loop line that goes around central Tokyo",
 *   express: false,
 *   terminalStations: ["Loop Line - No Terminals"],
 *   popularStops: [
 *     {
 *       station: "Shibuya",
 *       attractions: ["Shibuya Crossing", "Hachiko Dog Statue", "Shopping Centers"],
 *       kidTip: "Famous for the busiest pedestrian crossing in the world!"
 *     }
 *   ]
 * }
 *
 * PARIS METRO:
 * {
 *   id: "ligne-1",
 *   name: "Ligne 1",
 *   color: "#FFCD00",
 *   kidFriendlyName: "The Yellow Line",
 *   description: "Crosses Paris from east to west through major attractions",
 *   express: false,
 *   terminalStations: ["Château de Vincennes", "Pont de Neuilly"],
 *   popularStops: [
 *     {
 *       station: "Louvre-Rivoli",
 *       attractions: ["Louvre Museum", "Tuileries Garden", "Seine River"],
 *       kidTip: "Home to the famous Mona Lisa painting!"
 *     }
 *   ]
 * }
 */
