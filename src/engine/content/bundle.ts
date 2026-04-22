/**
 * Responsibility: Shared content-bundle contract accepted by session bootstrapping.
 */

import type { NarrativeGraph } from "../narrative";
import type {
  EventDefinition,
  LocationDefinition,
  NPCDefinition,
  QuestDefinition,
} from "../types";

export interface ContentBundle {
  id: string;
  title: string;
  version: number;
  locations: LocationDefinition[];
  events: EventDefinition[];
  narrative: NarrativeGraph;
  quests: QuestDefinition[];
  npcs: NPCDefinition[];
  initialFlags: Record<string, boolean>;
  /** Initial variable values set at session creation. Omit to start with empty vars. */
  initialVars?: Record<string, string | number | boolean>;
}
