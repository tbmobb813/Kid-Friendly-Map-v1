/**/**

 * City Transit Template * City Transit Template

 *  * 

 * This template provides a starting point for implementing kid-friendly transit navigation * This template provides a starting point for implementing kid-friendly transit navigation

 * for any city. Copy this file and customize the values for your specific city. * for any city. Copy this file and customize the values for your specific city.

 *  * 

 * INSTRUCTIONS: * Replace the following placeholders:

 * 1. Copy this file to config/regions/yourCityName.ts * - cityNameCamelCase: Use camelCase (e.g., newYork, london, tokyo)

 * 2. Replace 'cityNameCamelCase' with your city name in camelCase (e.g., london, tokyo, sanFrancisco) * - All string values marked with "REPLACE_"

 * 3. Replace all "REPLACE_" placeholders with actual values for your city * - All coordinate values (0.0000) with actual lat/lng

 * 4. Update coordinate values (0.0000) with real latitude/longitude * - All numeric values as appropriate

 * 5. Adjust numeric values (fares, ages, months) as appropriate for your city */

 * 6. Add or remove transit systems based on what's available in your city

 * 7. Add more popular places, foods, and cultural information as neededimport { RegionConfig } from "@/types/region";

 */

const cityNameCamelCase: RegionConfig = {

import { RegionConfig } from "@/types/region";  id: "REPLACE_CITY_ID", // e.g., "london", "tokyo", "san-francisco"

  name: "REPLACE_CITY_NAME", // e.g., "London", "Tokyo", "San Francisco"

const cityNameCamelCase: RegionConfig = {  country: "REPLACE_COUNTRY_NAME", // e.g., "United Kingdom", "Japan", "United States"

  id: "REPLACE_CITY_ID", // e.g., "london", "tokyo", "san-francisco"  

  name: "REPLACE_CITY_NAME", // e.g., "London", "Tokyo", "San Francisco"  coordinates: {

  country: "REPLACE_COUNTRY_NAME", // e.g., "United Kingdom", "Japan", "United States"    center: { lat: 0.0000, lng: 0.0000 }, // Replace with city center coordinates

      bounds: {

  coordinates: {      north: 0.0000,

    center: { lat: 0.0000, lng: 0.0000 }, // Replace with city center coordinates      south: 0.0000,

    bounds: {      east: 0.0000,

      north: 0.0000,  // Replace with actual bounds      west: 0.0000

      south: 0.0000,    }

      east: 0.0000,  },

      west: 0.0000  

    }  timezone: "REPLACE_TIMEZONE", // e.g., "Europe/London", "Asia/Tokyo"

  },  currency: {

      symbol: "YOUR_CURRENCY_SYMBOL", // e.g., "£", "¥", "$"

  timezone: "REPLACE_TIMEZONE", // e.g., "Europe/London", "Asia/Tokyo", "America/Los_Angeles"    code: "YOUR_CURRENCY_CODE", // e.g., "GBP", "JPY", "USD"

      name: "YOUR_CURRENCY_NAME" // e.g., "British Pound", "Japanese Yen", "US Dollar"

  currency: {  },

    symbol: "REPLACE_SYMBOL", // e.g., "£", "¥", "$", "€"  language: {

    code: "REPLACE_CODE", // e.g., "GBP", "JPY", "USD", "EUR"    primary: "YOUR_PRIMARY_LANGUAGE", // e.g., "en", "ja", "fr"

    name: "REPLACE_CURRENCY_NAME" // e.g., "British Pound", "Japanese Yen", "US Dollar"    supported: ["YOUR_LANGUAGE_1", "YOUR_LANGUAGE_2"] // Additional supported languages

  },  },

    

  language: {  // Transit authority information

    primary: "REPLACE_LANG_CODE", // e.g., "en", "ja", "fr", "de"  transitAuthority: {

    supported: ["REPLACE_LANG_1", "REPLACE_LANG_2"] // Additional languages    name: "YOUR_TRANSIT_AUTHORITY_NAME", // e.g., "Transport for London", "JR East", "SFMTA"

  },    shortName: "YOUR_TRANSIT_AUTHORITY_SHORT", // e.g., "TfL", "JR", "Muni"

      website: "YOUR_TRANSIT_AUTHORITY_WEBSITE", // Official website

  transitAuthority: {    phone: "YOUR_TRANSIT_AUTHORITY_PHONE", // Customer service phone

    name: "REPLACE_AUTHORITY_NAME", // e.g., "Transport for London", "SFMTA", "JR East"    kidFriendlyName: "YOUR_KID_FRIENDLY_AUTHORITY_NAME", // e.g., "London Transport", "Tokyo Trains", "City Buses"

    shortName: "REPLACE_SHORT_NAME", // e.g., "TfL", "Muni", "JR"    logo: "YOUR_LOGO_URL" // Optional logo URL

    website: "REPLACE_WEBSITE_URL",  },

    phone: "REPLACE_PHONE_NUMBER",

    kidFriendlyName: "REPLACE_KID_FRIENDLY_NAME", // e.g., "London Transport", "City Buses"  // Emergency and safety information

    logo: "REPLACE_LOGO_URL"  emergency: {

  },    police: "YOUR_EMERGENCY_POLICE", // e.g., "999", "110", "911"

    fire: "YOUR_EMERGENCY_FIRE",

  emergency: {    medical: "YOUR_EMERGENCY_MEDICAL",

    police: "REPLACE_POLICE_NUMBER", // e.g., "999", "110", "911", "112"    transitPolice: "YOUR_TRANSIT_POLICE_NUMBER",

    fire: "REPLACE_FIRE_NUMBER",    kidHelpline: "YOUR_KID_HELPLINE_NUMBER", // Local child safety helpline

    medical: "REPLACE_MEDICAL_NUMBER",    hospitals: [

    transitPolice: "REPLACE_TRANSIT_POLICE",      {

    kidHelpline: "REPLACE_KID_HELPLINE",        name: "YOUR_HOSPITAL_1_NAME",

    hospitals: [        address: "YOUR_HOSPITAL_1_ADDRESS",

      {        phone: "YOUR_HOSPITAL_1_PHONE",

        name: "REPLACE_HOSPITAL_NAME",        coordinates: { lat: 0.0000, lng: 0.0000 } // Replace with actual coordinates

        address: "REPLACE_HOSPITAL_ADDRESS",      }

        phone: "REPLACE_HOSPITAL_PHONE",      // Add more hospitals as needed

        coordinates: { lat: 0.0000, lng: 0.0000 }    ]

      }  },

      // Add more hospitals as needed

    ]  // Transit systems available in this city

  },  transitSystems: [

    {

  transitSystems: [      id: "{{SYSTEM_1_ID}}", // e.g., "subway", "underground", "metro"

    {      name: "{{SYSTEM_1_NAME}}", // e.g., "London Underground", "Tokyo Metro", "BART"

      id: "REPLACE_SYSTEM_ID", // e.g., "subway", "metro", "underground", "bus", "tram"      type: "{{SYSTEM_1_TYPE}}", // "subway", "bus", "tram", "rail", "ferry"

      name: "REPLACE_SYSTEM_NAME", // e.g., "London Underground", "Tokyo Metro", "SF Muni"      kidFriendlyName: "{{SYSTEM_1_KID_NAME}}", // e.g., "The Tube", "Underground Trains", "Subway"

      type: "subway", // Options: "subway", "bus", "tram", "rail", "ferry"      description: "{{SYSTEM_1_DESCRIPTION}}", // Brief description of the system

      kidFriendlyName: "REPLACE_KID_FRIENDLY_SYSTEM_NAME", // e.g., "The Tube", "Underground Trains"      

      description: "REPLACE_SYSTEM_DESCRIPTION",      // Educational content for kids

            educationalInfo: {

      educationalInfo: {        funFacts: [

        funFacts: [          "{{FUN_FACT_1}}", // e.g., "The London Underground is over 150 years old!"

          "REPLACE_FUN_FACT_1", // e.g., "This system is over 150 years old!"          "{{FUN_FACT_2}}", // e.g., "Some stations are deeper than Big Ben is tall!"

          "REPLACE_FUN_FACT_2", // e.g., "Some stations are deeper than skyscrapers are tall!"          "{{FUN_FACT_3}}" // Add more interesting facts

          "REPLACE_FUN_FACT_3"  // e.g., "Millions of people use this every day!"        ],

        ],        safetyTips: [

        safetyTips: [          "{{SAFETY_TIP_1}}", // e.g., "Always stand on the right side of escalators"

          "REPLACE_SAFETY_TIP_1", // e.g., "Always stand on the right side of escalators"          "{{SAFETY_TIP_2}}", // e.g., "Let people get off before you get on"

          "REPLACE_SAFETY_TIP_2", // e.g., "Let people get off before you get on"          "{{SAFETY_TIP_3}}" // Add more safety guidance

          "REPLACE_SAFETY_TIP_3"  // e.g., "Hold hands tight in crowded areas"        ],

        ],        howItWorks: [

        howItWorks: [          "{{HOW_IT_WORKS_1}}", // e.g., "Trains run on electricity from a third rail"

          "REPLACE_HOW_IT_WORKS_1", // e.g., "Trains run on electricity from special rails"          "{{HOW_IT_WORKS_2}}", // e.g., "Signals tell trains when it's safe to go"

          "REPLACE_HOW_IT_WORKS_2", // e.g., "Signals tell trains when it's safe to go"          "{{HOW_IT_WORKS_3}}" // Add more educational explanations

          "REPLACE_HOW_IT_WORKS_3"  // e.g., "Control rooms watch all the trains"        ]

        ]      },

      },

      // Fare information

      fares: {      fares: {

        adult: 2.50, // Replace with actual adult fare in local currency        adult: {{ADULT_FARE}}, // Base adult fare in local currency

        child: 0, // Replace with child fare (use 0 if children travel free)        child: {{CHILD_FARE}}, // Child fare (0 if free)

        childAgeLimit: 5, // Replace with actual age limit for child fares        childAgeLimit: {{CHILD_AGE_LIMIT}}, // Age limit for child fare

        paymentMethods: [        paymentMethods: [

          "REPLACE_PAYMENT_METHOD_1", // e.g., "Oyster Card", "Suica", "Clipper Card"          "{{PAYMENT_METHOD_1}}", // e.g., "Oyster Card", "Suica", "Clipper"

          "REPLACE_PAYMENT_METHOD_2", // e.g., "Contactless", "Mobile App"          "{{PAYMENT_METHOD_2}}", // e.g., "Contactless", "Mobile App"

          "REPLACE_PAYMENT_METHOD_3"  // e.g., "Day Pass", "Cash"          "{{PAYMENT_METHOD_3}}" // e.g., "Cash" (if accepted)

        ],        ],

        kidNote: "REPLACE_CHILD_FARE_NOTE" // e.g., "Children under 5 travel free with an adult"        kidNote: "{{CHILD_FARE_NOTE}}" // e.g., "Children under 5 travel free with an adult"

      },      },



      feedUrls: [      // Real-time data configuration

        "REPLACE_REAL_TIME_FEED_URL_1", // API endpoints for real-time data (if available)      feedUrls: [

        "REPLACE_REAL_TIME_FEED_URL_2"  // Backup or additional feeds        "{{REAL_TIME_FEED_URL_1}}", // API endpoints for real-time data

      ],        "{{REAL_TIME_FEED_URL_2}}" // Add backup or additional feeds

      ],

      accessibility: {

        wheelchairAccessible: true, // Change to false if not widely accessible      // Accessibility features

        audioAnnouncements: true, // Change based on actual availability      accessibility: {

        visualAids: true, // Change based on actual availability        wheelchairAccessible: {{WHEELCHAIR_ACCESSIBLE}}, // true/false

        elevatorAvailability: "REPLACE_ELEVATOR_INFO", // e.g., "Most stations", "Limited", "All stations"        audioAnnouncements: {{AUDIO_ANNOUNCEMENTS}}, // true/false

        accessibilityInfo: "REPLACE_ACCESSIBILITY_DETAILS",        visualAids: {{VISUAL_AIDS}}, // true/false

        kidFriendlyNote: "REPLACE_ACCESSIBILITY_KID_NOTE"        elevatorAvailability: "{{ELEVATOR_AVAILABILITY}}", // e.g., "Most stations", "Limited", "All stations"

      },        accessibilityInfo: "{{ACCESSIBILITY_INFO}}", // Additional accessibility details

        kidFriendlyNote: "{{ACCESSIBILITY_KID_NOTE}}" // Kid-friendly accessibility explanation

      serviceHours: {      },

        weekday: {

          start: "05:00", // Replace with actual service start time      // Service hours

          end: "00:30"    // Replace with actual service end time      serviceHours: {

        },        weekday: {

        weekend: {          start: "{{WEEKDAY_START}}", // e.g., "05:00"

          start: "06:00", // Weekend hours often differ          end: "{{WEEKDAY_END}}" // e.g., "00:30"

          end: "00:30"        },

        },        weekend: {

        frequency: {          start: "{{WEEKEND_START}}",

          peak: "2-3 minutes",     // Replace with actual peak frequency          end: "{{WEEKEND_END}}"

          offPeak: "5-10 minutes", // Replace with actual off-peak frequency        },

          late: "15-20 minutes"    // Replace with actual late-night frequency        frequency: {

        }          peak: "{{PEAK_FREQUENCY}}", // e.g., "2-3 minutes"

      }          offPeak: "{{OFF_PEAK_FREQUENCY}}", // e.g., "5-10 minutes"

    }          late: "{{LATE_FREQUENCY}}" // e.g., "15-20 minutes"

    // Add more transit systems (bus, tram, etc.) by copying the above structure        }

  ],      }

    }

  popularPlaces: [    // Add more transit systems (bus, tram, etc.) following the same pattern

    {  ],

      id: "REPLACE_PLACE_ID",

      name: "REPLACE_PLACE_NAME", // e.g., "Central Park", "Tower Bridge", "Golden Gate Park"  // Popular kid-friendly destinations

      category: "REPLACE_CATEGORY", // e.g., "park", "museum", "attraction", "playground"  popularPlaces: [

      coordinates: { lat: 0.0000, lng: 0.0000 },    {

      description: "REPLACE_DESCRIPTION",      id: "{{PLACE_1_ID}}",

      kidFriendlyDescription: "REPLACE_KID_DESCRIPTION",      name: "{{PLACE_1_NAME}}", // e.g., "Central Park", "Tokyo Disneyland", "Golden Gate Park"

      ageGroup: "all-ages", // Options: "all-ages", "toddlers", "school-age", "teens"      category: "{{PLACE_1_CATEGORY}}", // e.g., "park", "museum", "attraction"

            coordinates: { lat: {{PLACE_1_LAT}}, lng: {{PLACE_1_LNG}} },

      nearestStations: [      description: "{{PLACE_1_DESCRIPTION}}", // Brief description

        {      kidFriendlyDescription: "{{PLACE_1_KID_DESCRIPTION}}", // Kid-friendly explanation

          stationId: "REPLACE_STATION_ID",      ageGroup: "{{PLACE_1_AGE_GROUP}}", // e.g., "all-ages", "toddlers", "teens"

          stationName: "REPLACE_STATION_NAME",      

          lines: ["REPLACE_LINE_1", "REPLACE_LINE_2"],      // Transit access information

          walkTime: 5, // minutes      nearestStations: [

          walkDescription: "REPLACE_WALK_DESCRIPTION",        {

          accessibility: "REPLACE_WALK_ACCESSIBILITY"          stationId: "{{STATION_ID}}",

        }          stationName: "{{STATION_NAME}}",

      ],          lines: ["{{LINE_1}}", "{{LINE_2}}"],

          walkTime: {{WALK_TIME_MINUTES}}, // minutes

      activities: [          walkDescription: "{{WALK_DESCRIPTION}}", // e.g., "Short walk through the park"

        "REPLACE_ACTIVITY_1", // e.g., "Feed ducks at the pond"          accessibility: "{{WALK_ACCESSIBILITY}}" // e.g., "wheelchair accessible", "stairs required"

        "REPLACE_ACTIVITY_2", // e.g., "Play on the playground"        }

        "REPLACE_ACTIVITY_3"  // e.g., "Watch street performers"      ],

      ],

      // What kids can do here

      facilities: [      activities: [

        "REPLACE_FACILITY_1", // e.g., "Restrooms"        "{{ACTIVITY_1}}", // e.g., "Feed ducks at the pond"

        "REPLACE_FACILITY_2", // e.g., "Food vendors"        "{{ACTIVITY_2}}", // e.g., "Play on the playground"

        "REPLACE_FACILITY_3"  // e.g., "Gift shop"        "{{ACTIVITY_3}}" // e.g., "Watch street performers"

      ],      ],



      safetyNotes: [      // Practical information

        "REPLACE_SAFETY_NOTE_1", // e.g., "Stay close to adults in crowded areas"      facilities: [

        "REPLACE_SAFETY_NOTE_2"  // e.g., "Watch for cyclists on paths"        "{{FACILITY_1}}", // e.g., "Restrooms", "Food vendors", "Gift shop"

      ],        "{{FACILITY_2}}",

        "{{FACILITY_3}}"

      kidTips: [      ],

        "REPLACE_KID_TIP_1", // e.g., "Best time to visit is early morning"

        "REPLACE_KID_TIP_2"  // e.g., "Bring a jacket - it can be windy"      // Safety and tips

      ],      safetyNotes: [

        "{{SAFETY_NOTE_1}}", // e.g., "Stay close to adults in crowded areas"

      funFacts: [        "{{SAFETY_NOTE_2}}" // e.g., "Watch for cyclists on paths"

        "REPLACE_PLACE_FUN_FACT_1", // e.g., "This park is bigger than some countries!"      ],

        "REPLACE_PLACE_FUN_FACT_2"  // e.g., "The trees here are over 100 years old"

      ]      kidTips: [

    }        "{{KID_TIP_1}}", // e.g., "Best time to visit is early morning when it's quieter"

    // Add more popular places by copying the above structure        "{{KID_TIP_2}}" // e.g., "Bring a jacket - it can be windy near the water"

  ],      ],



  culturalInfo: {      // Fun facts specific to this place

    greeting: "REPLACE_GREETING", // e.g., "Hello", "Konnichiwa", "Bonjour", "Hola"      funFacts: [

    thankYou: "REPLACE_THANK_YOU", // e.g., "Thank you", "Arigato", "Merci", "Gracias"        "{{PLACE_FUN_FACT_1}}", // e.g., "This park is bigger than some countries!"

    please: "REPLACE_PLEASE",        "{{PLACE_FUN_FACT_2}}" // e.g., "The carousel horses are over 100 years old"

    excuse: "REPLACE_EXCUSE_ME",      ]

        }

    customs: [    // Add more popular places following the same pattern

      "REPLACE_CUSTOM_1", // e.g., "People queue politely and wait their turn"  ],

      "REPLACE_CUSTOM_2", // e.g., "It's polite to offer your seat to elderly people"

      "REPLACE_CUSTOM_3"  // e.g., "Eating on trains is generally okay"  // Cultural and educational information

    ],  culturalInfo: {

    greeting: "{{LOCAL_GREETING}}", // e.g., "Hello", "Konnichiwa", "Bonjour"

    localFoods: [    thankYou: "{{LOCAL_THANK_YOU}}", // e.g., "Thank you", "Arigato", "Merci"

      {    please: "{{LOCAL_PLEASE}}",

        name: "REPLACE_FOOD_NAME", // e.g., "Fish and Chips", "Sushi", "Croissant"    excuse: "{{LOCAL_EXCUSE_ME}}",

        description: "REPLACE_FOOD_DESCRIPTION",    

        whereToFind: "REPLACE_WHERE_TO_FIND" // e.g., "Street vendors", "Train stations"    // Local customs kids should know

      }    customs: [

      // Add more local foods      "{{CUSTOM_1}}", // e.g., "People queue politely and wait their turn"

    ],      "{{CUSTOM_2}}", // e.g., "It's polite to offer your seat to elderly people"

      "{{CUSTOM_3}}" // e.g., "Eating on trains is generally okay"

    historyFacts: [    ],

      "REPLACE_HISTORY_FACT_1", // e.g., "This city is over 1000 years old!"

      "REPLACE_HISTORY_FACT_2", // e.g., "The first railway here opened in 1863"    // Local foods kids might encounter

      "REPLACE_HISTORY_FACT_3"  // e.g., "Famous explorers sailed from this harbor"    localFoods: [

    ]      {

  },        name: "{{FOOD_1_NAME}}", // e.g., "Fish and Chips", "Sushi", "Croissant"

        description: "{{FOOD_1_DESCRIPTION}}", // Kid-friendly description

  climate: {        whereToFind: "{{FOOD_1_WHERE}}" // e.g., "Street vendors", "Train stations", "Cafes"

    rainyMonths: [11, 12, 1, 2], // Month numbers when rain is common (1=Jan, 12=Dec)      }

    snowyMonths: [12, 1, 2], // Month numbers when snow is possible      // Add more local foods

    hotMonths: [6, 7, 8], // Month numbers when it's very hot    ],

    coldMonths: [12, 1, 2], // Month numbers when it's very cold

        // Historical tidbits appropriate for kids

    clothingTips: {    historyFacts: [

      summer: "REPLACE_SUMMER_CLOTHING", // e.g., "Light clothes and sun hat"      "{{HISTORY_FACT_1}}", // e.g., "This city is over 1000 years old!"

      winter: "REPLACE_WINTER_CLOTHING", // e.g., "Warm coat, hat, and gloves"      "{{HISTORY_FACT_2}}", // e.g., "The oldest building here was built before America was discovered"

      rainy: "REPLACE_RAINY_CLOTHING", // e.g., "Raincoat or umbrella"      "{{HISTORY_FACT_3}}" // Add more interesting historical facts

      general: "REPLACE_GENERAL_CLOTHING" // e.g., "Comfortable walking shoes"    ]

    }  },

  }

};  // Weather and seasonal information

  climate: {

export default cityNameCamelCase;    rainyMonths: [{{RAINY_MONTHS}}], // Month numbers when rain is common

    snowyMonths: [{{SNOWY_MONTHS}}], // Month numbers when snow is possible

/*    hotMonths: [{{HOT_MONTHS}}], // Month numbers when it's very hot

 * EXAMPLE CITIES TO GET YOU STARTED:    coldMonths: [{{COLD_MONTHS}}], // Month numbers when it's very cold

 *     

 * London: {    clothingTips: {

 *   id: "london",      summer: "{{SUMMER_CLOTHING}}", // e.g., "Light clothes and sun hat"

 *   name: "London",      winter: "{{WINTER_CLOTHING}}", // e.g., "Warm coat, hat, and gloves"

 *   country: "United Kingdom",      rainy: "{{RAINY_CLOTHING}}", // e.g., "Raincoat or umbrella"

 *   center: { lat: 51.5074, lng: -0.1278 },      general: "{{GENERAL_CLOTHING}}" // e.g., "Comfortable walking shoes always recommended"

 *   timezone: "Europe/London",    }

 *   currency: { symbol: "£", code: "GBP", name: "British Pound" },  }

 *   transitAuthority: { name: "Transport for London", shortName: "TfL", kidFriendlyName: "London Transport" },};

 *   emergency: { police: "999", fire: "999", medical: "999" }

 * }export default {{CITY_NAME_CAMEL_CASE}};
 * 
 * Tokyo: {
 *   id: "tokyo",
 *   name: "Tokyo",
 *   country: "Japan",
 *   center: { lat: 35.6762, lng: 139.6503 },
 *   timezone: "Asia/Tokyo",
 *   currency: { symbol: "¥", code: "JPY", name: "Japanese Yen" },
 *   transitAuthority: { name: "JR East", shortName: "JR", kidFriendlyName: "Tokyo Trains" },
 *   emergency: { police: "110", fire: "119", medical: "119" }
 * }
 * 
 * San Francisco: {
 *   id: "san-francisco",
 *   name: "San Francisco",
 *   country: "United States",
 *   center: { lat: 37.7749, lng: -122.4194 },
 *   timezone: "America/Los_Angeles",
 *   currency: { symbol: "$", code: "USD", name: "US Dollar" },
 *   transitAuthority: { name: "SFMTA", shortName: "Muni", kidFriendlyName: "City Transit" },
 *   emergency: { police: "911", fire: "911", medical: "911" }
 * }
 */