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
          id: "inspect_oddities_stall",
          text: "Check the oddities stall in the corner",
          nextNodeId: "node_stall_discovery",
        },
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
      text: "You have seen enough for now—though a cramped oddities stall tucked into the corner still catches your eye.",
      choices: [
        {
          id: "inspect_oddities_stall_after_walk",
          text: "Take a closer look at the oddities stall before leaving",
          nextNodeId: "node_stall_discovery",
        },
        {
          id: "leave_market_for_now",
          text: "Leave the market floor for now",
          nextNodeId: "node_market_done_end",
        },
      ],
    },
    {
      id: "node_market_done_end",
      text: "You turn away from the market stalls for now.",
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
          id: "cannot_afford_compass",
          text: "Admit you cannot afford the compass and ask about it instead",
          nextNodeId: "node_compass_too_expensive",
          conditions: {
            vars: { gold: { not: { ">=": 15 } } },
          },
          effects: {
            setFlags: {
              compass_examined: true,
            },
            setVars: {
              current_goal: "ask_about_compass",
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
      id: "node_compass_too_expensive",
      text: "You admit the price is beyond you for now. The stall keeper only shrugs, but the compass's strange spinning needle sticks in your mind. If anyone in the market knows what to make of it, it might be the vendor nearby.",
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
            setQuests: {
              quest_black_sail_trail: {
                status: "active",
                currentStepId: "step_find_mira",
              },
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
            setQuests: {
              quest_black_sail_trail: {
                status: "active",
                currentStepId: "step_find_mira",
              },
            },
          },
        },
        {
          id: "describe_examined_compass",
          text: "Describe the strange compass you handled at the stall",
          nextNodeId: "node_vendor_compass_reaction",
          conditions: {
            flags: {
              compass_examined: true,
            },
          },
          effects: {
            setFlags: {
              compass_vendor_reacted: true,
            },
            setVars: {
              current_goal: "investigate_compass",
            },
            setQuests: {
              quest_black_sail_trail: {
                status: "active",
                currentStepId: "step_find_mira",
              },
            },
          },
        },
        {
          id: "return_to_oddities_stall",
          text: "Go back and take another look at the oddities stall",
          nextNodeId: "node_stall_examined",
          effects: {
            setVars: {
              current_goal: "examine_stall",
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
    {
      id: "node_harbor_arrival",
      text: "At the harbor, a watch post overlooks the damp planks. A dockhand points you toward an officer named Mira.",
      choices: [],
    },
    {
      id: "node_harbor_watch_intro",
      text: "A stern woman in a weathered coat looks up from a ledger. \"Mira. What do you need?\"",
      choices: [
        {
          id: "show_compass_to_mira",
          text: "Show the compass and repeat the vendor's warning",
          nextNodeId: "node_harbor_watch_clue",
          effects: {
            setFlags: {
              harbor_watch_contacted: true,
            },
            setVars: {
              current_goal: "investigate_signal_tower",
            },
            advanceQuestStep: ["quest_black_sail_trail"],
          },
        },
      ],
    },
    {
      id: "node_harbor_watch_clue",
      text: "Mira studies the casing, then nods once. \"Old tide-marking guild work. If that needle pulls off true north tonight, follow the old signal tower above the docks. Quietly.\"",
      choices: [],
    },
    {
      id: "node_signal_tower_arrival",
      text: "The old signal tower creaks in the harbor wind. Inside, dust covers the stairs, but there are fresher marks near the lantern room.",
      choices: [
        {
          id: "search_signal_tower",
          text: "Search the lantern room",
          nextNodeId: "node_signal_tower_clue",
          effects: {
            setFlags: {
              signal_tower_clue_found: true,
            },
            setVars: {
              current_goal: "signal_tower_investigated",
            },
          },
        },
      ],
    },
    {
      id: "node_signal_tower_clue",
      text: "Behind the old beacon housing, you find a scrap of oilskin marked with tide times and a hand-drawn symbol matching the compass casing.",
      choices: [],
    },
    {
      id: "node_harbor_watch_repeat",
      text: "Mira keeps her voice low. \"If the compass shifts again, don't chase it alone. Come straight back to the watch. Bring me something concrete from the tower, the piers, or the berth, and I'll know where to point you next.\"",
      choices: [
        {
          id: "report_signal_tower_clue",
          text: "Show Mira the oilskin scrap from the tower",
          conditions: {
            flags: {
              signal_tower_clue_found: true,
            },
            questSteps: {
              quest_black_sail_trail: "step_search_signal_tower",
            },
          },
          nextNodeId: "node_harbor_watch_night_tip",
          effects: {
            setVars: {
              current_goal: "wait_for_harbor_signal",
            },
            advanceQuestStep: ["quest_black_sail_trail"],
          },
        },
        {
          id: "show_pier_message_to_mira",
          text: "Show Mira the note from the tin capsule",
          conditions: {
            flags: {
              pier_message_found: true,
            },
            questSteps: {
              quest_black_sail_trail: "step_decode_pier_message",
            },
          },
          nextNodeId: "node_harbor_watch_channel_tip",
          effects: {
            setFlags: {
              north_channel_decoded: true,
            },
            setVars: {
              current_goal: "investigate_north_channel",
            },
            advanceQuestStep: ["quest_black_sail_trail"],
          },
        },
        {
          id: "report_north_channel_marker",
          text: "Describe the torn sailcloth and marked cord from the north channel",
          conditions: {
            flags: {
              north_channel_marker_found: true,
            },
            questSteps: {
              quest_black_sail_trail: "step_investigate_north_channel",
            },
          },
          nextNodeId: "node_harbor_watch_black_sail_tip",
          effects: {
            setFlags: {
              black_sail_berth_identified: true,
            },
            setVars: {
              current_goal: "investigate_black_sail_berth",
            },
            advanceQuestStep: ["quest_black_sail_trail"],
          },
        },
        {
          id: "report_coal_berth_ledger",
          text: "Show Mira the ledger scrap from the coal berth",
          conditions: {
            flags: {
              coal_berth_clue_found: true,
            },
            questSteps: {
              quest_black_sail_trail: "step_investigate_black_sail_berth",
            },
          },
          nextNodeId: "node_harbor_watch_smuggling_confirmed",
          effects: {
            setFlags: {
              black_sail_network_confirmed: true,
            },
            setVars: {
              current_goal: "black_sail_network_confirmed",
            },
            completeQuest: ["quest_black_sail_trail"],
          },
        },
      ],
    },
    {
      id: "node_harbor_watch_night_tip",
      text: "Mira studies the tide marks, then points toward the dark water. \"These notes match the late watch. Stay near the harbor after full dark and watch for a lantern signal from the waterline.\"",
      choices: [],
    },
    {
      id: "node_harbor_night_signal",
      text: "Well after dark, a shuttered lantern flashes twice from beneath the far pier. The compass needle jerks toward the water before going still again.",
      choices: [
        {
          id: "follow_pier_signal",
          text: "Head for the far pier before the light disappears",
          nextNodeId: "node_harbor_night_signal_end",
          effects: {
            setVars: {
              current_goal: "investigate_pier_signal",
            },
            advanceQuestStep: ["quest_black_sail_trail"],
          },
        },
      ],
    },
    {
      id: "node_harbor_night_signal_end",
      text: "You keep low and move along the docks, counting the pilings until the far pier comes into view.",
      choices: [],
    },
    {
      id: "node_pier_arrival",
      text: "At the far pier, the water slaps against the posts below. Someone has wedged a small tin capsule beneath the railing, still damp from the spray.",
      choices: [
        {
          id: "open_tin_capsule",
          text: "Open the tin capsule",
          nextNodeId: "node_pier_capsule_clue",
          effects: {
            setFlags: {
              pier_message_found: true,
            },
            setVars: {
              current_goal: "pier_message_found",
            },
            advanceQuestStep: ["quest_black_sail_trail"],
          },
        },
      ],
    },
    {
      id: "node_pier_capsule_clue",
      text: "Inside is a tightly rolled note: \"Third bell. Black sail. North channel.\" A smear beside the words matches the oilskin symbol from the tower.",
      choices: [],
    },
    {
      id: "node_harbor_watch_channel_tip",
      text: "Mira reads the note once and exhales. \"Black Sail is no ship name. It's a smuggler mark. North channel means the narrow waterway past the outer marker. If they move on third bell, that's where you watch next.\"",
      choices: [],
    },
    {
      id: "node_north_channel_arrival",
      text: "The north channel is colder and quieter than the inner harbor. Near the outer marker, you spot fresh rope scuffs and a scrap of black sailcloth snagged on a rusted cleat.",
      choices: [
        {
          id: "inspect_channel_marker",
          text: "Inspect the marker and the torn sailcloth",
          nextNodeId: "node_north_channel_clue",
          effects: {
            setFlags: {
              north_channel_marker_found: true,
            },
            setVars: {
              current_goal: "north_channel_investigated",
            },
          },
        },
      ],
    },
    {
      id: "node_north_channel_clue",
      text: "Wrapped inside the torn cloth is a tar-stiff cord stamped with the same smugglers' mark. Someone used this marker as a handoff point not long ago.",
      choices: [],
    },
    {
      id: "node_harbor_watch_black_sail_tip",
      text: "Mira's expression hardens. \"Black sailcloth, tar cord, outer marker—then they're not meeting in open water. They favor the old coal berth past the customs sheds. If Black Sail has a physical anchor in this harbor, that's the place to look.\"",
      choices: [],
    },
    {
      id: "node_coal_berth_arrival",
      text: "The old coal berth sits in shadow beyond the customs sheds. Fresh boot marks cut through the soot, and a skiff rope has been looped around a bollard polished by recent use.",
      choices: [
        {
          id: "search_coal_berth",
          text: "Search the berth and the customs-side crates",
          nextNodeId: "node_coal_berth_clue",
          effects: {
            setFlags: {
              coal_berth_clue_found: true,
            },
            setVars: {
              current_goal: "coal_berth_investigated",
            },
          },
        },
      ],
    },
    {
      id: "node_coal_berth_clue",
      text: "Behind a stack of rotting coal sacks, you find a ledger scrap listing night deliveries under a single mark: a black triangle stitched over a sail line. Someone is still using this berth as cover.",
      choices: [],
    },
    {
      id: "node_harbor_watch_smuggling_confirmed",
      text: "Mira studies the ledger scrap in silence, then folds it into her coat. \"That seal and those delivery marks are enough. Black Sail isn't a rumor anymore—it's an active smuggling line using the coal berth as cover. You've given us something we can act on.\"",
      choices: [
        {
          id: "offer_help_with_sting",
          text: "Tell Mira you'll help watch the berth on the next tide",
          nextNodeId: "node_harbor_watch_sting_plan",
          effects: {
            setFlags: {
              black_sail_sting_prepared: true,
            },
            setVars: {
              current_goal: "prepare_black_sail_sting",
            },
          },
        },
      ],
    },
    {
      id: "node_harbor_watch_sting_plan",
      text: "Mira gives a short nod. \"Good. Keep your head down and be here before the next late tide. If Black Sail uses the berth again, we'll be ready for them.\"",
      choices: [],
    },
    {
      id: "node_black_sail_stakeout",
      text: "Near midnight, a hooded runner from the watch finds you at the harbor. Mira already has two guards in place above the coal berth, lanterns shuttered and eyes on the dark water. Tonight is the first real chance to catch Black Sail in the act.",
      choices: [
        {
          id: "take_stakeout_position",
          text: "Take your place overlooking the coal berth",
          nextNodeId: "node_black_sail_stakeout_ready",
          effects: {
            setFlags: {
              black_sail_stakeout_started: true,
            },
            setVars: {
              current_goal: "hold_black_sail_stakeout",
            },
          },
        },
      ],
    },
    {
      id: "node_black_sail_stakeout_ready",
      text: "You settle into the shadow of a salt-stained storage shed while Mira's people spread out along the berth. Below, the tide knocks softly against the pilings, and every sound on the water suddenly feels important.",
      choices: [],
    },
    {
      id: "node_black_sail_contact",
      text: "Some time after midnight, the faint creak of oars carries over the water. A low skiff noses toward the coal berth without running lights, and one of Mira's guards taps twice against the brick behind you: the signal that Black Sail has shown itself.",
      choices: [
        {
          id: "signal_mira_to_close_net",
          text: "Give Mira the go-ahead to close the net",
          nextNodeId: "node_black_sail_net_closing",
          effects: {
            setFlags: {
              black_sail_net_closing: true,
            },
            setVars: {
              current_goal: "close_black_sail_net",
            },
          },
        },
      ],
    },
    {
      id: "node_black_sail_net_closing",
      text: "Mira moves at once. Dark shapes break from cover along the berth while the skiff crew curse and reach for their poles. For the first time, Black Sail is reacting to your trap instead of staying one step ahead of it.",
      choices: [],
    },
  ],
};
