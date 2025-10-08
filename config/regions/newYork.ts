import { RegionConfig } from '@/types/region';

export const newYorkConfig: RegionConfig = {
  id: 'nyc',
  name: 'New York City',
  country: 'United States',
  timezone: 'America/New_York',
  currency: 'USD',
  language: 'en',
  coordinates: {
    latitude: 40.7128,
    longitude: -74.006,
  },
  transitSystems: [
    {
      id: "mta-subway",
      name: "MTA Subway",
      type: "subway",
      color: "#0039A6",
      routes: [
        // IRT (Numbered Lines)
        "1", "2", "3", "4", "5", "6", "7",
        // BMT/IND (Lettered Lines)
        "A", "B", "C", "D", "E", "F", "G", "J", "L", "M", "N", "Q", "R", "W", "Z"
      ],
      // Multiple GTFS feeds for different route groups
      feedUrls: [
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l"
      ],
      agencyId: "MTA NYCT",
      apiKeyEnv: 'MTA_API_KEY',
      apiKeyHeader: 'x-api-key',
      status: "operational",
      kidFriendlyName: "The Subway",
      educationalInfo: {
        funFacts: [
          "The subway system has 472 stations - that's more than any other transit system in the world!",
          "The first subway line opened in 1904 - that's over 120 years ago!",
          "Some stations are so deep underground, they're like being in a 6-story building!",
          "The subway runs 24 hours a day, 7 days a week - it never sleeps!",
          "There are 4 different track gauges, but most use standard gauge like trains"
        ],
        safetyTips: [
          "Always hold an adult's hand on the platform",
          "Stand clear of the closing doors - they can be heavy!",
          "Let people get off the train before you get on",
          "Hold onto something when the train is moving",
          "Stay away from the yellow safety line on the platform"
        ],
        howItWorks: [
          "Trains run on electricity from a third rail",
          "The conductor announces stops and opens/closes doors",
          "Different colored lines go to different parts of the city",
          "Express trains skip some stops to go faster",
          "Local trains stop at every station"
        ]
      }
    },
    {
      id: "mta-bus",
      name: "MTA Bus",
      type: "bus",
      color: "#4285F4",
      agencyId: "MTA Bus",
      feedUrls: [
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si",
        "https://bustime.mta.info/api/siri/vehicle-monitoring.json"
      ],
      apiKeyEnv: 'MTA_API_KEY',
      apiKeyHeader: 'x-api-key',
      status: "operational",
      kidFriendlyName: "The Bus",
      educationalInfo: {
        funFacts: [
          "MTA buses are blue and white - easy to spot!",
          "There are over 4,000 buses in the fleet",
          "Buses have wheelchair lifts to help everyone ride",
          "Some buses are electric and super quiet!",
          "Bus drivers are trained to help keep everyone safe"
        ],
        safetyTips: [
          "Wait for the bus to completely stop before getting on",
          "Use the handrails when climbing the steps",
          "Sit down or hold on tight while the bus is moving",
          "Press the yellow strip or button to request your stop",
          "Let adults handle paying the fare"
        ],
        howItWorks: [
          "Buses follow set routes with numbered stops",
          "The driver opens the front door for getting on",
          "You can exit from front or back doors",
          "Route numbers tell you which bus goes where",
          "GPS helps buses stay on schedule"
        ]
      }
    },
    {
      id: "lirr",
      name: "Long Island Rail Road",
      type: "train",
      color: "#34A853",
      agencyId: "LIRR",
      feedUrls: [
        "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/lirr%2Fgtfs-lirr"
      ],
      apiKeyEnv: 'MTA_API_KEY',
      apiKeyHeader: 'x-api-key',
      status: "operational",
      kidFriendlyName: "The Long Island Railroad",
      educationalInfo: {
        funFacts: [
          "LIRR is the busiest commuter railroad in North America!",
          "It connects New York City to Long Island",
          "Some trains are double-decker - two floors of seats!",
          "The railroad has been running for over 185 years",
          "Trains can go up to 80 miles per hour"
        ],
        safetyTips: [
          "Always wait behind the yellow line on the platform",
          "Let adults help you get on and off the train",
          "Stay seated while the train is moving",
          "Keep voices quiet so others can rest",
          "Watch the gap between the train and platform"
        ],
        howItWorks: [
          "Conductors check tickets and announce stops",
          "Different branches go to different parts of Long Island",
          "Peak hours have more frequent service",
          "Electric trains are powered by overhead wires",
          "Some trains have quiet cars for peaceful travel"
        ]
      }
    },
    {
      id: "mta-bridges-tunnels",
      name: "MTA Bridges and Tunnels",
      type: "ferry",
      color: "#FF6B35",
      agencyId: "MTA B&T",
      status: "operational",
      kidFriendlyName: "Bridges and Tunnels",
      educationalInfo: {
        funFacts: [
          "The Verrazzano-Narrows Bridge is so long you can see it curve with the Earth!",
          "The Queens-Midtown Tunnel goes under the East River",
          "Some bridges open up to let tall ships pass through",
          "Bridges use cables and towers to hold up heavy cars and trucks",
          "Engineers designed these to last over 100 years"
        ],
        safetyTips: [
          "Always wear your seatbelt when crossing bridges or tunnels",
          "Let adults handle all the driving and tolls",
          "Look out the window to see amazing views from bridges",
          "Tunnels have special ventilation systems for fresh air",
          "Emergency phones are placed throughout tunnels"
        ],
        howItWorks: [
          "Electronic tolls use E-ZPass or license plate cameras",
          "Bridges expand and contract with temperature changes",
          "Tunnels have powerful fans to move air around",
          "Traffic lights help control the flow of vehicles",
          "Special trucks inspect bridges regularly for safety"
        ]
      }
    }
  ],
  emergencyNumber: '911',
  safetyTips: [
    "Always stay with a trusted adult when using public transportation",
    "Keep your MetroCard or OMNY card in a safe place",
    "Stand clear of the closing doors - wait for the next train if you're not sure",
    "Let passengers exit before boarding - it's polite and safer",
    "Hold the handrail on escalators and walk on the right side",
    "Stay behind the yellow safety line on subway platforms",
    "If you get separated, find a police officer or MTA employee in a uniform",
    "Keep your voice down on trains so others can rest",
    "Offer your seat to elderly, pregnant, or disabled passengers",
    "Never run on stairs or platforms - they can be slippery"
  ],
  funFacts: [
    "The NYC subway system has 472 stations - more than any other transit system in the world!",
    "The subway runs 24/7, making it one of the few systems that never closes.",
    "Some subway tunnels are over 100 years old - older than your great-grandparents!",
    "The longest subway ride you can take is 2 hours and 45 minutes from the Bronx to Brooklyn!",
    "Central Park has over 25,000 trees from 150 different species!",
    "The subway system moves 5.5 million people every day - that's like moving the entire population of Norway!",
    "Some subway stations are works of art with beautiful mosaics and sculptures",
    "The deepest subway station is 180 feet underground - that's like being in an 18-story building!",
    "There are abandoned subway stations that you can sometimes glimpse from moving trains",
    "The subway system has its own police force, the Transit Police, to keep everyone safe",
    "MetroCards were introduced in 1994, and now we have OMNY tap-to-pay technology",
    "The famous subway map was designed to be easy to read, with straight lines and clear colors"
  ],
  popularPlaces: [
    {
      name: "Central Park",
      category: "park",
      description: "A huge park in Manhattan with playgrounds, lakes, walking paths, and the famous Central Park Zoo! It's like a giant backyard for the whole city.",
      transitInfo: "Take the A, B, C, D trains to 59th St-Columbus Circle, or the 4, 5, 6 trains to 59th St"
    },
    {
      name: "Brooklyn Bridge",
      category: "landmark", 
      description: "A historic bridge connecting Manhattan and Brooklyn with amazing views. It has a special walkway just for people to walk across safely!",
      transitInfo: "Take the 4, 5, 6 trains to Brooklyn Bridge-City Hall station"
    },
    {
      name: "Times Square",
      category: "landmark",
      description: "A busy area with bright lights, theaters, and street performers. It's like a carnival that never stops!",
      transitInfo: "Take the N, Q, R, W, S, 1, 2, 3, 7 trains to Times Sq-42nd St"
    },
    {
      name: "Statue of Liberty",
      category: "landmark",
      description: "A giant green statue on an island that welcomes people to New York. You take a ferry boat to visit her!",
      transitInfo: "Take the 1 train to South Ferry, or the R, W trains to Whitehall St-South Ferry"
    },
    {
      name: "American Museum of Natural History",
      category: "museum",
      description: "A huge museum with dinosaur skeletons, planetarium, and exhibits about animals from around the world!",
      transitInfo: "Take the B, C trains to 81st St-Museum of Natural History"
    },
    {
      name: "Coney Island",
      category: "attraction",
      description: "A fun beach area with an amusement park, boardwalk, and the famous hot dog eating contest!",
      transitInfo: "Take the D, F, N, Q trains to Coney Island-Stillwell Av"
    },
    {
      name: "Bronx Zoo", 
      category: "zoo",
      description: "One of the largest zoos in the world with over 4,000 animals from around the globe!",
      transitInfo: "Take the 2, 5 trains to East Tremont Av-West Farms Sq, then Bx9 bus"
    },
    {
      name: "High Line",
      category: "park",
      description: "A cool park built on old elevated train tracks with gardens, art, and great views of the city!",
      transitInfo: "Take the A, C, E trains to 14th St-8th Av, or L train to 8th Av"
    },
    {
      name: "9/11 Memorial",
      category: "memorial",
      description: "A peaceful place to remember the heroes and people who helped keep New York safe. It has reflecting pools and a museum.",
      transitInfo: "Take the R, W trains to Cortlandt St, or 4, 5, 6 trains to Fulton St"
    },
    {
      name: "Children's Museum of Manhattan",
      category: "museum", 
      description: "A special museum designed just for kids with hands-on exhibits and fun learning activities!",
      transitInfo: "Take the 1 train to 79th St, or B, C trains to 81st St-Museum of Natural History"
    }
  ],
  transitApiEndpoint: 'https://api.mta.info/',
  transitApiKey: process.env.MTA_API_KEY,
  mapStyle: 'standard',
};
