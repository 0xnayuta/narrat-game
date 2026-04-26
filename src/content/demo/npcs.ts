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
        id: "harbor-watch-black-sail-aftermath-feedback",
        label: "Ask Mira what the Black Sail seizure changes",
        nodeId: "node_harbor_watch_black_sail_aftermath_feedback",
        requiredFlags: {
          harbor_watch_contacted: true,
          black_sail_sting_resolved: true,
          black_sail_courier_captured: true,
          black_sail_aftermath_feedback_heard: false,
        },
        requiredQuests: {
          quest_black_sail_sting: "completed",
        },
        requiredVars: {
          current_goal: "review_black_sail_aftermath",
        },
      },
      {
        id: "harbor-watch-drowned-lantern-coal-route-feedback",
        label: "Ask Mira about the coal-berth route line",
        nodeId: "node_harbor_watch_drowned_lantern_coal_route_feedback",
        requiredFlags: {
          harbor_watch_contacted: true,
          drowned_lantern_coal_berth_route_noted: true,
          drowned_lantern_exchange_window_found: false,
          drowned_lantern_coal_route_feedback_heard: false,
        },
        requiredQuestSteps: {
          quest_drowned_lantern: "step_trace_dawn_exchange",
        },
        requiredVars: {
          current_goal: "inspect_drowned_lantern_shed_trace",
        },
        eventHistory: {
          lastTriggeredWithinMinutes: {
            evt_drowned_lantern_coal_berth_route_recap: 45,
          },
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
        id: "harbor-watch-pier-cross-reference",
        label: "Ask Mira what the pier message angle implies for the harbor",
        nodeId: "node_harbor_watch_pier_cross_reference",
        requiredFlags: {
          harbor_watch_contacted: true,
          pier_angle_noted: true,
        },
        requiredQuestSteps: {
          quest_black_sail_trail: "step_follow_pier_signal",
        },
        eventHistory: {
          onceTriggered: {
            evt_pier_arrival: true,
          },
        },
      },
      {
        id: "harbor-watch-signal-tower-return-recap",
        label: "Return to Mira after searching the signal tower",
        nodeId: "node_harbor_watch_signal_tower_return_recap",
        requiredFlags: {
          harbor_watch_contacted: true,
          signal_tower_clue_found: true,
        },
        requiredQuestSteps: {
          quest_black_sail_trail: "step_search_signal_tower",
        },
        eventHistory: {
          onceTriggered: {
            evt_signal_tower_return_approach: true,
          },
        },
      },
      {
        id: "harbor-watch-stakeout-failure-recap",
        label: "Tell Mira the stakeout did not produce a capture",
        nodeId: "node_harbor_watch_stakeout_failure_recap",
        requiredFlags: {
          harbor_watch_contacted: true,
          stakeout_attempted: true,
          black_sail_courier_captured: false,
          stakeout_failure_feedback_heard: false,
        },
        requiredQuestSteps: {
          quest_black_sail_sting: "step_hold_stakeout",
        },
      },
      {
        id: "harbor-watch-customs-sheds-recap",
        label: "Tell Mira about the customs sheds tide slip",
        nodeId: "node_harbor_watch_customs_sheds_recap",
        requiredFlags: {
          harbor_watch_contacted: true,
          drowned_lantern_tide_slip_found: true,
          drowned_lantern_sheds_feedback_heard: false,
        },
        requiredQuestSteps: {
          quest_drowned_lantern: "step_search_customs_sheds",
        },
        eventHistory: {
          onceTriggered: {
            evt_drowned_lantern_coal_berth_route_recap: false,
          },
        },
      },
      {
        id: "harbor-watch-coal-berth-cross-reference",
        label: "Tell Mira the coal berth confirms the north-channel pattern",
        nodeId: "node_harbor_watch_coal_berth_cross_reference",
        requiredFlags: {
          harbor_watch_contacted: true,
          coal_berth_clue_found: true,
          black_sail_north_channel_wake_pattern_noted: true,
          drowned_lantern_coal_route_feedback_heard: true,
          coal_berth_cross_reference_heard: false,
        },
        requiredQuestSteps: {
          quest_drowned_lantern: "step_identify_drowned_lantern_contact",
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
