/**
 * Demo content: minimal location graph (3 locations).
 */

import type { LocationDefinition } from "../../engine/types";

export const demoLocations: LocationDefinition[] = [
  {
    id: "home",
    name: "Home",
    description: "A small room to rest.",
    connections: [{ to: "street", travelMinutes: 10 }],
  },
  {
    id: "street",
    name: "Street",
    description: "A short road between places.",
    connections: [
      { to: "home", travelMinutes: 10 },
      { to: "market", travelMinutes: 15 },
    ],
  },
  {
    id: "market",
    name: "Market",
    description: "A small market with a few stalls.",
    connections: [{ to: "street", travelMinutes: 15 }],
  },
];
