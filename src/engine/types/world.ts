/**
 * Directed connection between two locations in the world graph.
 */
export interface LocationConnection {
  to: string;
  travelMinutes: number;
  // TODO: Add travel requirements (costs, conditions) when gating is implemented.
}

/**
 * Static location definition for navigation and scene placement.
 */
export interface LocationDefinition {
  id: string;
  name: string;
  description: string;
  connections: LocationConnection[];
  tags?: string[];
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
