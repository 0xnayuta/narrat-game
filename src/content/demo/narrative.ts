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
      id: "node_market_plan",
      text: "You decide to head to the market next.",
      choices: [],
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
            completeQuest: ["quest_intro_walk"],
          },
        },
      ],
    },
    {
      id: "node_market_done",
      text: "You have seen enough for now.",
      choices: [],
    },
    {
      id: "node_vendor_intro",
      text: "The vendor watches you approach and offers a quick greeting.",
      choices: [
        {
          id: "ask_vendor",
          text: "Ask how business is going",
          nextNodeId: "node_vendor_done",
          effects: {
            setFlags: {
              vendor_met: true,
            },
            setVars: {
              last_npc_spoken: "npc_vendor_01",
            },
          },
        },
        {
          id: "ask_vendor_about_stall",
          text: "Ask about the oddities stall",
          nextNodeId: "node_vendor_stall_tip",
          conditions: {
            flags: {
              stall_discovered: true,
            },
            vars: {
              current_goal: { in: ["market_visited", "examine_stall", "ask_about_compass"] },
            },
          },
          effects: {
            setFlags: {
              vendor_met: true,
            },
            setVars: {
              last_npc_spoken: "npc_vendor_01",
            },
          },
        },
        {
          id: "ask_vendor_for_rumors",
          text: "Ask for local rumors",
          nextNodeId: "node_vendor_rumors",
          conditions: {
            vars: {
              current_goal: { "!=": "rest" },
            },
          },
          effects: {
            setFlags: {
              vendor_met: true,
            },
            setVars: {
              last_npc_spoken: "npc_vendor_01",
            },
          },
        },
      ],
    },
    {
      id: "node_vendor_done",
      text: "The vendor says the market has been quiet today.",
      choices: [],
    },
    {
      id: "node_vendor_rumors",
      text: "The vendor lowers their voice. \"People say the harbor has seen strange lights after dark. Could be nothing.\"",
      choices: [],
    },
    {
      id: "node_vendor_repeat",
      text: "The vendor nods. \"Still quiet, but at least people are showing up.\"",
      choices: [],
    },
    {
      id: "node_stall_discovery",
      text: "While browsing the market, you notice a small stall tucked in the corner. The sign reads \"Oddities & Curios.\"",
      choices: [
        {
          id: "explore_stall",
          text: "Step closer and examine the wares",
          nextNodeId: "node_stall_examined",
          effects: {
            setFlags: {
              stall_discovered: true,
            },
            setVars: {
              current_goal: "examine_stall",
            },
            advanceQuestStep: ["quest_intro_walk"],
          },
        },
        {
          id: "ignore_stall",
          text: "Keep walking",
          nextNodeId: "node_stall_ignored",
          effects: {
            setVars: {
              current_goal: "market_visited",
            },
          },
        },
      ],
    },
    {
      id: "node_stall_examined",
      text: "The stall keeper eyes you curiously. \"First time here? Take your time.\" You notice a peculiar compass among the items.",
      choices: [
        {
          id: "buy_compass",
          text: "Buy the compass (15 gold)",
          nextNodeId: "node_compass_bought",
          conditions: {
            vars: { gold: { ">=": 15 } },
          },
          effects: {
            addVars: {
              gold: -15,
            },
            setFlags: {
              compass_owned: true,
            },
          },
        },
        {
          id: "examine_compass",
          text: "Pick up the compass for a closer look",
          nextNodeId: "node_compass_examined",
          effects: {
            addStats: {
              stamina: -10,
            },
            setFlags: {
              compass_examined: true,
            },
          },
        },
        {
          id: "leave_stall",
          text: "Step back from the stall",
          nextNodeId: "node_stall_left",
        },
      ],
    },
    {
      id: "node_compass_bought",
      text: "You hand over the coins and pocket the compass. Its needle spins before settling north.",
      choices: [],
    },
    {
      id: "node_compass_examined",
      text: "You pick up the compass. Its needle spins wildly before settling. Odd.",
      choices: [],
    },
    {
      id: "node_stall_left",
      text: "You step back from the stall without touching anything.",
      choices: [],
    },
    {
      id: "node_stall_ignored",
      text: "You walk past the stall without a second glance. There will be other days.",
      choices: [],
    },
    {
      id: "node_vendor_stall_tip",
      text: "The vendor leans in. \"That oddities stall? The keeper knows more than they let on. Ask about the compass.\"",
      choices: [
        {
          id: "show_compass",
          text: "Show the compass you bought",
          nextNodeId: "node_vendor_compass_reaction",
          conditions: {
            flags: {
              compass_owned: true,
            },
          },
          effects: {
            setFlags: {
              compass_vendor_reacted: true,
            },
            setVars: {
              current_goal: "investigate_compass",
            },
          },
        },
        {
          id: "press_for_harbor_watch",
          text: "Press for a stronger harbor lead",
          nextNodeId: "node_vendor_harbor_watch_name",
          conditions: {
            any: [
              {
                flags: {
                  compass_owned: true,
                },
              },
              {
                vars: {
                  reputation: { ">=": 3 },
                },
              },
            ],
          },
          effects: {
            setFlags: {
              compass_vendor_reacted: true,
            },
            setVars: {
              current_goal: "investigate_compass",
            },
          },
        },
        {
          id: "thank_vendor",
          text: "Thank the vendor",
          nextNodeId: "node_vendor_stall_tip_end",
          effects: {
            setVars: {
              current_goal: "ask_about_compass",
            },
          },
        },
      ],
    },
    {
      id: "node_vendor_compass_reaction",
      text: "The vendor squints at the compass and frowns. \"That mark on the casing? I've seen it before. If it starts pointing somewhere strange, don't ignore it.\"",
      choices: [],
    },
    {
      id: "node_vendor_harbor_watch_name",
      text: "The vendor glances around, then mutters: \"Ask for Mira at the harbor watch. If anyone knows that symbol, it will be her.\"",
      choices: [],
    },
    {
      id: "node_vendor_stall_tip_end",
      text: "The vendor waves you off. \"Good luck out there.\"",
      choices: [],
    },
    {
      id: "node_vendor_aftermath",
      text: "As you step away from the vendor's stall, you overhear a merchant mention that a rare shipment just arrived at the harbor.",
      choices: [],
    },
    {
      id: "node_compass_lead",
      text: "The vendor taps the compass casing. \"If that symbol is what I think it is, you should speak to the harbor watch before nightfall.\"",
      choices: [],
    },
  ],
};
