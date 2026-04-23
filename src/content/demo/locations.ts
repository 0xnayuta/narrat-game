/**
 * Demo content: minimal location graph for the prototype branch flow.
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
    connections: [
      { to: "street", travelMinutes: 15 },
      { to: "harbor", travelMinutes: 20 },
    ],
  },
  {
    id: "harbor",
    name: "Harbor",
    description: "A damp stretch of docks watched over by the harbor guard.",
    connections: [
      { to: "market", travelMinutes: 20 },
      { to: "signal_tower", travelMinutes: 10 },
      { to: "pier", travelMinutes: 5 },
      { to: "north_channel", travelMinutes: 15 },
      { to: "coal_berth", travelMinutes: 10 },
    ],
  },
  {
    id: "signal_tower",
    name: "Old Signal Tower",
    description: "A weathered tower stands above the harbor, half abandoned but still watching the water.",
    connections: [{ to: "harbor", travelMinutes: 10 }],
  },
  {
    id: "pier",
    name: "Far Pier",
    description: "A narrow stretch of wet boards runs out over the black water beneath the harbor lights.",
    connections: [{ to: "harbor", travelMinutes: 5 }],
  },
  {
    id: "north_channel",
    name: "North Channel",
    description: "A narrow run of black water beyond the outer marker, where larger vessels keep their distance.",
    connections: [{ to: "harbor", travelMinutes: 15 }],
  },
  {
    id: "coal_berth",
    name: "Old Coal Berth",
    description: "A soot-stained berth beyond the customs sheds, half abandoned and heavy with the smell of wet rope and old fuel.",
    connections: [{ to: "harbor", travelMinutes: 10 }],
  },
  {
    id: "customs_tide_stairs",
    name: "Customs Tide Stairs",
    description: "A narrow set of stone steps dropping behind the customs sheds to the outer waterline, usually ignored except at the right tide.",
    connections: [{ to: "harbor", travelMinutes: 10 }],
  },
  {
    id: "breaker_culvert",
    name: "Breaker Culvert",
    description: "A low drainage arch cut into the harbor wall beyond the customs edge, easy to miss unless you are on the water at the right angle.",
    connections: [{ to: "harbor", travelMinutes: 15 }],
  },
  {
    id: "reedway_cut",
    name: "Reedway Cut",
    description: "A shallow sidewater slit beyond the harbor wall, half reed-choked and too narrow for ordinary boats to use without purpose.",
    connections: [{ to: "harbor", travelMinutes: 20 }],
  },
  {
    id: "sluice_blind",
    name: "Sluice Blind",
    description: "A half-collapsed reed-screen shelter near an old sluice line inland from the cut, easy to mistake for marsh debris until a lamp moves inside it.",
    connections: [{ to: "harbor", travelMinutes: 25 }],
  },
  {
    id: "sluice_control_house",
    name: "Sluice Control House",
    description: "A low brick building half-sunk into the marsh bank behind the sluice blind, with a single smoke vent visible above the reeds and water-level charts posted inside its windows.",
    connections: [{ to: "harbor", travelMinutes: 30 }],
  },
  {
    id: "marsh_control_tower",
    name: "Marsh Control Tower",
    description: "A tall, camouflaged tower built into the marsh rise behind the control house, with a single lamp at its peak and a network of signal lines running down to the sluice system.",
    connections: [{ to: "harbor", travelMinutes: 35 }],
  },
];
