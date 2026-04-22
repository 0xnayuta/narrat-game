/**
 * Demo content: unified content bundle entry for the prototype.
 */

import type { ContentBundle } from "../../engine/content/bundle";
import { demoEvents } from "./events";
import { demoLocations } from "./locations";
import { demoNarrativeGraph } from "./narrative";
import { demoNpcs } from "./npcs";
import { demoQuests } from "./quests";

export type DemoContentBundle = ContentBundle;

export const demoContentBundle: DemoContentBundle = {
  id: "demo-content-pack",
  title: "Prototype Demo Pack",
  version: 1,
  locations: demoLocations,
  events: demoEvents,
  narrative: demoNarrativeGraph,
  quests: demoQuests,
  npcs: demoNpcs,
  initialFlags: {
    demo_enabled: true,
    quest_intro_started: true,
  },
  initialVars: {
    gold: 50,
  },
};
