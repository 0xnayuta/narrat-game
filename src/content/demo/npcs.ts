/**
 * Demo content: minimal NPC placeholder (1 NPC).
 */

import type { NPCDefinition } from "../../engine/types";

export const demoNpcs: NPCDefinition[] = [
  {
    id: "npc_vendor_01",
    name: "Vendor",
    homeLocationId: "market",
    interactions: [
      {
        id: "vendor-first-talk",
        label: "Talk to Vendor",
        nodeId: "node_vendor_intro",
        requiredFlags: {
          vendor_met: false,
        },
        requiredQuests: {
          quest_intro_walk: "completed",
        },
        requiredVars: {
          current_goal: "market_visited",
        },
      },
      {
        id: "vendor-repeat-talk",
        label: "Talk to Vendor again",
        nodeId: "node_vendor_repeat",
        requiredFlags: {
          vendor_met: true,
        },
        requiredQuests: {
          quest_intro_walk: "completed",
        },
        requiredVars: {
          current_goal: "market_visited",
        },
      },
      {
        id: "vendor-stall-tip",
        label: "Ask about the oddities stall",
        nodeId: "node_vendor_stall_tip",
        requiredQuestSteps: {
          quest_intro_walk: "step_examine_stall",
        },
        requiredFlags: {
          stall_discovered: true,
        },
      },
    ],
    tags: ["shop"],
  },
  {
    id: "npc_harbor_watch_01",
    name: "Mira",
    homeLocationId: "harbor",
    interactions: [
      {
        id: "harbor-watch-intro",
        label: "Ask for Mira at the harbor watch",
        nodeId: "node_harbor_watch_intro",
        requiredFlags: {
          compass_vendor_reacted: true,
          harbor_watch_contacted: false,
        },
        requiredQuestSteps: {
          quest_black_sail_trail: "step_find_mira",
        },
      },
      {
        id: "harbor-watch-repeat",
        label: "Speak with Mira again",
        nodeId: "node_harbor_watch_repeat",
        requiredFlags: {
          harbor_watch_contacted: true,
        },
        requiredQuests: {
          quest_black_sail_trail: "active",
        },
      },
    ],
    tags: ["guard"],
  },
];
