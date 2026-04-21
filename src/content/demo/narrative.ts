/**
 * Demo content: minimal narrative nodes for event payload targets.
 */

import type { NarrativeGraph } from "../../engine/narrative";

export const demoNarrativeGraph: NarrativeGraph = {
  startNodeId: "node_idle",
  nodes: [
    {
      id: "node_idle",
      text: "You pause and look around.",
      choices: [],
    },
    {
      id: "node_street_arrival",
      text: "You arrive on the street.",
      choices: [
        {
          id: "go_market",
          text: "Head to the market",
          nextNodeId: "node_market_morning",
          effects: {
            setFlags: {
              market_visit_intent: true,
            },
            setVars: {
              current_goal: "visit_market",
            },
            setQuests: {
              quest_intro_walk: {
                status: "active",
                currentStepId: "step_go_market",
              },
            },
          },
        },
      ],
    },
    {
      id: "node_market_morning",
      text: "The market is open and calm.",
      choices: [
        {
          id: "finish_walk",
          text: "Look around the stalls",
          nextNodeId: "node_market_done",
          effects: {
            setVars: {
              current_goal: "market_visited",
            },
            setQuests: {
              quest_intro_walk: {
                status: "completed",
                currentStepId: "step_go_market",
              },
            },
          },
        },
      ],
    },
    {
      id: "node_market_done",
      text: "You have seen enough for now.",
      choices: [],
    },
  ],
};
