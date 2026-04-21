/**
 * Responsibility: Minimal 3-node narrative sample for runtime wiring.
 * TODO: Move narrative data to content repository once loading pipeline is ready.
 */

import type { NarrativeGraph } from "./NarrativeRuntime";

export const mockNarrativeGraph: NarrativeGraph = {
  startNodeId: "wake_up",
  nodes: [
    {
      id: "wake_up",
      text: "You wake up in your room. The city sounds leak through the window.",
      choices: [
        {
          id: "go_out",
          text: "Go outside",
          nextNodeId: "street_arrival",
        },
        {
          id: "stay_home",
          text: "Stay home",
          nextNodeId: "stay_inside",
        },
      ],
    },
    {
      id: "street_arrival",
      text: "You step onto the street and see people rushing to work.",
      choices: [],
    },
    {
      id: "stay_inside",
      text: "You stay inside and take a quiet moment to plan the day.",
      choices: [],
    },
  ],
};
