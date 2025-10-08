// Comprehensive MTA Subway Line Information for Kids
export type SubwayLine = {
  id: string;
  name: string;
  color: string;
  kidFriendlyName: string;
  description: string;
  express: boolean;
  terminalStations: string[];
  popularStops: {
    station: string;
    attractions: string[];
    kidTip: string;
  }[];
  funFacts: string[];
  safetyNote: string;
};

export const mtaSubwayLines: SubwayLine[] = [
  // IRT Lines (Numbered)
  {
    id: '1',
    name: '1 Train',
    color: '#EE352E',
    kidFriendlyName: 'The Red Line to the West Side',
    description: 'Runs along the west side of Manhattan from the Bronx to Brooklyn',
    express: false,
    terminalStations: ['Van Cortlandt Park-242nd St', 'South Ferry'],
    popularStops: [
      {
        station: 'Times Sq-42nd St',
        attractions: ['Times Square', 'Broadway Shows', 'M&M Store'],
        kidTip: 'This is one of the busiest stations - hold hands tight!',
      },
      {
        station: '79th St',
        attractions: ['American Museum of Natural History', 'Planetarium'],
        kidTip: 'Perfect stop for seeing dinosaurs and space shows',
      },
      {
        station: '14th St-8th Av',
        attractions: ['High Line Park', 'Chelsea Market'],
        kidTip: 'Walk on the elevated park built on old train tracks',
      },
    ],
    funFacts: [
      'The 1 train is the oldest subway line in NYC!',
      'It goes all the way from the Bronx to the tip of Manhattan',
      'The South Ferry station was rebuilt after Hurricane Sandy',
    ],
    safetyNote:
      "This line can get very crowded during rush hours - wait for the next train if it's too full",
  },
  {
    id: '4',
    name: '4 Train',
    color: '#00933C',
    kidFriendlyName: 'The Green Express to the East Side',
    description: 'Express train that runs along the east side of Manhattan',
    express: true,
    terminalStations: ['Woodlawn', 'Crown Hts-Utica Av'],
    popularStops: [
      {
        station: 'Grand Central-42nd St',
        attractions: ['Grand Central Terminal', 'Chrysler Building'],
        kidTip: 'Look up at the beautiful ceiling with painted stars!',
      },
      {
        station: 'Brooklyn Bridge-City Hall',
        attractions: ['Brooklyn Bridge', 'South Street Seaport'],
        kidTip: 'Walk across the famous bridge for amazing views',
      },
      {
        station: '161st St-Yankee Stadium',
        attractions: ['Yankee Stadium', 'Baseball games'],
        kidTip: 'Home of the New York Yankees baseball team!',
      },
    ],
    funFacts: [
      'This is an express train, so it skips some stops to go faster',
      'It connects to Yankee Stadium in the Bronx',
      'The train runs on the east side of Manhattan',
    ],
    safetyNote: 'Express trains go fast and make fewer stops - make sure you know your stop!',
  },
  {
    id: '6',
    name: '6 Train',
    color: '#00933C',
    kidFriendlyName: 'The Green Local to the East Side',
    description: 'Local train serving the east side of Manhattan and the Bronx',
    express: false,
    terminalStations: ['Pelham Bay Park', 'Brooklyn Bridge-City Hall'],
    popularStops: [
      {
        station: '59th St',
        attractions: ['Central Park', 'Fifth Avenue shopping'],
        kidTip: 'Great spot to enter Central Park from the east side',
      },
      {
        station: 'Union Sq-14th St',
        attractions: ['Union Square Park', 'Farmers Market'],
        kidTip: 'Check out the farmers market and street performers',
      },
      {
        station: 'Canal St',
        attractions: ['Chinatown', 'Little Italy'],
        kidTip: 'Try delicious dumplings and see colorful decorations',
      },
    ],
    funFacts: [
      'The 6 train is a local train, so it stops at every station',
      'It has the most stations of any single subway line',
      'Some 6 trains are shorter with only 5 cars instead of 10',
    ],
    safetyNote: 'Watch for the <6> express service during rush hours - it skips some stops',
  },

  // IND/BMT Lines (Letters)
  {
    id: 'A',
    name: 'A Train',
    color: '#0039A6',
    kidFriendlyName: 'The Blue Express to Far Away Places',
    description: 'Long express line from northern Manhattan to Queens and Brooklyn',
    express: true,
    terminalStations: ['Inwood-207th St', 'Far Rockaway-Mott Av'],
    popularStops: [
      {
        station: '59th St-Columbus Circle',
        attractions: ['Central Park', 'Time Warner Center'],
        kidTip: 'Great entrance to Central Park and lots of shops',
      },
      {
        station: 'W 4th St-Washington Sq',
        attractions: ['Washington Square Park', 'NYU area'],
        kidTip: 'See the famous arch and street musicians',
      },
      {
        station: 'High St-Brooklyn Bridge',
        attractions: ['Brooklyn Bridge', 'DUMBO neighborhood'],
        kidTip: 'Amazing views of Manhattan from Brooklyn side',
      },
    ],
    funFacts: [
      'The A train inspired a famous jazz song by Duke Ellington',
      "It's one of the longest subway routes in the system",
      'Goes all the way to the beach at Far Rockaway!',
    ],
    safetyNote:
      "This train takes a long time end-to-end - make sure you're going the right direction",
  },
  {
    id: 'L',
    name: 'L Train',
    color: '#A7A9AC',
    kidFriendlyName: 'The Silver Crosstown Train',
    description: 'The only train that runs crosstown (east-west) in Manhattan',
    express: false,
    terminalStations: ['8th Av', 'Canarsie-Rockaway Pkwy'],
    popularStops: [
      {
        station: '8th Av',
        attractions: ['High Line', 'Chelsea Market', 'Meatpacking District'],
        kidTip: 'Walk the High Line elevated park from here',
      },
      {
        station: 'Union Sq-14th St',
        attractions: ['Union Square', 'Strand Bookstore'],
        kidTip: 'Great place to transfer to other trains',
      },
      {
        station: '1st Av',
        attractions: ['East Village', 'Tompkins Square Park'],
        kidTip: 'Fun neighborhood with lots of small parks',
      },
    ],
    funFacts: [
      'The L is the only train that goes straight across Manhattan',
      'It connects Manhattan to trendy neighborhoods in Brooklyn',
      'The train was completely rebuilt with new technology',
    ],
    safetyNote: "This train gets very crowded because it's the only crosstown option",
  },
  {
    id: 'N',
    name: 'N Train',
    color: '#FCCC0A',
    kidFriendlyName: 'The Yellow Train to Queens and Brooklyn',
    description: 'Connects Queens, Manhattan, and Brooklyn with some express service',
    express: true,
    terminalStations: ['Astoria-Ditmars Blvd', 'Coney Island-Stillwell Av'],
    popularStops: [
      {
        station: 'Times Sq-42nd St',
        attractions: ['Times Square', 'Theater District'],
        kidTip: 'The heart of the city with bright lights everywhere',
      },
      {
        station: 'Union Sq-14th St',
        attractions: ['Union Square Park', 'Shopping'],
        kidTip: 'Great place to people-watch and see street art',
      },
      {
        station: 'Coney Island-Stillwell Av',
        attractions: ['Coney Island Beach', 'Luna Park', 'Aquarium'],
        kidTip: 'The beach, amusement park, and hot dogs all in one place!',
      },
    ],
    funFacts: [
      'The N train goes to Coney Island where you can ride roller coasters',
      'It crosses the Manhattan Bridge with great views',
      'Connects three different boroughs',
    ],
    safetyNote: 'Hold on tight when crossing the Manhattan Bridge - it can be windy!',
  },
  {
    id: 'Q',
    name: 'Q Train',
    color: '#FCCC0A',
    kidFriendlyName: 'The Yellow Train to Brooklyn',
    description: 'Connects Manhattan to Brooklyn via the Manhattan Bridge',
    express: true,
    terminalStations: ['96th St-2nd Av', 'Coney Island-Stillwell Av'],
    popularStops: [
      {
        station: '57th St-7th Av',
        attractions: ['Carnegie Hall', 'Central Park South'],
        kidTip: 'Famous concert hall where the best musicians play',
      },
      {
        station: 'DeKalb Av',
        attractions: ['Fort Greene Park', 'Brooklyn Academy of Music'],
        kidTip: 'Nice park with great views of Manhattan',
      },
      {
        station: 'Prospect Park',
        attractions: ['Prospect Park', 'Brooklyn Museum', 'Brooklyn Botanic Garden'],
        kidTip: "Brooklyn's version of Central Park with a great zoo",
      },
    ],
    funFacts: [
      'The Q train crosses the Manhattan Bridge just like the N train',
      "It serves some of Brooklyn's best cultural attractions",
      'Recently extended to the Upper East Side',
    ],
    safetyNote: 'This train shares tracks with other lines - check the front of the train',
  },
];

