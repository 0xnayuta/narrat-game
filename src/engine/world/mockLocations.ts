/**
 * Responsibility: Minimal local mock data for early world/navigation development.
 * TODO: Replace with content-driven loading once Scene/World repositories are unified.
 */

import type { LocationDefinition } from "../types";

export const mockLocations: LocationDefinition[] = [
  {
    id: "home",
    name: "Home",
    description: "Your small apartment.",
    connections: [
      { to: "street", travelMinutes: 5 },
    ],
  },
  {
    id: "street",
    name: "Main Street",
    description: "A busy street connecting key places.",
    connections: [
      { to: "home", travelMinutes: 5 },
      { to: "market", travelMinutes: 10 },
    ],
  },
  {
    id: "market",
    name: "Market",
    description: "A crowded market full of vendors.",
    connections: [
      { to: "street", travelMinutes: 10 },
    ],
  },
];
