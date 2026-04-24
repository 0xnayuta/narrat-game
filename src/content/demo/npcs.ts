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
        id: "harbor-watch-customs-stairs-recap",
        label: "Tell Mira about the customs stairs lower landing",
        nodeId: "node_harbor_watch_customs_stairs_recap",
        requiredFlags: {
          harbor_watch_contacted: true,
          customs_stairs_exchange_point_noted: true,
        },
        requiredQuestSteps: {
          quest_drowned_lantern: "step_trace_dawn_exchange",
        },
        requiredVars: {
          current_goal: "inspect_drowned_lantern_shed_trace",
        },
        eventHistory: {
          onceTriggered: {
            evt_customs_stairs_return_glance: true,
          },
        },
      },
      {
        id: "harbor-watch-brine-lark-culvert-recap",
        label: "Tell Mira about the Breaker Culvert tide rhythm",
        nodeId: "node_harbor_watch_brine_lark_culvert_recap",
        requiredFlags: {
          harbor_watch_contacted: true,
          brine_lark_culvert_rhythm_noted: true,
        },
        requiredQuestSteps: {
          quest_brine_lark: "step_observe_breaker_culvert_activity",
        },
        requiredVars: {
          current_goal: "observe_breaker_culvert_activity",
        },
        eventHistory: {
          onceTriggered: {
            evt_brine_lark_breaker_culvert_return_ripple: true,
          },
        },
      },
      {
        id: "harbor-watch-north-channel-fresh-feedback",
        label: "Ask Mira about the fresh north-channel wake line",
        nodeId: "node_harbor_watch_north_channel_fresh_feedback",
        requiredFlags: {
          harbor_watch_contacted: true,
          black_sail_north_channel_wake_pattern_noted: true,
          black_sail_berth_identified: true,
          black_sail_north_channel_recent_feedback_heard: false,
        },
        requiredQuestSteps: {
          quest_black_sail_trail: "step_investigate_black_sail_berth",
        },
        requiredVars: {
          current_goal: "investigate_black_sail_berth",
        },
        eventHistory: {
          lastTriggeredWithinMinutes: {
            evt_north_channel_return_wake_pattern: 45,
          },
        },
      },
      {
        id: "harbor-watch-repeat",
        label: "Speak with Mira again",
        nodeId: "node_harbor_watch_repeat",
        requiredFlags: {
          harbor_watch_contacted: true,
        },
        any: [
          { requiredQuests: { quest_black_sail_trail: "active" } },
          { requiredQuests: { quest_black_sail_trail: "completed" } },
        ],
      },
    ],
    tags: ["guard"],
  },
];