// Color mapping for easy reference
export const subwayLineColors: Record<string, string> = {
  '1': '#EE352E',
  '2': '#EE352E',
  '3': '#EE352E',
  '4': '#00933C',
  '5': '#00933C',
  '6': '#00933C',
  '7': '#B933AD',
  A: '#0039A6',
  C: '#0039A6',
  E: '#0039A6',
  B: '#FF6319',
  D: '#FF6319',
  F: '#FF6319',
  M: '#FF6319',
  G: '#6CBE45',
  J: '#996633',
  Z: '#996633',
  L: '#A7A9AC',
  N: '#FCCC0A',
  Q: '#FCCC0A',
  R: '#FCCC0A',
  W: '#FCCC0A',
  S: '#808183',
};

// Kid-friendly explanations of subway concepts
export const subwayEducationalContent = {
  express_vs_local: {
    title: 'Express vs Local Trains',
    explanation:
      'Express trains are like school buses that only stop at main stops to go faster. Local trains are like regular buses that stop at every single stop along the way.',
    kidTip:
      "If you're going far, express trains save time. If you're going somewhere close, local trains might be better.",
  },
  transfers: {
    title: 'How to Transfer Between Trains',
    explanation:
      "Sometimes you need to take two different trains to get where you're going, like switching from a bike to a scooter. Look for signs that show which trains you can connect to.",
    kidTip:
      "Follow the signs with arrows and train symbols. Don't be afraid to ask MTA workers for help!",
  },
  directions: {
    title: 'Uptown vs Downtown',
    explanation:
      "Uptown means going north (toward the Bronx), and Downtown means going south (toward Brooklyn). It's like thinking of the city as a big hill - up toward the top, down toward the bottom.",
    kidTip:
      "Look at the signs on the platform - they'll say 'Uptown' or 'Downtown' with the neighborhoods you're heading toward.",
  },
  payment: {
    title: 'How to Pay for the Subway',
    explanation:
      "You can use a MetroCard (plastic card) or OMNY (tap your phone or card). It's like paying for a ride at an amusement park.",
    kidTip:
      'Let the adult handle the payment, but you can help by tapping the card or phone on the round reader.',
  },
};
