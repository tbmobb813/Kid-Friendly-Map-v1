/**
 * City Bus Routes Template
 *
 * Template for creating bus route information for any city.
 * Based on the NYC bus system but adaptable to any bus transit system.
 *
 * INSTRUCTIONS:
 * 1. Copy this file to config/transit-data/yourCity-bus-routes.ts
 * 2. Replace placeholder values with your city's actual bus information
 * 3. Update route numbers, descriptions, and popular stops
 * 4. Add or remove routes as needed for your city
 * 5. Customize educational content for local bus features
 */

export type BusRoute = {
  id: string; // Route identifier (e.g., "1", "A", "RedLine")
  name: string; // Full route name (e.g., "Route 1 - Downtown", "Red Line Express")
  type: 'local' | 'express' | 'rapid' | 'limited'; // Type of bus service
  area: string; // Area served (e.g., "Downtown", "North Side", "City Center")
  description: string; // Brief description of the route
  kidFriendlyDescription: string; // Simple explanation for kids
  popularStops: string[]; // List of important stops
  connectsTo: string[]; // Rail/metro lines it connects to
  funFacts: string[]; // Interesting facts about this route
  safetyTips: string[]; // Safety information for this route
};

export const cityBusRoutes: BusRoute[] = [
  {
    id: 'REPLACE_ROUTE_ID_1', // e.g., "1", "A", "RedLine"
    name: 'REPLACE_ROUTE_NAME_1', // e.g., "Route 1 - City Center"
    type: 'local', // Options: "local", "express", "rapid", "limited"
    area: 'REPLACE_AREA_1', // e.g., "Downtown", "City Center"
    description: 'REPLACE_DESCRIPTION_1', // e.g., "Runs along Main Street through downtown"
    kidFriendlyDescription: 'REPLACE_KID_DESCRIPTION_1', // e.g., "The bus that goes to all the shops downtown"
    popularStops: [
      'REPLACE_STOP_1', // e.g., "Central Station"
      'REPLACE_STOP_2', // e.g., "City Hall"
      'REPLACE_STOP_3', // e.g., "Main Library"
      'REPLACE_STOP_4', // e.g., "Shopping Center"
      'REPLACE_STOP_5', // e.g., "University"
    ],
    connectsTo: ['REPLACE_CONNECTS_1', 'REPLACE_CONNECTS_2'], // e.g., ["Red Line", "Blue Line"]
    funFacts: [
      'REPLACE_FUN_FACT_1', // e.g., "This route has been running for 50 years"
      'REPLACE_FUN_FACT_2', // e.g., "It passes by 3 different parks"
      'REPLACE_FUN_FACT_3', // e.g., "The longest route in the city"
    ],
    safetyTips: [
      'REPLACE_SAFETY_TIP_1', // e.g., "This route can get crowded during school hours"
      'REPLACE_SAFETY_TIP_2', // e.g., "Hold on tight - this route has steep hills"
      'REPLACE_SAFETY_TIP_3', // e.g., "Watch for bike lanes at some stops"
    ],
  },
  {
    id: 'REPLACE_ROUTE_ID_2',
    name: 'REPLACE_ROUTE_NAME_2',
    type: 'express', // Express route example
    area: 'REPLACE_AREA_2',
    description: 'REPLACE_DESCRIPTION_2',
    kidFriendlyDescription: 'REPLACE_KID_DESCRIPTION_2',
    popularStops: ['REPLACE_STOP_6', 'REPLACE_STOP_7', 'REPLACE_STOP_8'],
    connectsTo: ['REPLACE_CONNECTS_3'],
    funFacts: ['REPLACE_FUN_FACT_4', 'REPLACE_FUN_FACT_5'],
    safetyTips: ['REPLACE_SAFETY_TIP_4', 'REPLACE_SAFETY_TIP_5'],
  },
  {
    id: 'REPLACE_ROUTE_ID_3',
    name: 'REPLACE_ROUTE_NAME_3',
    type: 'rapid', // Rapid transit bus example
    area: 'REPLACE_AREA_3',
    description: 'REPLACE_DESCRIPTION_3',
    kidFriendlyDescription: 'REPLACE_KID_DESCRIPTION_3',
    popularStops: ['REPLACE_STOP_9', 'REPLACE_STOP_10', 'REPLACE_STOP_11'],
    connectsTo: ['REPLACE_CONNECTS_4', 'REPLACE_CONNECTS_5'],
    funFacts: ['REPLACE_FUN_FACT_6', 'REPLACE_FUN_FACT_7'],
    safetyTips: ['REPLACE_SAFETY_TIP_6', 'REPLACE_SAFETY_TIP_7'],
  },
  // Add more bus routes as needed
];

