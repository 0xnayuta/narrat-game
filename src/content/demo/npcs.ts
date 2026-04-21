/**
 * Demo content: minimal NPC placeholder (1 NPC).
 */

import type { NPCDefinition } from "../../engine/types";

export const demoNpcs: NPCDefinition[] = [
  {
    id: "npc_vendor_01",
    name: "Vendor",
    homeLocationId: "market",
    tags: ["shop"],
  },
];
