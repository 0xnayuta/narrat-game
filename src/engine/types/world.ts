/**
 * Static location definition for navigation and scene placement.
 */
export interface LocationDefinition {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  // TODO: Add links/exits once travel model is implemented.
}

/**
 * Static NPC definition used by world and narrative modules.
 */
export interface NPCDefinition {
  id: string;
  name: string;
  homeLocationId?: string;
  tags?: string[];
  // TODO: Add schedule/relationship schema after time + social systems are defined.
}
