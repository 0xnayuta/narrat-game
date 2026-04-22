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
      vars: {
        current_goal: "investigate_compass",
      },
    },
    payload: {
      narrativeNodeId: "node_compass_lead",
    },
  },
];
