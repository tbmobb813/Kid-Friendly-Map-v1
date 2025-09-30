export const locationFunFacts: Record<string, string[]> = {
  "Central Park": [
    "Central Park has over 25,000 trees from 150 different species!",
    "The park is home to over 200 species of birds.",
    "Central Park was the first landscaped public park in the United States.",
    "It takes about 4 hours to walk around the entire park."
  ],
  "subway": [
    "The NYC subway system has 472 stations - more than any other transit system!",
    "The subway runs 24/7, making it one of the few systems that never closes.",
    "Some subway tunnels are over 100 years old.",
    "The longest subway ride you can take is 2 hours and 45 minutes!"
  ],
  "library": [
    "The first public library in America opened in 1833.",
    "Libraries have been around for over 4,000 years!",
    "Many libraries have secret passages and hidden rooms.",
    "The largest library in the world has over 17 million books."
  ],
  "school": [
    "The first schools were started over 4,000 years ago.",
    "School buses are yellow because that color is easiest to see.",
    "The longest school name has 58 letters!",
    "Some schools around the world are built in caves or on boats."
  ],
  "park": [
    "Parks help clean the air by absorbing pollution.",
    "The first public park was created in 1634.",
    "Parks are home to many animals that live in cities.",
    "Playing in parks helps kids learn better in school!"
  ]
};

export const transitFunFacts = [
  "The first subway was built in London in 1863 and used steam trains!",
  "Some subway systems have art galleries and museums inside stations.",
  "The deepest subway station in the world is 346 feet underground.",
  "Subway trains can go up to 55 miles per hour.",
  "The busiest subway system in the world carries 10 billion passengers per year!",
  "Some subway cars are powered by electricity from solar panels.",
  "The oldest subway car still in use is over 50 years old.",
  "Subway systems help reduce traffic and air pollution in cities."
];

export const getRandomFunFact = (category?: string): string => {
  if (category && locationFunFacts[category]) {
    const facts = locationFunFacts[category];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  
  return transitFunFacts[Math.floor(Math.random() * transitFunFacts.length)];
};
