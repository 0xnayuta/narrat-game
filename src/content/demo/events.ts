/**
 * Demo content: minimal triggerable events.
 */

import type { EventDefinition } from "../../engine/types";

export const demoEvents: EventDefinition[] = [
  {
    id: "evt_street_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["street"],
      flags: {
        demo_enabled: true,
      },
      timeRange: { startHour: 0, endHour: 0 },
    },
    payload: {
      narrativeNodeId: "node_street_arrival",
    },
  },
  {
    id: "evt_market_plan",
    type: "follow-up",
    trigger: "after-choice",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["street"],
      flags: {
        market_visit_intent: true,
      },
      timeRange: { startHour: 0, endHour: 0 },
    },
    payload: {
      narrativeNodeId: "node_market_plan",
    },
  },
  {
    id: "evt_market_morning",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["market"],
      flags: {
        quest_intro_started: true,
        market_visit_intent: true,
      },
      timeRange: { startHour: 8, endHour: 18 },
    },
    payload: {
      narrativeNodeId: "node_market_morning",
    },
  },
  {
    id: "evt_market_morning_low_priority_example",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 1,
    conditions: {
      locationIds: ["market"],
      flags: {
        quest_intro_started: true,
        market_visit_intent: true,
        vendor_met: false,
      },
      timeRange: { startHour: 8, endHour: 18 },
    },
    payload: {
      narrativeNodeId: "node_market_plan",
    },
  },
  {
    id: "evt_market_stall_discovery",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 5,
    conditions: {
      locationIds: ["market"],
      vars: {
        current_goal: "visit_market",
      },
      quests: {
        quest_intro_walk: "active",
      },
      questSteps: {
        quest_intro_walk: "step_go_market",
      },
    },
    payload: {
      narrativeNodeId: "node_stall_discovery",
    },
  },
  {
    id: "evt_vendor_aftermath",
    type: "follow-up",
    trigger: "after-choice",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["market"],
      flags: {
        vendor_met: true,
      },
      vars: {
        last_npc_spoken: "npc_vendor_01",
      },
    },
    payload: {
      narrativeNodeId: "node_vendor_aftermath",
    },
  },
  {
    id: "evt_compass_lead",
    type: "follow-up",
    trigger: "after-choice",
    once: true,
    priority: 11,
    conditions: {
      locationIds: ["market"],
      flags: {
        compass_vendor_reacted: true,
      },
      questSteps: {
        quest_black_sail_trail: "step_find_mira",
      },
    },
    payload: {
      narrativeNodeId: "node_compass_lead",
    },
  },
  {
    id: "evt_harbor_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["harbor"],
      flags: {
        compass_vendor_reacted: true,
      },
      questSteps: {
        quest_black_sail_trail: "step_find_mira",
      },
    },
    payload: {
      narrativeNodeId: "node_harbor_arrival",
    },
  },
  {
    id: "evt_signal_tower_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["signal_tower"],
      flags: {
        harbor_watch_contacted: true,
      },
      questSteps: {
        quest_black_sail_trail: "step_search_signal_tower",
      },
    },
    payload: {
      narrativeNodeId: "node_signal_tower_arrival",
    },
  },
  {
    id: "evt_harbor_night_signal",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["harbor"],
      timeRange: { startHour: 22, endHour: 6 },
      flags: {
        harbor_watch_contacted: true,
        signal_tower_clue_found: true,
      },
      questSteps: {
        quest_black_sail_trail: "step_watch_harbor_at_night",
      },
    },
    payload: {
      narrativeNodeId: "node_harbor_night_signal",
    },
  },
  {
    id: "evt_pier_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["pier"],
      timeRange: { startHour: 22, endHour: 6 },
      flags: {
        harbor_watch_contacted: true,
        signal_tower_clue_found: true,
      },
      questSteps: {
        quest_black_sail_trail: "step_follow_pier_signal",
      },
    },
    payload: {
      narrativeNodeId: "node_pier_arrival",
    },
  },
  {
    id: "evt_north_channel_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["north_channel"],
      flags: {
        north_channel_decoded: true,
      },
      questSteps: {
        quest_black_sail_trail: "step_investigate_north_channel",
      },
    },
    payload: {
      narrativeNodeId: "node_north_channel_arrival",
    },
  },
  {
    id: "evt_coal_berth_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["coal_berth"],
      flags: {
        black_sail_berth_identified: true,
      },
      questSteps: {
        quest_black_sail_trail: "step_investigate_black_sail_berth",
      },
    },
    payload: {
      narrativeNodeId: "node_coal_berth_arrival",
    },
  },
  {
    id: "evt_black_sail_stakeout",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["harbor"],
      timeRange: { startHour: 22, endHour: 6 },
      flags: {
        black_sail_network_confirmed: true,
        black_sail_sting_prepared: true,
      },
      quests: {
        quest_black_sail_trail: "completed",
        quest_black_sail_sting: "active",
      },
      questSteps: {
        quest_black_sail_sting: "step_prepare_stakeout",
      },
    },
    payload: {
      narrativeNodeId: "node_black_sail_stakeout",
    },
  },
  {
    id: "evt_black_sail_contact",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 11,
    conditions: {
      locationIds: ["harbor"],
      timeRange: { startHour: 22, endHour: 6 },
      flags: {
        black_sail_network_confirmed: true,
        black_sail_sting_prepared: true,
        black_sail_stakeout_started: true,
      },
      quests: {
        quest_black_sail_trail: "completed",
        quest_black_sail_sting: "active",
      },
      questSteps: {
        quest_black_sail_sting: "step_hold_stakeout",
      },
    },
    payload: {
      narrativeNodeId: "node_black_sail_contact",
    },
  },
];
