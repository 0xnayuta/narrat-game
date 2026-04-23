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
            setQuests: {
              quest_black_sail_sting: {
                status: "active",
                currentStepId: "step_prepare_stakeout",
              },
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
            advanceQuestStep: ["quest_black_sail_sting"],
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
            advanceQuestStep: ["quest_black_sail_sting"],
          },
        },
      ],
    },
    {
      id: "node_black_sail_net_closing",
      text: "Mira moves at once. Dark shapes break from cover along the berth while the skiff crew curse and reach for their poles. For the first time, Black Sail is reacting to your trap instead of staying one step ahead of it.",
      choices: [
        {
          id: "help_secure_the_berth",
          text: "Help the watch secure the berth after the rush",
          nextNodeId: "node_black_sail_sting_resolved",
          effects: {
            setFlags: {
              black_sail_sting_resolved: true,
            },
            setVars: {
              current_goal: "black_sail_sting_resolved",
            },
            completeQuest: ["quest_black_sail_sting"],
          },
        },
      ],
    },
    {
      id: "node_black_sail_sting_resolved",
      text: "By the time the shouting dies down, Mira's people have the berth locked tight and the skiff pinned against the pilings. Whatever else Black Sail may still be hiding, tonight the harbor watch finally forced the line into the open.",
      choices: [
        {
          id: "ask_what_the_watch_caught",
          text: "Ask Mira what the watch actually seized",
          nextNodeId: "node_black_sail_aftermath_report",
          effects: {
            setFlags: {
              black_sail_courier_captured: true,
            },
            setVars: {
              current_goal: "review_black_sail_aftermath",
            },
          },
        },
      ],
    },
    {
      id: "node_black_sail_aftermath_report",
      text: "Mira wipes soot from her sleeve and answers without looking up from the seized skiff. \"One courier, one coded ledger stub, and enough marked rope to tie this berth to the rest of the line. Black Sail is hurt, not broken—but now we know they bleed.\"",
      choices: [
        {
          id: "ask_where_the_stub_points",
          text: "Ask Mira what the ledger stub points to next",
          nextNodeId: "node_black_sail_next_lead",
          effects: {
            setFlags: {
              black_sail_next_lead_found: true,
            },
            setVars: {
              current_goal: "trace_black_sail_next_lead",
            },
          },
        },
      ],
    },
    {
      id: "node_black_sail_next_lead",
      text: "Mira turns the damp ledger stub toward the lantern light. \"This mark isn't for the berth—it's for a runner called the Drowned Lantern. If Black Sail still has a route open after tonight, that name is where the next trail starts.\"",
      choices: [
        {
          id: "ask_what_drowned_lantern_is",
          text: "Ask Mira what the Drowned Lantern actually is",
          nextNodeId: "node_black_sail_next_lead_clarified",
          effects: {
            setFlags: {
              drowned_lantern_identified_as_contact: true,
            },
            setVars: {
              current_goal: "trace_drowned_lantern_contact",
            },
          },
        },
      ],
    },
    {
      id: "node_black_sail_next_lead_clarified",
      text: "Mira taps the ledger stub once. \"Not a ship. Not a berth. A name passed hand to hand among their runners. Drowned Lantern is a contact alias—the sort used when cargo changes boats before dawn. If we keep pushing this line, that alias is the next knot to cut.\"",
      choices: [
        {
          id: "ask_where_to_start_tracking_drowned_lantern",
          text: "Ask where to start tracking the Drowned Lantern contact",
          nextNodeId: "node_drowned_lantern_start_point",
          effects: {
            setFlags: {
              drowned_lantern_search_started: true,
            },
            setVars: {
              current_goal: "search_customs_sheds_contact_line",
            },
            setQuests: {
              quest_drowned_lantern: {
                status: "active",
                currentStepId: "step_search_customs_sheds",
              },
            },
          },
        },
      ],
    },
    {
      id: "node_drowned_lantern_start_point",
      text: "Mira folds the stub and points back toward the darker end of the harbor. \"Start with the customs-side sheds near the old berth. Couriers working under contact names need somewhere dry to trade ledgers, rope seals, and tide slips. If Drowned Lantern still has feet on the docks, that is where the trail should pick up again.\"",
      choices: [
        {
          id: "search_customs_sheds_for_drowned_lantern_trace",
          text: "Search the customs-side sheds for any trace of the contact",
          nextNodeId: "node_drowned_lantern_shed_trace",
          effects: {
            setFlags: {
              drowned_lantern_shed_trace_found: true,
            },
            setVars: {
              current_goal: "inspect_drowned_lantern_shed_trace",
            },
            advanceQuestStep: ["quest_drowned_lantern"],
          },
        },
      ],
    },
    {
      id: "node_drowned_lantern_shed_trace",
      text: "In a dry gap behind a customs ledger chest, you find a wax-sealed tide slip stamped with the same drowned-lantern mark Mira showed you. Someone used these sheds as a handoff point, and the slip references a dawn-side exchange still waiting to happen.",
      choices: [
        {
          id: "ask_mira_to_decode_dawn_exchange",
          text: "Ask Mira what the dawn-side exchange note means",
          nextNodeId: "node_drowned_lantern_exchange_window",
          effects: {
            setFlags: {
              drowned_lantern_exchange_window_found: true,
            },
            setVars: {
              current_goal: "identify_drowned_lantern_exchange_window",
            },
            advanceQuestStep: ["quest_drowned_lantern"],
          },
        },
      ],
    },
    {
      id: "node_drowned_lantern_exchange_window",
      text: "Mira studies the tide slip and traces a thumb over the salt-soft wax. \"This isn't a meeting place—it's a timing mark. Dawn-side exchange means they pass ledgers and cargo tags at first light, then move the runner before the harbor wakes. If we press this lead, the next move is to identify which contact answers that window.\"",
      choices: [
        {
          id: "ask_who_handles_the_dawn_exchange",
          text: "Ask Mira who is most likely handling that dawn exchange",
          nextNodeId: "node_drowned_lantern_contact_suspect",
          effects: {
            setFlags: {
              drowned_lantern_contact_suspect_identified: true,
            },
            setVars: {
              current_goal: "verify_drowned_lantern_contact_suspect",
            },
          },
        },
      ],
    },
    {
      id: "node_drowned_lantern_contact_suspect",
      text: "Mira thinks for a long moment before answering. \"Not the cargo hands. This reads like the work of a dawn runner who never stays with the same boat twice. If I had to place it, I'd start with the tally-keeper they call Brine Lark—the sort who carries tags, names, and tide slips between crews without ever touching the cargo itself.\"",
      choices: [
        {
          id: "mark_brine_lark_as_the_next_target",
          text: "Mark Brine Lark as the next target to trace",
          nextNodeId: "node_drowned_lantern_contact_confirmed",
          effects: {
            setFlags: {
              brine_lark_identified_as_target: true,
            },
            setVars: {
              current_goal: "trace_brine_lark_network",
            },
            completeQuest: ["quest_drowned_lantern"],
          },
        },
      ],
    },
    {
      id: "node_drowned_lantern_contact_confirmed",
      text: "Mira nods once. \"Then Brine Lark is our next point of pressure. We may not know every face behind Black Sail yet, but we know which runner's shadow to follow when this line moves again.\"",
      choices: [
        {
          id: "ask_where_brine_lark_runs_goods",
          text: "Ask where Brine Lark is most likely to surface next",
          nextNodeId: "node_brine_lark_start_point",
          effects: {
            setFlags: {
              brine_lark_followup_started: true,
            },
            setVars: {
              current_goal: "track_brine_lark_route",
            },
            setQuests: {
              quest_brine_lark: {
                status: "active",
                currentStepId: "step_search_tide_warehouse",
              },
            },
          },
        },
      ],
    },
    {
      id: "node_brine_lark_start_point",
      text: "Mira answers without hesitation. \"Watch the tide warehouse behind the customs ropeshed. A runner like Brine Lark needs a place to swap tags, dry slips, and vanish before the dock crews change. If that name is still active, that warehouse is the next board to lift.\"",
      choices: [
        {
          id: "search_tide_warehouse_for_brine_lark_trace",
          text: "Search the tide warehouse behind the customs ropeshed",
          nextNodeId: "node_brine_lark_warehouse_trace",
          effects: {
            setFlags: {
              brine_lark_warehouse_trace_found: true,
            },
            setVars: {
              current_goal: "inspect_brine_lark_warehouse_trace",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_warehouse_trace",
      text: "Inside the tide warehouse, you find a split rope seal and a chalked tally mark hidden behind stacked salt crates. The mark matches the slip pattern Mira described, and the dust around it suggests someone has been using this corner as a relay point shortly before dawn.",
      choices: [
        {
          id: "ask_mira_what_the_warehouse_mark_implies",
          text: "Ask Mira what the warehouse mark implies",
          nextNodeId: "node_brine_lark_route_window",
          effects: {
            setFlags: {
              brine_lark_route_window_identified: true,
            },
            setVars: {
              current_goal: "watch_brine_lark_shift_change",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_route_window",
      text: "Mira studies the chalk mark, then points toward the warehouse's rear loading door. \"This is a shift-change signal. Brine Lark's people are not using the front. If the pattern holds, the next handoff will slip through the back door just before dawn when the night crews peel away and the day clerks haven't settled in yet.\"",
      choices: [
        {
          id: "commit_to_watch_brine_lark_shift_change",
          text: "Agree to watch the rear loading door before dawn",
          nextNodeId: "node_brine_lark_watch_plan",
          effects: {
            setFlags: {
              brine_lark_shift_watch_committed: true,
            },
            setVars: {
              current_goal: "watch_brine_lark_rear_door",
            },
          },
        },
      ],
    },
    {
      id: "node_brine_lark_watch_plan",
      text: "Mira gives a short nod. \"Then we stop chasing scraps and start watching the route itself. Be in place before first light. If Brine Lark uses that rear door, we catch the handoff instead of reading about it afterward.\"",
      choices: [
        {
          id: "keep_watch_through_shift_change",
          text: "Keep watch through the shift change",
          nextNodeId: "node_brine_lark_shift_change_observed",
          effects: {
            setFlags: {
              brine_lark_shift_change_observed: true,
            },
            setVars: {
              current_goal: "assess_brine_lark_handoff",
            },
          },
        },
      ],
    },
    {
      id: "node_brine_lark_shift_change_observed",
      text: "Just before dawn, a hooded figure slips through the rear loading door and passes a wrapped tag bundle to a waiting dock clerk before vanishing back into the dim lane behind the ropeshed. It happens too cleanly to be chance—Brine Lark's route is real, and now you have seen the handoff pattern with your own eyes.",
      choices: [],
    },
  ],
};
