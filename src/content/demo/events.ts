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
    id: "evt_market_return_glance",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 8,
    conditions: {
      locationIds: ["market"],
      vars: {
        current_goal: "market_visited",
      },
      quests: {
        quest_intro_walk: "completed",
      },
      eventHistory: {
        onceTriggered: {
          evt_market_morning: true,
        },
      },
    },
    payload: {
      narrativeNodeId: "node_market_return_glance",
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
    id: "evt_harbor_return_patrol_glance",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 8,
    conditions: {
      locationIds: ["harbor"],
      flags: {
        harbor_watch_contacted: true,
        signal_tower_clue_found: false,
      },
      vars: {
        current_goal: "investigate_signal_tower",
      },
      questSteps: {
        quest_black_sail_trail: "step_search_signal_tower",
      },
      eventHistory: {
        onceTriggered: {
          evt_harbor_arrival: true,
        },
      },
    },
    payload: {
      narrativeNodeId: "node_harbor_return_patrol_glance",
    },
  },
  {
    id: "evt_signal_tower_return_approach",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 8,
    conditions: {
      locationIds: ["signal_tower"],
      flags: {
        harbor_watch_contacted: true,
        harbor_patrol_gap_noted: true,
        signal_tower_clue_found: false,
      },
      vars: {
        current_goal: "investigate_signal_tower",
      },
      questSteps: {
        quest_black_sail_trail: "step_search_signal_tower",
      },
      eventHistory: {
        onceTriggered: {
          evt_signal_tower_arrival: true,
          evt_harbor_return_patrol_glance: true,
        },
      },
    },
    payload: {
      narrativeNodeId: "node_signal_tower_return_approach",
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
    id: "evt_customs_stairs_return_glance",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 8,
    conditions: {
      locationIds: ["customs_tide_stairs"],
      flags: {
        drowned_lantern_shed_trace_found: true,
        drowned_lantern_exchange_window_found: false,
      },
      vars: {
        current_goal: "inspect_drowned_lantern_shed_trace",
      },
      questSteps: {
        quest_drowned_lantern: "step_trace_dawn_exchange",
      },
      eventHistory: {
        onceTriggered: {
          evt_coal_berth_arrival: true,
        },
      },
    },
    payload: {
      narrativeNodeId: "node_customs_stairs_return_glance",
    },
  },
  {
    id: "evt_drowned_lantern_coal_berth_route_recap",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 8,
    conditions: {
      locationIds: ["coal_berth"],
      flags: {
        drowned_lantern_shed_trace_found: true,
        drowned_lantern_exchange_window_found: false,
      },
      vars: {
        current_goal: "inspect_drowned_lantern_shed_trace",
      },
      questSteps: {
        quest_drowned_lantern: "step_trace_dawn_exchange",
      },
      eventHistory: {
        onceTriggered: {
          evt_coal_berth_arrival: true,
        },
      },
    },
    payload: {
      narrativeNodeId: "node_drowned_lantern_coal_berth_route_recap",
    },
  },
  {
    id: "evt_brine_lark_breaker_culvert_return_ripple",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 8,
    conditions: {
      locationIds: ["breaker_culvert"],
      flags: {
        brine_lark_waterline_receiver_identified: true,
      },
      vars: {
        current_goal: "observe_breaker_culvert_activity",
      },
      questSteps: {
        quest_brine_lark: "step_observe_breaker_culvert_activity",
      },
    },
    payload: {
      narrativeNodeId: "node_brine_lark_breaker_culvert_return_ripple",
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