export const busEducationalContent = {
  bus_types: {
    title: 'Different Types of Buses',
    explanations: {
      local: 'REPLACE_LOCAL_BUS_EXPLANATION', // e.g., "Local buses stop at every bus stop"
      express: 'REPLACE_EXPRESS_BUS_EXPLANATION', // e.g., "Express buses skip some stops"
      rapid: 'REPLACE_RAPID_BUS_EXPLANATION', // e.g., "Rapid buses have their own lanes"
      limited: 'REPLACE_LIMITED_BUS_EXPLANATION', // e.g., "Limited buses run only during busy times"
    },
    kidTip: 'REPLACE_BUS_TYPES_KID_TIP', // e.g., "Look at the front of the bus to see where it's going"
  },
  how_to_ride: {
    title: 'How to Ride the Bus',
    steps: [
      'REPLACE_STEP_1', // e.g., "Wait at the bus stop behind the yellow line"
      'REPLACE_STEP_2', // e.g., "Let people get off before you get on"
      'REPLACE_STEP_3', // e.g., "Pay your fare or show your pass"
      'REPLACE_STEP_4', // e.g., "Find a seat or hold onto a rail"
      'REPLACE_STEP_5', // e.g., "Press the button when you want to get off"
      'REPLACE_STEP_6', // e.g., "Exit through the back doors"
    ],
    kidTip: 'REPLACE_HOW_TO_RIDE_KID_TIP',
  },
  bus_features: {
    title: 'Cool Bus Features',
    features: [
      'REPLACE_FEATURE_1', // e.g., "Wheelchair lifts help people with disabilities"
      'REPLACE_FEATURE_2', // e.g., "Some buses can 'kneel' to make boarding easier"
      'REPLACE_FEATURE_3', // e.g., "Digital signs show the next stop"
      'REPLACE_FEATURE_4', // e.g., "Many buses have bike racks on the front"
      'REPLACE_FEATURE_5', // e.g., "Some buses are electric and very quiet"
      'REPLACE_FEATURE_6', // e.g., "Air conditioning keeps everyone cool"
    ],
    kidTip: 'REPLACE_BUS_FEATURES_KID_TIP',
  },
  bus_etiquette: {
    title: 'How to Be Polite on the Bus',
    rules: [
      'REPLACE_ETIQUETTE_RULE_1', // e.g., "Offer your seat to elderly or pregnant passengers"
      'REPLACE_ETIQUETTE_RULE_2', // e.g., "Keep your voice down so others can rest"
      'REPLACE_ETIQUETTE_RULE_3', // e.g., "Don't put your feet on the seats"
      'REPLACE_ETIQUETTE_RULE_4', // e.g., "Keep backpacks in front so they don't hit people"
      'REPLACE_ETIQUETTE_RULE_5', // e.g., "Say 'excuse me' when you need to get by"
      'REPLACE_ETIQUETTE_RULE_6', // e.g., "Thank the driver when you get off"
    ],
    kidTip: 'REPLACE_ETIQUETTE_KID_TIP',
  },
  payment_methods: {
    title: 'How to Pay for Your Bus Ride',
    methods: [
      'REPLACE_PAYMENT_METHOD_1', // e.g., "Transit card (tap when you get on)"
      'REPLACE_PAYMENT_METHOD_2', // e.g., "Mobile app (show QR code to driver)"
      'REPLACE_PAYMENT_METHOD_3', // e.g., "Contactless payment (tap your phone or card)"
      'REPLACE_PAYMENT_METHOD_4', // e.g., "Exact change (coins only, no change given)"
    ],
    child_fare_info: 'REPLACE_CHILD_FARE_INFO', // e.g., "Children under 6 ride free with an adult"
    kidTip: 'REPLACE_PAYMENT_KID_TIP',
  },
};

