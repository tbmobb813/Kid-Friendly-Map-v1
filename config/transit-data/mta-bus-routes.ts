// MTA Bus Information for Kids
export type BusRoute = {
  id: string;
  name: string;
  type: 'local' | 'express' | 'select' | 'limited';
  borough: string;
  description: string;
  kidFriendlyDescription: string;
  popularStops: string[];
  connectsTo: string[]; // Subway lines it connects to
  funFacts: string[];
  safetyTips: string[];
};

export const mtaBusRoutes: BusRoute[] = [
  {
    id: 'M15',
    name: 'M15 - 1st/2nd Avs',
    type: 'select',
    borough: 'Manhattan',
    description: 'Runs along 1st and 2nd Avenues on the East Side',
    kidFriendlyDescription: 'The blue bus that goes up and down the east side of Manhattan',
    popularStops: [
      'East Houston St/2nd Av',
      '14th St/1st Av',
      '23rd St/1st Av',
      '42nd St/1st Av',
      '57th St/2nd Av',
    ],
    connectsTo: ['L', '6', 'N', 'Q', 'R', 'W'],
    funFacts: [
      'This bus runs on dedicated bus lanes to avoid traffic',
      'It connects to many subway lines along the way',
      'The Select Bus Service means faster trips with fewer stops',
    ],
    safetyTips: [
      'Pay before you get on the bus at the machine on the sidewalk',
      'Show your receipt to the driver',
      'Use the back door to exit',
    ],
  },
  {
    id: 'M42',
    name: 'M42 - 42nd St Crosstown',
    type: 'local',
    borough: 'Manhattan',
    description: 'Crosstown bus along 42nd Street',
    kidFriendlyDescription: 'The bus that goes straight across 42nd Street from east to west',
    popularStops: [
      'Port Authority Bus Terminal',
      'Times Square',
      'Grand Central Terminal',
      'United Nations',
    ],
    connectsTo: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S', '4', '5', '6'],
    funFacts: [
      'This bus connects two of the biggest transportation hubs in NYC',
      'It passes through Times Square, one of the most famous places in the world',
      'The route goes past the United Nations building',
    ],
    safetyTips: [
      'This bus can get very crowded near Times Square',
      'Hold onto the rails when the bus starts and stops',
      'Keep your belongings close in crowded areas',
    ],
  },
  {
    id: 'B46',
    name: 'B46 - Utica Av',
    type: 'select',
    borough: 'Brooklyn',
    description: 'Major north-south route in Brooklyn along Utica Avenue',
    kidFriendlyDescription: 'The busy bus that goes up and down through the heart of Brooklyn',
    popularStops: ['Kings Plaza', 'Brooklyn College', 'Prospect Park', 'Eastern Parkway'],
    connectsTo: ['2', '5', 'Q', 'B'],
    funFacts: [
      'One of the busiest bus routes in all of NYC',
      'Connects many different Brooklyn neighborhoods',
      'Passes by Brooklyn College and Prospect Park',
    ],
    safetyTips: [
      'This bus gets very full during school hours',
      'Wait for people to get off before getting on',
      'Move to the back of the bus to make room for others',
    ],
  },
  {
    id: 'Bx6',
    name: 'Bx6 - Hunts Point/Westchester Av',
    type: 'local',
    borough: 'Bronx',
    description: 'Connects the Bronx Hub with Hunts Point and Parkchester',
    kidFriendlyDescription: 'The Bronx bus that connects shopping areas and neighborhoods',
    popularStops: ['3rd Av-149th St (Hub)', 'Hunts Point Av', 'Westchester Sq', 'Parkchester'],
    connectsTo: ['6', '2', '5'],
    funFacts: [
      'The Hub is one of the busiest areas in the Bronx',
      'This bus connects to lots of shopping and restaurants',
      'Parkchester has a famous circle of apartment buildings',
    ],
    safetyTips: [
      'The Hub area can be very busy - stay close to your adult',
      "Check the front of the bus to make sure it's going your direction",
      'Some buses have bike racks on the front',
    ],
  },
  {
    id: 'Q58',
    name: 'Q58 - Corona/Flushing',
    type: 'local',
    borough: 'Queens',
    description: 'Connects Corona, Elmhurst, and Flushing in Queens',
    kidFriendlyDescription:
      'The Queens bus that goes through lots of different cultural neighborhoods',
    popularStops: [
      'Roosevelt Av/Junction Blvd',
      'Queens Blvd/Elmhurst Av',
      'Main St/Roosevelt Av',
      'Flushing-Main St',
    ],
    connectsTo: ['7', 'F', 'M', 'R'],
    funFacts: [
      'This bus goes through some of the most diverse neighborhoods in the world',
      'You can hear many different languages along this route',
      'Flushing has amazing food from all over Asia',
    ],
    safetyTips: [
      'Flushing Main Street can be very crowded',
      'The bus might get full during meal times when people go to restaurants',
      'Some stops have long lines - be patient',
    ],
  },
  {
    id: 'S53',
    name: 'S53 - Port Richmond/Woodrow',
    type: 'local',
    borough: 'Staten Island',
    description: "North-south route on Staten Island's West Side",
    kidFriendlyDescription:
      'The Staten Island bus that goes from the ferry to the southern neighborhoods',
    popularStops: ['St George Terminal', 'Port Richmond', 'West Brighton', 'Woodrow'],
    connectsTo: ['Staten Island Ferry'],
    funFacts: [
      'Staten Island buses are different from the other boroughs',
      'This bus connects to the Staten Island Ferry to Manhattan',
      'Staten Island has more parks and green space than other boroughs',
    ],
    safetyTips: [
      'Staten Island buses run less frequently than in other boroughs',
      "Check the schedule so you don't wait too long",
      'The ferry terminal can be windy - hold onto your hat!',
    ],
  },
];

