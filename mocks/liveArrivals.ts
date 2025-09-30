import { LiveArrival } from "@/components/LiveArrivalsCard";

export const mockLiveArrivals: Record<string, LiveArrival[]> = {
  "main-st-station": [
    {
      id: "a1",
      line: "A",
      color: "#0039A6",
      destination: "Uptown - 125th St",
      arrivalTime: 1,
      platform: "1",
      type: "subway"
    },
    {
      id: "a2",
      line: "A",
      color: "#0039A6", 
      destination: "Downtown - Brooklyn",
      arrivalTime: 4,
      platform: "2",
      type: "subway"
    },
    {
      id: "c1",
      line: "C",
      color: "#00933C",
      destination: "Uptown - Washington Heights",
      arrivalTime: 7,
      platform: "1",
      type: "subway"
    },
    {
      id: "a3",
      line: "A",
      color: "#0039A6",
      destination: "Uptown - 125th St",
      arrivalTime: 12,
      platform: "1",
      type: "subway"
    }
  ],
  "central-park-station": [
    {
      id: "b1",
      line: "B",
      color: "#FF6319",
      destination: "Brighton Beach",
      arrivalTime: 0,
      platform: "1",
      type: "subway"
    },
    {
      id: "d1",
      line: "D",
      color: "#FF6319",
      destination: "Coney Island",
      arrivalTime: 3,
      platform: "1",
      type: "subway"
    },
    {
      id: "b2",
      line: "B",
      color: "#FF6319",
      destination: "Bedford Park Blvd",
      arrivalTime: 6,
      platform: "2",
      type: "subway"
    },
    {
      id: "d2",
      line: "D",
      color: "#FF6319",
      destination: "Norwood - 205th St",
      arrivalTime: 9,
      platform: "2",
      type: "subway"
    }
  ],
  "downtown-station": [
    {
      id: "e1",
      line: "E",
      color: "#0039A6",
      destination: "Jamaica Center",
      arrivalTime: 2,
      platform: "A",
      type: "train"
    },
    {
      id: "f1",
      line: "F",
      color: "#FF6319",
      destination: "Coney Island",
      arrivalTime: 5,
      platform: "B",
      type: "train"
    },
    {
      id: "e2",
      line: "E",
      color: "#0039A6",
      destination: "World Trade Center",
      arrivalTime: 8,
      platform: "A",
      type: "train"
    },
    {
      id: "f2",
      line: "F",
      color: "#FF6319",
      destination: "Forest Hills",
      arrivalTime: 11,
      platform: "B",
      type: "train"
    }
  ],
  "school-station": [
    {
      id: "g1",
      line: "G",
      color: "#6CBE45",
      destination: "Court Sq",
      arrivalTime: 1,
      platform: "1",
      type: "subway"
    },
    {
      id: "g2",
      line: "G",
      color: "#6CBE45",
      destination: "Church Ave",
      arrivalTime: 8,
      platform: "2",
      type: "subway"
    }
  ]
};

export const nearbyStations = [
  {
    id: "main-st-station",
    name: "Main St Station",
    distance: "2 min walk",
    lines: ["A", "C"]
  },
  {
    id: "central-park-station", 
    name: "Central Park Station",
    distance: "5 min walk",
    lines: ["B", "D"]
  },
  {
    id: "downtown-station",
    name: "Downtown Station", 
    distance: "8 min walk",
    lines: ["E", "F"]
  },
  {
    id: "school-station",
    name: "School Station",
    distance: "12 min walk",
    lines: ["G"]
  }
];