// Bus stop accessibility information
export const busAccessibilityInfo = {
  wheelchair_accessible: 'REPLACE_WHEELCHAIR_INFO', // e.g., "All city buses are wheelchair accessible"
  audio_announcements: 'REPLACE_AUDIO_INFO', // e.g., "Buses announce stops for people who can't see well"
  priority_seating: 'REPLACE_PRIORITY_SEATING_INFO', // e.g., "Front seats are for elderly and disabled passengers"
  stroller_friendly: 'REPLACE_STROLLER_INFO', // e.g., "Strollers welcome - fold if bus is crowded"
  service_animals: 'REPLACE_SERVICE_ANIMAL_INFO', // e.g., "Service animals are always welcome"
  stop_accessibility: 'REPLACE_STOP_ACCESSIBILITY_INFO', // e.g., "Most bus stops have shelters and benches"
};

// Information about different areas of the city served by buses
export const cityAreas = {
  REPLACE_AREA_1: {
    description: 'REPLACE_AREA_1_DESCRIPTION',
    keyDestinations: ['REPLACE_DESTINATION_1', 'REPLACE_DESTINATION_2'],
    kidFriendlySpots: ['REPLACE_KID_SPOT_1', 'REPLACE_KID_SPOT_2'],
  },
  REPLACE_AREA_2: {
    description: 'REPLACE_AREA_2_DESCRIPTION',
    keyDestinations: ['REPLACE_DESTINATION_3', 'REPLACE_DESTINATION_4'],
    kidFriendlySpots: ['REPLACE_KID_SPOT_3', 'REPLACE_KID_SPOT_4'],
  },
  REPLACE_AREA_3: {
    description: 'REPLACE_AREA_3_DESCRIPTION',
    keyDestinations: ['REPLACE_DESTINATION_5', 'REPLACE_DESTINATION_6'],
    kidFriendlySpots: ['REPLACE_KID_SPOT_5', 'REPLACE_KID_SPOT_6'],
  },
};

/*
 * EXAMPLE CONFIGURATIONS FOR DIFFERENT CITIES:
 *
 * LONDON BUSES:
 * {
 *   id: "73",
 *   name: "Route 73 - Victoria to Stoke Newington",
 *   type: "local",
 *   area: "Central & North London",
 *   description: "Runs from Victoria through King's Cross to Stoke Newington",
 *   kidFriendlyDescription: "The red double-decker bus that goes through the city center",
 *   popularStops: ["Victoria Station", "Oxford Street", "King's Cross", "Angel"],
 *   connectsTo: ["Central Line", "Northern Line", "Piccadilly Line"],
 *   funFacts: ["Famous red double-decker buses", "Some buses are over 60 years old design"]
 * }
 *
 * SAN FRANCISCO MUNI:
 * {
 *   id: "38",
 *   name: "38 Geary",
 *   type: "rapid",
 *   area: "Richmond & Downtown",
 *   description: "Runs from the Richmond through downtown to the Transbay Terminal",
 *   kidFriendlyDescription: "The busy bus that goes to the beach and downtown",
 *   popularStops: ["Ocean Beach", "Geary & Fillmore", "Union Square", "Transbay Terminal"],
 *   connectsTo: ["BART", "Muni Metro"],
 *   funFacts: ["Goes all the way to the Pacific Ocean", "One of the busiest routes in the city"]
 * }
 *
 * TOKYO BUSES:
 * {
 *   id: "都01",
 *   name: "都01 - Shibuya to Tokyo Station",
 *   type: "local",
 *   area: "Central Tokyo",
 *   description: "Connects major areas in central Tokyo",
 *   kidFriendlyDescription: "The bus that connects the busiest train stations",
 *   popularStops: ["Shibuya", "Roppongi", "Imperial Palace", "Tokyo Station"],
 *   connectsTo: ["JR Yamanote Line", "Tokyo Metro"],
 *   funFacts: ["Passes by the Imperial Palace", "Very punctual - usually on time to the minute"]
 * }
 */
