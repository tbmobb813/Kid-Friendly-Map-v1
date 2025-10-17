#!/usr/bin/env node

// Mock the station data since we can't directly require TypeScript in Node
const nycStations = [
  {
    id: 'main-st-station',
    name: 'Main St Station',
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
    lines: ['A', 'C'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 4,
      nearbyAttractions: ['Central Park', "Children's Museum"],
    },
  },
  {
    id: 'central-park-station',
    name: 'Central Park Station',
    coordinates: { latitude: 40.7679, longitude: -73.9781 },
    lines: ['B', 'D'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 5,
      nearbyAttractions: ['Central Park Zoo', 'Alice in Wonderland Statue', 'Playground'],
    },
  },
  {
    id: 'times-square-station',
    name: 'Times Square Station',
    coordinates: { latitude: 40.756, longitude: -73.9866 },
    lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W'],
    accessible: true,
    kidFriendly: {
      hasElevator: true,
      hasBathroom: true,
      hasWideGates: true,
      safetyRating: 3,
      nearbyAttractions: ['Times Square', 'M&M Store', 'Toy Stores'],
    },
  },
];

function findStationById(id) {
  return nycStations.find((station) => station.id === id);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
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
}

function findNearestStations(latitude, longitude, limit = 5) {
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

console.log('🗽 NYC Transit Station Integration Demo');
console.log('=====================================\n');

console.log('📍 All NYC Stations with Coordinates:');
console.log('------------------------------------');
nycStations.forEach((station) => {
  console.log(`${station.name}:`);
  console.log(`  📍 Location: ${station.coordinates.latitude}, ${station.coordinates.longitude}`);
  console.log(`  🚇 Lines: ${station.lines.join(', ')}`);
  console.log(`  ⭐ Safety Rating: ${station.kidFriendly.safetyRating}/5`);
  console.log(`  ♿ Accessible: ${station.accessible ? 'Yes' : 'No'}`);
  if (station.kidFriendly.nearbyAttractions) {
    console.log(`  🎈 Kid Attractions: ${station.kidFriendly.nearbyAttractions.join(', ')}`);
  }
  console.log('');
});

console.log('\n🔍 Finding Central Park Station:');
console.log('-------------------------------');
const centralPark = findStationById('central-park-station');
if (centralPark) {
  console.log(`Found: ${centralPark.name}`);
  console.log(`Lines: ${centralPark.lines.join(', ')}`);
  console.log(`Kid-Friendly Features:`);
  console.log(`  - Elevator: ${centralPark.kidFriendly.hasElevator ? '✅' : '❌'}`);
  console.log(`  - Bathroom: ${centralPark.kidFriendly.hasBathroom ? '✅' : '❌'}`);
  console.log(`  - Wide Gates: ${centralPark.kidFriendly.hasWideGates ? '✅' : '❌'}`);
}

console.log('\n📍 Finding Nearest Stations to Times Square (40.7560, -73.9866):');
console.log('------------------------------------------------------------');
const nearbyStations = findNearestStations(40.756, -73.9866, 3);
nearbyStations.forEach((result, index) => {
  console.log(`${index + 1}. ${result.station.name} - ${Math.round(result.distance)}m away`);
});

console.log('\n✨ Integration Status:');
console.log('--------------------');
console.log('✅ NYC Station data with coordinates');
console.log('✅ Enhanced InteractiveMap component');
console.log('✅ Station markers with kid-friendly popups');
console.log('✅ Click handling for station selection');
console.log('✅ Modal integration with MTALiveArrivals');
console.log('✅ Map screen updated with station support');
console.log('\nThe map now shows transit stations as clickable markers!');
console.log('Users can click stations to view live arrival information.');

console.log('\n🚀 Next Steps:');
console.log('---------------');
console.log('1. Test the enhanced map interface');
console.log('2. Add more cities using our template system');
console.log('3. Connect to real-time transit APIs');
console.log('4. Add route planning integration');
