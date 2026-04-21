/**
 * Responsibility: Happy-path demo events for end-to-end flow wiring.
 */

import type { EventDefinition } from "../types";

export const mockFlowEvents: EventDefinition[] = [
  {
    id: "street-arrival-event",
    type: "arrival",
    trigger: "on-location-enter",
    conditions: {
      locationIds: ["street"],
      timeRange: { startHour: 0, endHour: 0 },
      flags: {
        flow_demo_enabled: true,
      },
    },
    payload: {
      narrativeNodeId: "street_arrival",
    },
  },
  {
    id: "home-morning-check",
    type: "ambient",
    trigger: "on-time-check",
    conditions: {
      locationIds: ["home"],
      timeRange: { startHour: 6, endHour: 10 },
      flags: {
        flow_demo_enabled: true,
      },
    },
    payload: {
      narrativeNodeId: "wake_up",
    },
  },
];
