import { Route, TransitStep } from "@/types/navigation";

export const sampleRoutes: Route[] = [
  {
    id: "route1",
    totalDuration: 35,
    departureTime: "3:15 PM",
    arrivalTime: "3:50 PM",
    steps: [
      {
        id: "step1",
        type: "walk",
        from: "Current Location",
        to: "Main St Station",
        duration: 5
      },
      {
        id: "step2",
        type: "subway",
        line: "A",
        color: "#0039A6",
        from: "Main St Station",
        to: "Central Park Station",
        duration: 20,
        departureTime: "3:22 PM",
        arrivalTime: "3:42 PM",
        stops: 4
      },
      {
        id: "step3",
        type: "walk",
        from: "Central Park Station",
        to: "Central Park",
        duration: 8
      }
    ]
  },
  {
    id: "route2",
    totalDuration: 40,
    departureTime: "3:15 PM",
    arrivalTime: "3:55 PM",
    steps: [
      {
        id: "step1",
        type: "walk",
        from: "Current Location",
        to: "Downtown Station",
        duration: 7
      },
      {
        id: "step2",
        type: "train",
        line: "B",
        color: "#FF6319",
        from: "Downtown Station",
        to: "Park Station",
        duration: 25,
        departureTime: "3:25 PM",
        arrivalTime: "3:50 PM",
        stops: 3
      },
      {
        id: "step3",
        type: "walk",
        from: "Park Station",
        to: "Central Park",
        duration: 5
      }
    ]
  }
];

export const subwayLines = [
  { id: "a", name: "A", color: "#0039A6" },
  { id: "b", name: "B", color: "#FF6319" },
  { id: "c", name: "C", color: "#00933C" },
  { id: "d", name: "D", color: "#FF6319" },
  { id: "e", name: "E", color: "#0039A6" },
  { id: "f", name: "F", color: "#FF6319" },
  { id: "g", name: "G", color: "#6CBE45" }
];