export const busEducationalContent = {
  bus_types: {
    title: 'Different Types of Buses',
    explanations: {
      local: 'Local buses stop at every bus stop along the route, like a local train',
      express: 'Express buses make fewer stops and go longer distances, often between boroughs',
      select: 'Select Bus Service (SBS) buses have special lanes and you pay before getting on',
      limited: 'Limited buses skip some stops to go faster during busy times',
    },
    kidTip: "Look at the front of the bus - it will show the route number and where it's going",
  },
  how_to_ride: {
    title: 'How to Ride the Bus',
    steps: [
      'Wait at the bus stop behind the yellow line',
      'Let people get off before you get on',
      'Pay with MetroCard, OMNY, or exact change',
      'Find a seat or hold onto a rail',
      'Press the yellow strip or button when you want to get off',
      'Exit through the back doors when possible',
    ],
    kidTip: 'The driver will wait for you to sit down or hold on before starting to drive',
  },
  bus_features: {
    title: 'Cool Bus Features',
    features: [
      'Wheelchair lifts help people with disabilities get on and off',
      "Some buses 'kneel' by lowering their front end to make it easier to board",
      'Digital signs inside show the next stop',
      'Many buses have bike racks on the front',
      'Some newer buses are electric and very quiet',
      'Air conditioning keeps everyone cool in summer',
    ],
    kidTip: 'Bus drivers are trained to help everyone ride safely - they can answer questions too!',
  },
  bus_etiquette: {
    title: 'How to Be Polite on the Bus',
    rules: [
      'Offer your seat to elderly, pregnant, or disabled passengers',
      'Keep your voice down so others can rest',
      "Don't put your feet on the seats",
      "Keep your backpack in front of you so it doesn't hit people",
      "Say 'excuse me' when you need to get by someone",
      'Thank the driver when you get off',
    ],
    kidTip: 'Being polite makes the ride better for everyone!',
  },
};

// Bus stop accessibility information
export const busAccessibilityInfo = {
  wheelchair_accessible: 'All MTA buses are wheelchair accessible with special lifts',
  audio_announcements: "Buses announce stops out loud for people who can't see well",
  priority_seating: 'Front seats are reserved for elderly and disabled passengers',
  stroller_friendly: 'Buses have space for strollers - fold them if the bus is crowded',
  service_animals: 'Service animals are always welcome on buses',
};
