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
            startQuest: ["quest_intro_walk"],
            setQuestStep: {
              quest_intro_walk: "step_go_market",
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
          id: "retrace_market_arrival",
          text: "Pause and retrace the first impression of the market",
          nextNodeId: "node_market_arrival_impression",
          conditions: {
            eventHistory: {
              onceTriggered: {
                evt_market_morning: true,
              },
              lastTriggeredWithinMinutes: {
                evt_market_morning: 30,
              },
            },
          },
        },
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
      id: "node_market_arrival_impression",
      text: "You hold still for a moment and let the first impression settle properly: the open lanes, the unhurried voices, the sense that nothing here is pressing—at least not yet. Seen again that quickly, the market's calm feels less like emptiness and more like a surface waiting for you to notice what sits just outside the obvious flow.",
      choices: [],
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
      id: "node_market_return_glance",
      text: "When you step onto the market floor again, the place no longer reads as a blur of first impressions. You recognize the quieter seam between the louder stalls almost immediately, and the memory of that earlier calm makes the whole square feel more legible than it did the first time through.",
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
            startQuest: ["quest_black_sail_trail"],
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
            startQuest: ["quest_black_sail_trail"],
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
            startQuest: ["quest_black_sail_trail"],
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
      id: "node_harbor_return_patrol_glance",
      text: "Coming back to the harbor after speaking with Mira, you read the place differently. The watch post no longer feels like a single fixed desk but the center of a moving pattern: dockhands drift through the bright lanes, while the guards' real sightlines leave a quieter seam along the warehouse side where someone trying not to be remembered could pass without haste.",
      choices: [
        {
          id: "mark_the_quieter_route_to_the_tower",
          text: "Mark the quieter route toward the old signal tower before moving on",
          nextNodeId: "node_harbor_return_patrol_glance_end",
          effects: {
            setFlags: {
              harbor_patrol_gap_noted: true,
            },
            setVars: {
              current_goal: "investigate_signal_tower",
            },
          },
        },
      ],
    },
    {
      id: "node_harbor_return_patrol_glance_end",
      text: "You take a moment to fix the quieter route in memory: not hidden exactly, but easy to miss if you were only looking at the main planks and the watch lamps. When you turn away, the tower approach already feels narrower and more deliberate than it did the first time Mira pointed you toward it.",
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
      id: "node_signal_tower_return_approach",
      text: "On the second approach, the tower stops feeling like a landmark and starts feeling like a route problem. With the harbor patrol gap already fixed in memory, you notice how the warped stair and the lee side of the old beacon wall let you come up under cover from the brighter dock line without ever fully presenting yourself to the open planks below.",
      choices: [
        {
          id: "keep_to_the_shadowed_stair",
          text: "Keep to the shadowed stair and fix the quiet approach before searching",
          nextNodeId: "node_signal_tower_return_approach_end",
          effects: {
            setFlags: {
              signal_tower_quiet_approach_noted: true,
            },
            setVars: {
              current_goal: "investigate_signal_tower",
            },
          },
        },
      ],
    },
    {
      id: "node_signal_tower_return_approach_end",
      text: "You slow just long enough to map the quiet approach properly: where the stair groans, where the wall blocks sight from below, and where you can pause without becoming a silhouette in the lantern-room opening. When you move again, the tower feels less like a dare and more like a space you can work through on purpose.",
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
          id: "follow_pier_signal_by_shadow_route",
          text: "Use the shadowed warehouse line and approach the pier from cover",
          conditions: {
            flags: {
              harbor_patrol_gap_noted: true,
              signal_tower_quiet_approach_noted: true,
            },
            eventHistory: {
              onceTriggered: {
                evt_signal_tower_return_approach: true,
              },
            },
          },
          nextNodeId: "node_harbor_night_signal_shadow_route_end",
          effects: {
            setFlags: {
              black_sail_shadow_route_taken: true,
            },
            setVars: {
              current_goal: "investigate_pier_signal",
            },
            advanceQuestStep: ["quest_black_sail_trail"],
          },
        },
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
      id: "node_harbor_night_signal_shadow_route_end",
      text: "Instead of cutting straight across the open planks, you slip along the warehouse shadow and let the old patrol seam carry you forward. The move costs a few breaths, but by the time you angle toward the far pier you already know where the lamps do not quite reach.",
      choices: [],
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
        {
          id: "reset_stakeout_plan",
          text: "Tell Mira you need to reset the plan and try again on another tide",
          nextNodeId: "node_harbor_watch_sting_plan",
          effects: {
            setVars: {
              current_goal: "prepare_black_sail_sting",
            },
            resetQuestStep: ["quest_black_sail_sting"],
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
      id: "node_customs_stairs_return_glance",
      text: "On the way back from the coal berth, the customs tide stairs catch your attention differently. The steps are half tide-washed and easy to overlook, but now that you have seen how the sheds work as a handoff layer, you notice how the lower landing stays dry just long enough for someone to trade a sealed slip below the customs sightline before the water comes back.",
      choices: [
        {
          id: "note_the_lower_landing_exchange_point",
          text: "Fix the lower landing as a secondary exchange point in memory",
          nextNodeId: "node_customs_stairs_return_glance_end",
          effects: {
            setFlags: {
              customs_stairs_exchange_point_noted: true,
            },
            setVars: {
              current_goal: "inspect_drowned_lantern_shed_trace",
            },
          },
        },
      ],
    },
    {
      id: "node_customs_stairs_return_glance_end",
      text: "You take a moment to read the tide marks on the lower step. At the right hour, the water pulls back far enough for a fast handoff—no ledger chest, no dry shelf, just one pair of hands and another passing below the customs window. You file it away and move on.",
      choices: [],
    },
    {
      id: "node_harbor_watch_customs_stairs_recap",
      text: "Mira listens without interrupting while you describe the lower landing below the customs sightline. \"That matters,\" she says at last. \"The shed gave us the paper trail, but the stairs give us the handoff shape. If the Drowned Lantern uses a dawn exchange, that landing may be where the runner keeps the cargo hands out of sight.\"",
      choices: [
        {
          id: "ask_mira_to_fold_the_stairs_into_the_dawn_exchange",
          text: "Ask Mira to fold the stairs observation into the dawn exchange note",
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
          id: "suggest_the_customs_stairs_lower_landing",
          text: "Suggest the customs stairs lower landing as a possible exchange point",
          conditions: {
            flags: {
              customs_stairs_exchange_point_noted: true,
            },
          },
          nextNodeId: "node_drowned_lantern_exchange_window_confirmed",
          effects: {
            setFlags: {
              drowned_lantern_contact_suspect_identified: true,
              drowned_lantern_stairs_insight_used: true,
            },
            setVars: {
              current_goal: "verify_drowned_lantern_contact_suspect",
            },
          },
        },
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
      id: "node_drowned_lantern_exchange_window_confirmed",
      text: "Mira's eyes narrow. \"The tide stairs. That makes sense—no shed, no chest, just the right gap in the water and one pair of hands passing another below the customs sightline. If you noticed that, the runner probably uses it too. That narrows who we're looking for.\"",
      choices: [
        {
          id: "confirm_brine_lark_direct_from_stairs_insight",
          text: "Tell Mira the tide stairs exchange points straight at a dawn runner, not a cargo hand",
          nextNodeId: "node_drowned_lantern_contact_confirmed_from_insight",
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
      id: "node_drowned_lantern_contact_confirmed_from_insight",
      text: "Mira does not hesitate. \"Then it is the tally-keeper. The one they call Brine Lark. A dawn runner who carries tags, names, and tide slips between crews without ever touching cargo. If your stairs observation is right, he is the one using that landing at first light.\"",
      choices: [
        {
          id: "ask_where_brine_lark_runs_goods_from_insight",
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
      choices: [
        {
          id: "ask_mira_what_the_handoff_changes",
          text: "Ask Mira what the handoff tells you to do next",
          nextNodeId: "node_brine_lark_next_pressure_point",
          effects: {
            setFlags: {
              brine_lark_handoff_assessed: true,
            },
            setVars: {
              current_goal: "identify_brine_lark_receiver",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_next_pressure_point",
      text: "Mira keeps her eyes on the lane where the hooded runner disappeared, then shakes her head. \"Not the one who vanished. That runner is doing exactly what the route was built to let them do. The weak seam is the dock clerk who stayed still long enough to take the bundle. If we want the next layer of this network, we stop chasing the shadow and learn who receives for Brine Lark when the handoff lands.\"",
      choices: [
        {
          id: "mark_the_receiving_clerk_as_the_next_pressure_point",
          text: "Mark the receiving clerk as the next pressure point",
          nextNodeId: "node_brine_lark_receiver_marked",
          effects: {
            setFlags: {
              brine_lark_receiving_clerk_marked: true,
            },
            setVars: {
              current_goal: "pressure_brine_lark_receiving_clerk",
            },
          },
        },
      ],
    },
    {
      id: "node_brine_lark_receiver_marked",
      text: "You fix the receiving clerk in memory instead of the runner's disappearing silhouette. The pattern is no longer just a rumor or a route window; it now has a stable receiving point. Whatever comes next in Brine Lark's chain, this clerk is the first person in the sequence who had to stand and be seen.",
      choices: [
        {
          id: "ask_how_to_approach_the_receiving_clerk",
          text: "Ask Mira how to get close to the clerk without spooking the route",
          nextNodeId: "node_brine_lark_clerk_approach_plan",
          effects: {
            setFlags: {
              brine_lark_clerk_approach_considered: true,
            },
            setVars: {
              current_goal: "set_brine_lark_clerk_cover",
            },
          },
        },
      ],
    },
    {
      id: "node_brine_lark_clerk_approach_plan",
      text: "Mira answers quietly. \"Do not crowd him and do not ask about the bundle. A receiving clerk expects tally questions, dock confusion, and people looking for the morning manifests. So give him one of those. Stay near the loading lanes after first bell, look like someone trying to confirm where a crate line was logged, and let him decide whether to brush you off or redirect you. Either answer tells us which authority he thinks he is protecting.\"",
      choices: [
        {
          id: "adopt_a_manifest_pretext_to_sound_out_the_clerk",
          text: "Use a manifest question as cover to sound out the clerk",
          nextNodeId: "node_brine_lark_clerk_cover_set",
          effects: {
            setFlags: {
              brine_lark_manifest_pretext_prepared: true,
            },
            setVars: {
              current_goal: "approach_brine_lark_clerk_under_cover",
            },
          },
        },
      ],
    },
    {
      id: "node_brine_lark_clerk_cover_set",
      text: "That gives you a way in that fits the docks instead of fighting them. You are not chasing the runner anymore; you are preparing to brush the receiving point from the side, under a question the clerk should be able to answer without alarm if he is clean. If he is not, the shape of his evasion becomes the next clue.",
      choices: [
        {
          id: "approach_the_clerk_with_the_manifest_question",
          text: "Approach the clerk with the manifest question",
          nextNodeId: "node_brine_lark_clerk_first_reaction",
          effects: {
            setFlags: {
              brine_lark_clerk_approached_under_cover: true,
            },
            setVars: {
              current_goal: "read_brine_lark_clerk_reaction",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_clerk_first_reaction",
      text: "You ask where a crate line was entered on the morning manifests, keeping your tone flat and forgettable. The clerk barely looks at you before answering too quickly: \"Upper tally board. Ask there.\" But the words land wrong. His hand closes over the wrapped bundle at his side before he turns, and his eyes flick not toward the tally board, but toward the ledger alcove behind the loading posts. It is not a clean dismissal. It is the reflex of someone trying to push attention away from the place that matters first.",
      choices: [
        {
          id: "ask_if_the_ledger_alcove_is_the_real_lead",
          text: "Ask Mira if the ledger alcove is the real lead to follow",
          nextNodeId: "node_brine_lark_ledger_alcove_lead",
          effects: {
            setFlags: {
              brine_lark_ledger_alcove_suspected: true,
            },
            setVars: {
              current_goal: "follow_brine_lark_ledger_alcove_lead",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_ledger_alcove_lead",
      text: "Mira does not even glance at the upper tally board. \"Yes. Not because he looked there, but because he made sure you would not. A practiced liar sends you toward noise. A worried clerk shields the quiet place that actually matters. If Brine Lark's chain touches paper after the handoff, that ledger alcove is where the route stops being motion and becomes record. Follow that seam next.\"",
      choices: [
        {
          id: "commit_to_follow_the_ledger_alcove_seam",
          text: "Follow the ledger alcove seam next",
          nextNodeId: "node_brine_lark_ledger_alcove_marked",
          effects: {
            setFlags: {
              brine_lark_ledger_alcove_marked: true,
            },
            setVars: {
              current_goal: "inspect_brine_lark_ledger_alcove",
            },
          },
        },
      ],
    },
    {
      id: "node_brine_lark_ledger_alcove_marked",
      text: "The route has narrowed again. What began as a moving handoff now points toward a fixed paper point behind the loading posts. If the receiving clerk was trying to keep your eyes off that alcove, then whatever sits there is closer to Brine Lark's working record than anything you have touched so far.",
      choices: [
        {
          id: "inspect_the_ledger_alcove_for_any_paper_trace",
          text: "Inspect the ledger alcove for any paper trace",
          nextNodeId: "node_brine_lark_ledger_alcove_trace",
          effects: {
            setFlags: {
              brine_lark_ledger_alcove_inspected: true,
            },
            setVars: {
              current_goal: "recover_brine_lark_ledger_trace",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_ledger_alcove_trace",
      text: "Inside the alcove, most of the shelves hold ordinary harbor tallies gone soft with salt. But tucked behind a warped board you find something different: a damp torn ledger edge wrapped around a duplicate cargo tag stub. The handwriting is clipped and coded rather than clerical, and one short column repeats the same tide-mark symbol you saw in the warehouse chalk. It is not enough to map the whole chain, but it proves the alcove was used to convert Brine Lark's moving handoffs into written trace before the paper was stripped away.",
      choices: [
        {
          id: "ask_which_mark_on_the_torn_ledger_matters_most",
          text: "Ask Mira which mark on the torn ledger matters most",
          nextNodeId: "node_brine_lark_repeated_tag_pattern",
          effects: {
            setFlags: {
              brine_lark_torn_ledger_reviewed: true,
            },
            setVars: {
              current_goal: "identify_brine_lark_tag_pattern",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_repeated_tag_pattern",
      text: "Mira taps the torn edge with one finger. \"Not the symbol by itself. This.\" Three entries on the damp scrap carry different shorthand notes, but each of them repeats the same cargo tag suffix in the same cramped hand, as if one tag number was being copied forward across separate movements. \"Harbor clerks log what arrived once,\" she says. \"They do not keep re-threading the same tag through unrelated lines unless someone is using the paper to preserve continuity across handoffs. That repeated suffix is the first real sign that Brine Lark's route is being stitched together on purpose, not just passed along by habit.\"",
      choices: [
        {
          id: "ask_if_the_scrap_points_toward_any_destination",
          text: "Ask if the scrap points toward any destination at all",
          nextNodeId: "node_brine_lark_partial_destination_mark",
          effects: {
            setFlags: {
              brine_lark_destination_hint_reviewed: true,
            },
            setVars: {
              current_goal: "identify_brine_lark_destination_hint",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_partial_destination_mark",
      text: "Mira turns the torn scrap toward the light and narrows her eyes at a water-blurred notation near the repeated tag suffix. Most of it is gone, but not all: the final strokes read like a dockside routing mark, something between a place-name and a handling note. \"Not an address,\" she says, \"but a receiving zone. Outer posts, east side... or whatever their people call that strip now. It is only a fragment, but it tells us this chain does not end at the warehouse clerk. After the paper point, the tag keeps moving toward the outer mooring line.\"",
      choices: [
        {
          id: "check_whether_outer_mooring_line_is_a_real_node",
          text: "Check whether the outer mooring line is a real receiving point",
          nextNodeId: "node_brine_lark_outer_mooring_line_confirmed",
          effects: {
            setFlags: {
              brine_lark_outer_mooring_line_checked: true,
            },
            setVars: {
              current_goal: "verify_outer_mooring_line_node",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_mooring_line_confirmed",
      text: "At the east-side outer posts, the harbor feels thinner and less watched than the warehouse lanes. Most of the mooring rings are bare, but one bollard carries a tar-stiff loop of tag cord marked with the same tide-sign you found in the chalk and on the torn ledger edge. Nearby, a shallow crate scrape cuts across the planks toward the waterline, too narrow for normal unloading but exactly the sort of short transfer mark a hidden receiving zone would leave behind. It is not much, but it is enough. The outer mooring line is not a blurred rumor from damaged paper. It is a real node in Brine Lark's route.",
      choices: [
        {
          id: "study_how_the_outer_posts_are_being_used",
          text: "Study how the outer posts are being used",
          nextNodeId: "node_brine_lark_outer_mooring_line_role",
          effects: {
            setFlags: {
              brine_lark_outer_mooring_line_observed: true,
            },
            setVars: {
              current_goal: "determine_outer_mooring_line_role",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_mooring_line_role",
      text: "You stay long enough to watch the rhythm of the place instead of the objects alone. Nothing here settles like a destination. No stack remains in place, no crew lingers to sort, and no ledger runner comes to reconcile a lasting load. What you do see is shorter than that: brief waits, quiet hand shifts, and signs that marked cargo pauses here only long enough to be matched, re-tagged, or turned outward again. Mira watches the waterline a moment longer before speaking. \"Not an endpoint,\" she says. \"And not just a dead drop either. This is a buffer seam. Things arrive here to lose one identity and leave with another. If Brine Lark's line reaches this far, the outer mooring line is where the route sheds its harbor skin before the next transfer.\"",
      choices: [
        {
          id: "ask_what_the_outer_mooring_line_reveals_next",
          text: "Ask what the outer mooring line reveals next",
          nextNodeId: "node_brine_lark_outer_mooring_transfer_window",
          effects: {
            setFlags: {
              brine_lark_outer_mooring_line_interpreted: true,
            },
            setVars: {
              current_goal: "identify_outer_mooring_transfer_window",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_mooring_transfer_window",
      text: "Mira studies the tide pull around the outer posts, then points to the scrape marks and the bare bollards in turn. \"There. That is the next object, not a person. See how nothing stays tied long enough to weather a full turn, but the marks all cluster around the same narrow lull between harbor drift and outbound pull?\" She lets the thought settle before continuing. \"This place does not name the next carrier. It names the next window. If Brine Lark's route sheds one identity here, it does it on the slack-water turn just after dusk, when the outer line can hand something off without looking like a departure or an arrival. That transfer window is the first stable thing this node gives us.\"",
      choices: [
        {
          id: "keep_watch_on_the_outer_line_at_slack_water",
          text: "Keep watch on the outer line at the slack-water turn",
          nextNodeId: "node_brine_lark_outer_mooring_transfer_activity",
          effects: {
            setFlags: {
              brine_lark_outer_mooring_window_watched: true,
            },
            setVars: {
              current_goal: "confirm_outer_mooring_transfer_activity",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_mooring_transfer_activity",
      text: "You return just after dusk and hold through the slack-water turn without moving too close to the posts. The harbor quiets for a few breaths, and in that lull the pattern finally shows itself: not a single dramatic exchange, but the same compact motion repeated twice over the turn. A marked bundle arrives under one set of hands, pauses only long enough for a short check and a cord change, then leaves the line under another set before the tide fully takes hold again. That is enough to settle it. The window is real, and the transfer behavior is repeatable.",
      choices: [
        {
          id: "ask_mira_what_kind_of_transfer_this_really_is",
          text: "Ask Mira what kind of transfer this really is",
          nextNodeId: "node_brine_lark_identity_swap_pattern",
          effects: {
            setFlags: {
              brine_lark_transfer_pattern_reviewed: true,
            },
            setVars: {
              current_goal: "identify_outer_mooring_transfer_pattern",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_identity_swap_pattern",
      text: "Mira answers almost at once. \"Not a cargo handoff in the ordinary sense. Look at what changes and what does not. The bundle barely moves, the pause is too short for sorting, and the only deliberate act in the middle is the cord change. That means the route is not moving weight here. It is moving identity.\" She gestures toward the posts. \"Brine Lark's people are using the outer line to strip one marker set and fasten another before the bundle continues. It is a tag-and-cord swap, not a true unload. The object leaving this seam is materially the same, but administratively it becomes something else.\"",
      choices: [
        {
          id: "ask_what_identity_the_bundle_leaves_with",
          text: "Ask what identity the bundle leaves with",
          nextNodeId: "node_brine_lark_outer_marker_set",
          effects: {
            setFlags: {
              brine_lark_identity_swap_interpreted: true,
            },
            setVars: {
              current_goal: "identify_outer_marker_set",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_marker_set",
      text: "Mira watches the cord in your memory rather than the bundle itself. \"That is the next object, then. Not the carrier. Not the cargo. The marker set.\" She explains that the outer line is not replacing one random tag with another, but shifting the bundle into a leaner external code: dark tar cord, a clipped twin-knot near the seal, and a short shell-white thread worked through the wrap where a harbor tally would normally sit. \"That combination is not for warehouse hands,\" she says. \"It is meant for people beyond the inner docks who need to recognize passage without reading a ledger. If we want the next layer after Brine Lark's swap, this outer marker set is the first stable identity the route gives us.\"",
      choices: [
        {
          id: "watch_who_reacts_to_the_outer_marker_set",
          text: "Watch who reacts when that outer marker set appears",
          nextNodeId: "node_brine_lark_outer_marker_reaction",
          effects: {
            setFlags: {
              brine_lark_outer_marker_set_interpreted: true,
            },
            setVars: {
              current_goal: "identify_outer_marker_reaction",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_marker_reaction",
      text: "You do not announce the pattern aloud. Instead, you and Mira let the outer marker set surface at the edge of ordinary harbor traffic and watch for the smallest break in routine. Most eyes slide over it. Stevedores see only another wrapped bundle. Ledger clerks keep asking for tallies. But along the fringe beyond the inner docks, a narrower reaction repeats. The tide-stair runners and outer-line hand carriers are the ones who falter for half a breath when they catch the dark tar cord, the clipped twin-knot, and the shell-white thread together. One steps aside without demanding a mark. Another changes his question midway through, abandoning cargo terms for route terms. A third takes over a handoff already in motion, as if the bundle has just declared what kind of passage it belongs to. Mira notes the pattern quietly. \"Good. That gives us our first candidate class. Not warehouse labor. Not harbor clerks. The people reacting are the outer-edge receiving hands—the ones who move things onward once they have already slipped past formal counting.\"",
      choices: [
        {
          id: "test_which_of_them_reads_the_marker_set_without_prompt",
          text: "Keep watching to see which of them can read the marker set without prompt",
          nextNodeId: "node_brine_lark_outer_marker_first_reader",
          effects: {
            setFlags: {
              brine_lark_outer_marker_reaction_observed: true,
            },
            setVars: {
              current_goal: "identify_outer_marker_first_reader",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_marker_first_reader",
      text: "On the next watch, you stop looking for mere recognition and start looking for confidence. The difference shows quickly. Some of the outer-edge hands only mirror one another: if someone ahead of them has already shifted stance, they follow; if a route question is spoken first, they nod along; if no cue is given, they hesitate and wait for confirmation. Those are not your first readers. Then the steadier pattern appears. A smaller subset of receiving hands does not wait for ledger, password, or example. They see the dark tar cord, register the clipped twin-knot and shell-white thread, and act as though the bundle has already been classified. One redirects it to the outer side of the steps before anyone speaks. Another waves off a tally check that would delay the pass. A third accepts temporary custody, not because he knows the carrier, but because the marker set alone tells him the bundle belongs to a continuing outer-route movement. Mira keeps her voice low. \"There. That is the distinction we needed. Plenty can recognize the sign once the moment has started. But the first readers are the outer-route receiving hands who can make the route decision from the marker set itself. They are not just informed. They are the ones assigned to read passage at first contact.\"",
      choices: [
        {
          id: "follow_where_the_first_readers_consistently_push_the_route",
          text: "Follow where the first readers consistently push the route next",
          nextNodeId: "node_brine_lark_outer_marker_downstream_node",
          effects: {
            setFlags: {
              brine_lark_outer_marker_first_reader_identified: true,
            },
            setVars: {
              current_goal: "identify_outer_marker_downstream_node",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_outer_marker_downstream_node",
      text: "Once you stop tracking the hands and start tracking the push they create, the route narrows fast. The same first readers do not send marked bundles into the general dock maze, and they do not hold them long. Again and again, their decisions bend movement toward one unremarkable place behind the customs sheds: a narrow stone descent to the water that only matters at the right tide. A bundle marked with the dark tar cord and shell-white thread is not merely recognized there—it is expected there. You watch one first reader intercept a pass, glance once at the clipped twin-knot, and redirect the carrier with two fingers toward the lower steps without a word. Another refuses a pause on the open quay and waits instead for the tide to settle against the stone. Mira follows the line of motion and nods. \"That is our next concrete object. Not just a kind of person, and not just a kind of act. A place. The Customs Tide Stairs. The first readers are using the marker set to push outer-route traffic into that descent point. If we want the next layer after the reader, we watch the stairs.\"",
      choices: [
        {
          id: "watch_what_happens_at_the_customs_tide_stairs_on_the_right_tide",
          text: "Watch what happens at the Customs Tide Stairs on the right tide",
          nextNodeId: "node_brine_lark_customs_tide_stairs_activity",
          effects: {
            setFlags: {
              brine_lark_customs_tide_stairs_identified: true,
            },
            setVars: {
              current_goal: "observe_customs_tide_stairs_activity",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_customs_tide_stairs_activity",
      text: "You take position above the Customs Tide Stairs and wait for the tide to reach the same narrow height Mira marked against the stone. When the water finally steadies there, the pattern is subtler than a handoff and more disciplined than a delay. Marked bundles are brought down quickly, but they are not argued over, opened, or carried onward at once. Instead, each is set for only a few breaths into the same sheltered notch beside the lower steps, where a tar-dark loop has been fixed just above the wash line. One receiving hand checks the marker set, threads the loop through the wrap, and leaves the bundle hanging clear of the water but below easy view from the quay. No ledger appears. No password is spoken. The point of the stairs is not storage and not final delivery. It is a tide-timed holding point: a place to suspend outer-route traffic just long enough for the next movement to claim it from water level. Mira watches the repeated motion twice before she speaks. \"There it is. The first stable behavior at the stairs is not exchange in the open. It is short-term staging—pressure held against the tide, out of sight, ready for immediate pickup. The stairs are a controlled pause in the route. If we keep going, the next question is who claims from below.\"",
      choices: [
        {
          id: "watch_who_claims_the_bundles_from_below_the_stairs",
          text: "Watch who claims the bundles from below the stairs",
          nextNodeId: "node_brine_lark_waterline_receiver",
          effects: {
            setFlags: {
              brine_lark_customs_tide_stairs_activity_observed: true,
            },
            setVars: {
              current_goal: "identify_waterline_receiver",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_waterline_receiver",
      text: "You hold your position through the next tide cycle and force yourself to watch the waterline rather than the stairs. The claim comes so cleanly you almost miss it. No dock porter descends from above. No customs man emerges from the sheds. Instead, a flat, dark skiff noses in below the stone lip with muffled oars and barely enough profile to catch the harbor glow. It never ties up fully. One person keeps the craft pressed into place with a boat hook while another reaches up from the stern well, feels for the tar-dark loop, and frees the hanging bundle in one practiced motion. They do not inspect the carrier above, and they do not ask for confirmation. The marker set and the prepared staging point are enough. The whole claim lasts only seconds before the skiff slides back into the black water along the outer wall. Mira waits until the ripples flatten. \"Good. Now we have the receiver class. Not a man on the stairs, but a waterline pickup crew—small skiff hands working below sightline, timed to the tide. The stairs do not end the route. They hand it down to the low-profile boats that can move under the customs edge without presenting as a dock transfer. If we keep going, the next question is not just where the skiff vanishes, but what stable behavior happens where it drops out of harbor sight.\"",
      choices: [
        {
          id: "watch_what_happens_where_the_waterline_skiff_disappears",
          text: "Watch what happens where the waterline skiff disappears from sight",
          nextNodeId: "node_brine_lark_breaker_culvert_activity",
          effects: {
            setFlags: {
              brine_lark_waterline_receiver_identified: true,
            },
            setVars: {
              current_goal: "observe_breaker_culvert_activity",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_skiff_downstream_node",
      text: "You and Mira stop thinking like dock watchers and start tracing the skiff's first safe line instead. From the stairs, the boat does not strike for open water, and it does not angle toward any ordinary berth. It hugs the harbor wall under the customs shadow, slips past the brighter lanes, and disappears for a moment where the masonry breaks beneath an old storm outlet. The route repeats on the next tide, and on the one after that. Each time, the skiff's first stable destination is the same low arch half-hidden by weed-dark stone and backwash. It is not a final market and not a full landing. It is a covert water gate: a place where a boat can vanish from harbor sight before deciding where the bundle goes next. Mira watches the black opening until another wave folds over it. \"There. That is the next node. Breaker Culvert. The skiffs are not taking from the stairs straight into the open chain. They first sink the route into that culvert, where the transfer drops out of normal harbor visibility. If we want the next layer after the pickup crew, we watch the culvert mouth.\"",
      choices: [
        {
          id: "watch_what_happens_at_the_breaker_culvert_mouth",
          text: "Watch what happens at the Breaker Culvert mouth",
          nextNodeId: "node_brine_lark_breaker_culvert_activity",
          effects: {
            setFlags: {
              brine_lark_skiff_downstream_node_identified: true,
            },
            setVars: {
              current_goal: "observe_breaker_culvert_activity",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_breaker_culvert_activity",
      text: "The next watch is the hardest yet, because almost nothing visible happens unless you already know where to look. The skiff slips into the Breaker Culvert shadow and does not emerge at once. For several breaths the arch mouth shows only backwash and weed. Then a hooded lamp glints once deep inside—too dim for signaling at distance, bright enough to mark a confined handoff point. When the skiff edges back into view, the bundle is no longer hanging where it was taken aboard, but it has not been carried onward into the harbor either. You catch the same sequence twice more before trusting it: inside the culvert, the pickup crew pauses just long enough for a second pair of hands to verify the outer marker set by touch and position, settle the bundle into a different hold, and prepare it for the next movement under deeper cover. No bargaining, no unpacking, no spoken challenge. Mira draws the line immediately. \"So the culvert is not a destination. It is a concealed transfer chamber. The first stable behavior here is marker confirmation under cover, followed by a load shift. The route comes in on the skiff we can see, then is re-seated for whatever can carry it farther without exposing the stairs connection. If we keep going, the next question is what kind of carrier the culvert sends out.\"",
      choices: [
        {
          id: "watch_what_kind_of_carrier_leaves_the_culvert",
          text: "Watch what kind of carrier leaves the culvert next",
          nextNodeId: "node_brine_lark_culvert_carrier",
          effects: {
            setFlags: {
              brine_lark_breaker_culvert_activity_observed: true,
            },
            setVars: {
              current_goal: "identify_culvert_carrier",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_culvert_carrier",
      text: "On the following tide, you ignore the skiff entirely and hold on the culvert mouth until your eyes adjust to the layered dark. That is when the distinction finally resolves. The craft that leaves after the hidden load shift is not the same one that entered. The broad little pickup skiff backs out light and empty, still suited for quick waterline work near the stairs. The bundle itself departs later, deeper in shadow, aboard a narrower carrier that rides lower and quieter: a hand-poled punt with its load settled almost flush to the boards beneath a drab cover mat. It shows barely any profile above the wash, and where oars would flash, it moves by short controlled pushes better suited to stone edges, culvert channels, and shallow sidewater. You catch the same change twice more before Mira lets herself conclude. \"There. That is the next carrier class. The stairs use a skiff to claim. The culvert converts the route into a narrow punt for concealment and shallow passage. That means this node is doing more than hiding the transfer—it is selecting the transport mode for the next environment. If we follow further, we should stop asking who touched the bundle and start asking what stable behavior appears once that punt reaches the reed-cut.\"",
      choices: [
        {
          id: "watch_what_the_culvert_punt_consistently_does_in_reedway_cut",
          text: "Watch what the culvert punt consistently does in Reedway Cut",
          nextNodeId: "node_brine_lark_reedway_cut_activity",
          effects: {
            setFlags: {
              brine_lark_culvert_carrier_identified: true,
            },
            setVars: {
              current_goal: "observe_reedway_cut_activity",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_punt_waterway_node",
      text: "Once you start reading the punt by the water it refuses, the answer emerges quickly. It does not angle for the harbor lanes, where even shuttered movement would force wider turns. It does not seek deeper outbound current either. Instead, each departure from Breaker Culvert bends toward the margin where stone gives way to black mud and broken reed. The punt keeps to water too shallow and constricted for the skiff that fed it, gliding by pole through a slit of sidewater that only shows itself at the right tide and angle of moonlight. You and Mira trace the route twice more from separate vantage points before she commits to the name. \"Not open channel. Not quay water. A reed-cut. That's what this carrier is for.\" She points toward the dim line beyond the wall. \"Reedway Cut. The punt is built to push the route into shallow sidewater where ordinary harbor craft stop being useful. That makes this our next stable node—not a destination yet, but the next environment the chain depends on.\"",
      choices: [
        {
          id: "watch_what_the_punt_consistently_does_inside_reedway_cut",
          text: "Watch what the punt consistently does inside Reedway Cut",
          nextNodeId: "node_brine_lark_reedway_cut_activity",
          effects: {
            setFlags: {
              brine_lark_punt_waterway_node_identified: true,
            },
            setVars: {
              current_goal: "observe_reedway_cut_activity",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_reedway_cut_activity",
      text: "From a distance, Reedway Cut looks like dead water and broken growth. Up close, under the right tide and with enough patience, it reveals a pattern more deliberate than drift. The punt does not carry straight through. It enters the reed-shadow, noses sideways into the same shallow pocket of mud-banked water, and settles there almost flush with the bank where hanging reed mats break its outline. No one calls out. No lantern is raised. Instead, the crew lowers the punt's profile even further, drawing a dark netted screen and loose cut reeds across the exposed edge until hull and cargo blur into the bank itself. The bundle is not unloaded, but neither is it kept ready for immediate movement. It is hidden in place, moored in living cover for a short interval while the route goes quiet around it. Mira watches the disguise take shape before whispering her conclusion. \"So this is the first stable behavior here. Reedway Cut is a concealment berth. The punt comes in, buries itself in the reeds, and lets the route disappear without actually stopping. Not transfer yet—submergence. If we keep going, the next question is what wakes the hidden punt back into motion.\"",
      choices: [
        {
          id: "watch_what_stably_triggers_the_hidden_punt_to_move_again",
          text: "Watch what stably triggers the hidden punt to move again",
          nextNodeId: "node_brine_lark_reedway_cut_release_trigger",
          effects: {
            setFlags: {
              brine_lark_reedway_cut_activity_observed: true,
            },
            setVars: {
              current_goal: "identify_reedway_cut_release_trigger",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_reedway_cut_release_trigger",
      text: "You return determined not to chase the boat itself, but the moment before it ceases to be part of the bank. That moment proves narrower than you expected. The hidden punt does not wake simply because time passes. It waits through one usable stretch of water without moving, then stirs only when two conditions align. First, the ebb pulls just enough water off the mud line to expose a slick rib of darker bank beyond the reed pocket, opening a shallow exit the heavier skiff could never use. Second, from farther inland than the cut itself, a brief hooded reflection flashes once across the water—too small to guide a stranger, too consistent to be chance. Only then do the reed screens shift. The crew clears the punt in practiced silence, turns it by pole, and lets it slide out on the thinning water as if the bank itself had released it. Mira keeps her eyes on the dim line where the flash came from. \"Good. That's a stable release condition. Not a shouted summons and not tide alone. The route waits for a specific ebb threshold, then answers a single masked light cue from inland. So the hidden berth is governed from farther in, but only when the water makes passage possible. If we follow this further, the next object is not the punt. It's the inland point that issues that release signal.\"",
      choices: [
        {
          id: "trace_where_the_masked_inland_light_consistently_originates",
          text: "Trace where the masked inland light consistently originates",
          nextNodeId: "node_brine_lark_inland_release_signal_node",
          effects: {
            setFlags: {
              brine_lark_reedway_cut_release_trigger_identified: true,
            },
            setVars: {
              current_goal: "identify_inland_release_signal_node",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_inland_release_signal_node",
      text: "You and Mira spend the next watch ignoring the punt entirely and triangulating the flash instead. From the cut it seems formless, just a blink on wet air. From the bank above, and again from a second angle inland, the line tightens. The reflection does not come from a moving watcher pacing the reeds. It returns, each time, from the same low rise beside an old sluice run where broken wicker screens and storm-thrown brush have been piled until they resemble marsh wreckage. Only when the hooded light answers the ebb do you finally see the structure hidden inside the ruin: a cramped shelter with just enough slit-space to send one masked gleam down the cut without exposing its keeper to the harbor side. Mira studies the dark shape a long moment before naming it. \"There. That's the node. A signal blind built on the old sluice line.\" She lowers her voice further. \"Sluice Blind. The release cue isn't wandering personnel or chance line-of-sight. It's being issued from a fixed inland observation point that can read both water level and route timing. If we push further, the next question is not the operator's face, but what larger control node that blind answers to.\"",
      choices: [
        {
          id: "watch_what_larger_control_node_the_sluice_blind_answers_to",
          text: "Watch what larger control node the Sluice Blind answers to",
          nextNodeId: "node_brine_lark_sluice_control_node",
          effects: {
            setFlags: {
              brine_lark_inland_release_signal_node_identified: true,
            },
            setVars: {
              current_goal: "identify_sluice_control_node",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_sluice_blind_operator",
      text: "The next time you watch the blind, you stop treating the signal as a flash and start treating it as labor. Whoever works that slit is not merely waving a lamp. The same figure arrives early enough to read the bank before the cue matters, keeps low through the reeds instead of pacing the rise, and spends more time studying water height and cut geometry than watching the harbor behind. When the moment comes, the signal itself is almost incidental: one controlled gleam, then immediate stillness, as if the real work happened in the waiting and measurement beforehand. You never get a clean face, but you do get the pattern. This is not a courier, not a guard, and not a casual lookout. Mira murmurs the distinction once she sees it repeat. \"The blind is being run by a tide reader—someone assigned to judge when the inner water can safely release the route. More specifically, a sluice watcher. The lamp is only the last motion. Their real function is to translate water state into route timing. That gives us the operator class, even if not the name. If we keep going, the next question is who that sluice watcher answers to.\"",
      choices: [
        {
          id: "watch_who_the_sluice_watcher_answers_to",
          text: "Watch who the sluice watcher answers to",
          nextNodeId: "node_brine_lark_sluice_control_node",
          effects: {
            setFlags: {
              brine_lark_sluice_blind_operator_identified: true,
            },
            setVars: {
              current_goal: "identify_sluice_control_node",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_sluice_control_node",
      text: "The sluice watcher does not act alone. You learn this when you shift your focus from the blind to the marsh behind it. The same tide reader leaves the signal post not to return to the harbor, but to vanish into a low brick structure half-sunk into the bank, barely taller than the reeds and with only a single smoke vent visible above the growth. There is no formal shift change, but the watcher is relieved by another figure who then takes up the same post by the cut. Both carry the same small slate with tide marks and route symbols. One morning you see a chart posted inside the control house window, showing water-level thresholds and route timing for the entire Reedway Cut system—marked not with days, but with tidal windows and marker set patterns. Mira studies the building's smoke line and the chart behind its glass. \"So that is the node. A sluice control house. The blind operator answers to whoever runs that house. They don't just judge water; they read the full slate of route conditions before deciding when to release. If we follow further, we need to see who occupies that control center.\"",
      choices: [
        {
          id: "watch_who_stably_controls_the_sluice_house_operations",
          text: "Watch who stably controls the Sluice House operations",
          nextNodeId: "node_brine_lark_sluice_house_controller",
          effects: {
            setFlags: {
              brine_lark_sluice_control_node_identified: true,
            },
            setVars: {
              current_goal: "identify_sluice_house_controller",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_sluice_house_controller",
      text: "You spend a full cycle watching the control house instead of the cut. The sluice watcher comes and goes, but the house itself is always occupied by a single figure who never emerges into the open. They appear only at the window where the chart is posted, sometimes adjusting the tide marks, sometimes consulting a ledger, sometimes just watching the reed-cut through a small pane of glass. The pattern holds across several watches: when the sluice watcher needs guidance, they return to the house for a brief consultation at the window, then leave with updated instructions. The controller does not shout. They do not carry the slate themselves. They stay behind the glass, making marks and watching the marsh while the tide reader does the fieldwork. Mira watches the silent division of labor before speaking. \"There it is. The blind operator answers to the sluice master—the one who reads the full slate and gives the release window. Not a guard, not a clerk, not a lookout. A marsh controller. That means the control house is not just a shelter. It is the decision node for the entire Reedway Cut line. If we follow further, we need to see where that marsh controller gets their own orders from.\"",
      choices: [
        {
          id: "watch_who_the_marsh_controller_answers_to",
          text: "Watch who the marsh controller answers to",
          nextNodeId: "node_brine_lark_marsh_control_node",
          effects: {
            setFlags: {
              brine_lark_sluice_house_controller_identified: true,
            },
            setVars: {
              current_goal: "identify_marsh_control_node",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_marsh_control_node",
      text: "You shift your vantage point to the rise behind the control house, where the marsh rises higher and offers a view of the entire system. From this angle, you see the marsh controller is not the last word. They leave the house not to enter the open marsh, but to ascend a camouflaged tower built into the rise, barely visible until its single lamp flares at dusk. From there, the controller can see not just the Reedway Cut, but the wider marsh system—the sluice lines, the reedways, and even the distant harbor wall. When the tide changes or the route shifts, the controller returns to the tower, where a network of signal lines runs down from its peak to the control house below. You watch one sequence: a flare from the tower, a moment where the controller consults a higher chart, then a new instruction passed back to the house. Mira traces the signal line with her finger. \"So that is the next node. A marsh control tower. The sluice master answers to whoever watches from that tower. They don't just read the full slate—they read the entire marsh system. That means the tower is the true hub for this entire inland water route. If we follow further, we need to see who occupies that tower.\"",
      choices: [
        {
          id: "watch_who_stably_controls_the_marsh_tower_operations",
          text: "Watch who stably controls the Marsh Tower operations",
          nextNodeId: "node_brine_lark_marsh_warden",
          effects: {
            setFlags: {
              brine_lark_marsh_control_node_identified: true,
            },
            setVars: {
              current_goal: "identify_marsh_warden",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_marsh_warden",
      text: "You spend a full tide cycle watching the tower rather than the control house. The marsh controller goes up and comes down, but the tower itself is always occupied by a single figure who never descends to the lower levels. They appear only at the peak observation window, where a larger chart is posted—not just for the Reedway Cut, but for multiple sluice lines, reedway branches, and even harbor-side points. When a decision is needed, the controller from the house ascends to consult that figure; the tower operator marks something on the chart, then sends the instruction back down. The division of labor is strict: the house reads the local system, but the tower reads the whole route network. Mira studies the operator through the glass. \"There it is. The marsh controller answers to the marsh warden—the one who coordinates multiple water lines, not just one cut. Not a tide watcher, not a local dispatcher. A route coordinator. That means the tower is not just an observation point. It is the command node for the entire inland marsh route system. If we follow further, we need to see where that warden gets their own orders from.\"",
      choices: [
        {
          id: "watch_who_the_marsh_warden_answers_to",
          text: "Watch who the marsh warden answers to",
          nextNodeId: "node_brine_lark_harbor_signal_point",
          effects: {
            setFlags: {
              brine_lark_marsh_warden_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_signal_point",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_signal_point",
      text: "You shift your vantage point to the harbor wall above the customs sheds, where signal lines run inland from a low observation post barely visible among the building ledges. From there, you see the marsh warden is not the final word either. The tower operator ascends only to consult that figure when decisions affect both marsh routes and harbor movements; they mark something on the chart at the wall, then relay it back down the signal lines. The division of labor now extends beyond local versus network: the tower reads the inland system, but the wall post coordinates with harbor-side traffic. Mira studies the operator through a slit in the customs building's rear wall. \"So that is the next node. A harbor signal point. The marsh warden answers to whoever watches from there. They don't just coordinate multiple water lines—they connect marsh routes to harbor movements. That means this post is not just an observation station. It is the interface between inland marsh routes and harbor-side operations. If we follow further, we need to see who occupies that signal point.\"",
      choices: [
        {
          id: "watch_who_stably_coordinates_harbor_signal_point_operations",
          text: "Watch who stably coordinates the Harbor Signal Point operations",
          nextNodeId: "node_brine_lark_harbor_coordinator",
          effects: {
            setFlags: {
              brine_lark_harbor_signal_point_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_coordinator",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_coordinator",
      text: "You stop treating the signal point as a structure and start treating it as a desk with a view. The watchers on the wall come and go, and the marsh warden's instructions arrive and depart, but one figure remains in the rear room behind the slit windows overlooking both the customs sheds and the outer lanes. They never handle the marsh signal lines directly. Instead, they work over a larger harbor chart where inland route marks are laid across ordinary traffic movements, berth usage, and guard sightlines. When the marsh warden sends up a condition change, this figure does not merely pass it on. They compare it against harbor movement, delay one release, accelerate another, and mark narrow windows where marsh traffic can surface without colliding with visible dock routine. Mira watches the pattern settle before naming it. \"There. That is the operator class at this layer. A harbor coordinator. Not a marsh warden and not a dock clerk. The person in that post translates inland route timing into harbor-safe movement. That makes Harbor Signal Point an interface desk, and this figure the route master for marsh-to-harbor passage. If we keep going, the next question is who provides the harbor coordinator with the authority to alter those windows.\"",
      choices: [
        {
          id: "watch_who_grants_the_harbor_coordinator_authority_over_windows",
          text: "Watch who grants the harbor coordinator authority over those windows",
          nextNodeId: "node_brine_lark_harbor_authority_node",
          effects: {
            setFlags: {
              brine_lark_harbor_coordinator_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_authority_node",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_authority_node",
      text: "The coordinator's chart tells you where to look next: not outward toward the lanes, but upward toward the rooms where routine becomes instruction. Over several watches you see the same pattern. The coordinator does not invent harbor windows from scratch. At key intervals, a runner carries up a folded slip from a shuttered office above the customs sheds, and when that slip arrives, berth markings, patrol gaps, and lane tolerances on the coordinator's chart suddenly become actionable rather than provisional. The room itself stays dark from the quay side, but from a higher angle you catch ledger shelves, roster boards, and a lamp hooded over a narrow planning table. Mira does not rush the conclusion. \"There. That is the authority node. A harbor window office. The coordinator can translate marsh timing into harbor-safe movement, but this office is what turns translation into permission. It sits where ordinary harbor routine can be quietly rewritten before anyone below experiences it as routine. If we keep going, the next question is what higher command receives those rewritten windows and turns them into route-level scheduling.\"",
      choices: [
        {
          id: "watch_which_higher_command_receives_the_harbor_windows",
          text: "Watch which higher command receives the Harbor Window Office output",
          nextNodeId: "node_brine_lark_harbor_command",
          effects: {
            setFlags: {
              brine_lark_harbor_authority_node_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_command",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_window_clerk",
      text: "You stop looking for rank and start looking for repetition. The office receives messengers, ledgers, and berth tallies from several directions, but only one figure remains seated at the hooded table through every shift change. They do not inspect the quay and they never go down to the signal point. Instead they compare patrol intervals against docking rosters, scratch out one harmless-looking revision, then send back a slip that transforms a narrow coincidence into an official harbor window. What matters is not volume but discretion. The same hand decides which delays can be explained, which berths can be made to look busy, and which empty lane can be made to seem routine for half an hour. Mira watches the pattern settle and gives it its proper shape. \"There. Not a harbor master, and not a mere scribe. A window clerk—more precisely, a harbor scheduler. The coordinator below translates route timing into harbor movement, but this desk decides which pieces of visible routine can be bent without attracting scrutiny. That makes the office a permissions desk, and this figure the one who quietly edits reality until smuggling can pass as ordinary traffic. If we keep going, the next question is who authorizes the scheduler to bend official routine in the first place.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_harbor_scheduler_to_bend_routine",
          text: "Watch who authorizes the harbor scheduler to bend routine",
          nextNodeId: "node_brine_lark_harbor_master",
          effects: {
            setFlags: {
              brine_lark_window_clerk_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_master",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_master",
      text: "The office receives its instructions from a single source, but the channel is not through runners or signal lines. It arrives as a brief note pinned to the door in plain sight, signed with a seal that looks like routine administration rather than covert command. The harbor scheduler does not ask questions about these notes; they treat them as administrative directives and adjust the roster accordingly. From your vantage point above the customs sheds, you catch glimpses of a Harbor Master's office: a desk covered in patrol maps, berth assignments, and customs manifests that overlap with marsh route charts. When a new note arrives, the scheduler does not merely copy it; they cross-reference it against harbor movements, then mark which windows are now approved for covert passage. Mira watches the pattern settle before speaking. \"There. That is the authority node at this layer. A Harbor Master—more precisely, someone with oversight over both visible harbor routine and what happens when the tide turns low enough to hide a skiff. Not just a customs officer or a port captain in the ordinary sense. The person who decides which routine can be bent without triggering scrutiny. That makes the office an authority desk, and this figure the route master for marsh-to-harbor operations. If we keep going, the next question is who authorizes the harbor master to bend official routine in the first place.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_harbor_master_to_bend_routine",
          text: "Watch who authorizes the harbor master to bend routine",
          nextNodeId: "node_brine_lark_harbor_command",
          effects: {
            setFlags: {
              brine_lark_harbor_master_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_command",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_command",
      text: "The window-office slips do not end at the shutters above customs. They are gathered into a central ledger at Harbor Command, where patrol windows and marsh route approvals become entries in a larger routing schedule. The desk above the sheds does not write those orders alone; it feeds a higher command center that coordinates which altered routines are actually useful at route scale. From your vantage point at customs height, you see the structure of authority: multiple harbor-facing adjustments are being consolidated into the same central ledger, and each entry carries a code that links marsh routes with visible berth assignments. Mira studies the filing pattern before speaking. \"There. That is the upstream node. Harbor Command—the command center where marsh routes are no longer individual local adjustments but entries in a larger routing schedule. The Harbor Window Office turns translation into permission, but this command center turns permission into coordinated movement across the harbor. If we keep going, the next question is who occupies that command center and decides which routes can be scheduled as ordinary traffic.\"",
      choices: [
        {
          id: "watch_who_stably_sits_in_harbor_command_and_decides_routable_routes",
          text: "Watch who stably sits in Harbor Command and decides routable routes",
          nextNodeId: "node_brine_lark_schedule_master",
          effects: {
            setFlags: {
              brine_lark_harbor_command_identified: true,
            },
            setVars: {
              current_goal: "identify_schedule_master",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_schedule_master",
      text: "You stop looking for a name and start looking for the pattern of authority. The harbor command ledger is always open to one person who never leaves their chair, even when messengers arrive or patrol reports pile up. They do not write orders; they receive administrative directives from above and mark which entries can be activated as ordinary traffic. Their desk holds three distinct kinds of charts: patrol schedules that look identical to any harbor master's office, marsh route codes in a cipher system only the command center uses, and berth assignments that overlap with both. When a marsh route needs to become routable, they do not merely file it; they cross-reference it against patrol windows, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. A schedule master—not a harbor master or command officer in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where administrative directives become operational windows, and marsh-to-harbor operations become entries in the larger routing schedule. If we keep going, the next question is who authorizes the schedule master to make marsh routes appear as routine traffic.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_schedule_master_to_make_routes_routable",
          text: "Watch who authorizes the schedule master to make routes routable",
          nextNodeId: "node_brine_lark_port_authority",
          effects: {
            setFlags: {
              brine_lark_schedule_master_identified: true,
            },
            setVars: {
              current_goal: "identify_port_authority",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_port_authority",
      text: "The schedule master's directives arrive not as individual notes but through a formal maritime channel that bypasses the harbor command entirely. They are filed into a ledger at a Port Authority office, where marsh routes and visible berth assignments become entries in a larger coastal routing system. The schedule master does not write these orders; they receive administrative directives from a higher authority center. From your vantage point at customs height, you see the structure of authority: multiple harbor commands across different regions report to the same central ledger, and each entry carries a code that links marsh routes with visible coastal movements. Mira studies the filing pattern before speaking. \"There. That is the upstream node. A Port Authority—the maritime command center where marsh routes are no longer individual operations but entries in a larger coastal routing system. The schedule master translates administrative directives into operational windows, but this authority coordinates across multiple harbors and multiple covert lines. It sits above the routine entirely. If we keep going, the next question is who occupies that port authority office and decides which routes can be scheduled as ordinary traffic.\"",
      choices: [
        {
          id: "watch_who_stably_sits_in_port_authority_and_decides_routable_routes",
          text: "Watch who stably sits in Port Authority and decides routable routes",
          nextNodeId: "node_brine_lark_maritime_inspector",
          effects: {
            setFlags: {
              brine_lark_port_authority_identified: true,
            },
            setVars: {
              current_goal: "identify_maritime_inspector",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_maritime_inspector",
      text: "You stop looking for a name and start looking for the pattern of authority. The port authority ledger is always open to one person who never leaves their chair, even when messengers arrive or coastal reports pile up. They do not write orders; they receive administrative directives from above and mark which entries can be activated as ordinary traffic. Their desk holds three distinct kinds of charts: patrol schedules that look identical to any harbor master's office, marsh route codes in a cipher system only the command center uses, and berth assignments that overlap with both. When a marsh route needs to become routable, they do not merely file it; they cross-reference it against coastal movements, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. A maritime inspector—not a port authority officer or command officer in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where administrative directives become operational windows, and marsh-to-harbor operations become entries in the larger coastal routing system. If we keep going, the next question is who reviews that authority rather than merely extending it.\"",
      choices: [
        {
          id: "watch_which_board_reviews_the_maritime_inspector",
          text: "Watch which board reviews the maritime inspector's route authority",
          nextNodeId: "node_brine_lark_maritime_oversight_board",
          effects: {
            setFlags: {
              brine_lark_maritime_inspector_identified: true,
            },
            setVars: {
              current_goal: "identify_maritime_oversight_board",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_coastal_command",
      text: "The maritime inspector's directives arrive not as individual notes but through a formal channel that bypasses the port authority entirely. They are filed into a ledger at Coastal Command HQ, where marsh routes and visible coastal movements become entries in an even larger routing system. The maritime inspector does not write these orders; they receive administrative directives from a higher command center. From your vantage point above customs height, you see the structure of authority: multiple port authorities across different regions report to the same central ledger, and each entry carries a code that links marsh routes with visible coastal movements. Mira studies the filing pattern before speaking. \"There. That is the upstream node. Coastal Command HQ—the maritime command center where marsh routes are no longer individual operations but entries in an even larger coastal routing system. The maritime inspector translates administrative directives into operational windows, but this command coordinates across multiple regions and multiple covert lines. It sits above the routine entirely. If we keep going, the next question is who occupies that coastal command office and decides which routes can be scheduled as ordinary traffic.\"",
      choices: [
        {
          id: "watch_who_stably_sits_in_coastal_command_and_decides_routable_routes",
          text: "Watch who stably sits in Coastal Command HQ and decides routable routes",
          nextNodeId: "node_brine_lark_coastal_commander",
          effects: {
            setFlags: {
              brine_lark_coastal_command_identified: true,
            },
            setVars: {
              current_goal: "identify_coastal_commander",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_coastal_commander",
      text: "You stop looking for a name and start looking for the pattern of authority. The coastal command ledger is always open to one person who never leaves their chair, even when messengers arrive or regional reports pile up. They do not write orders; they receive administrative directives from above and mark which entries can be activated as ordinary traffic. Their desk holds three distinct kinds of charts: patrol schedules that look identical to any harbor master's office, marsh route codes in a cipher system only the command center uses, and berth assignments that overlap with both. When a marsh route needs to become routable, they do not merely file it; they cross-reference it against coastal movements, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. A coastal commander—not a maritime inspector or command officer in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where administrative directives become operational windows, and marsh-to-harbor operations become entries in the larger coastal routing system. If we keep going, the next question is who authorizes the coastal commander to make marsh routes appear as routine traffic.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_coastal_commander_to_make_routes_routable",
          text: "Watch who authorizes the coastal commander to make routes routable",
          nextNodeId: "node_brine_lark_navigation_master",
          effects: {
            setFlags: {
              brine_lark_coastal_commander_identified: true,
            },
            setVars: {
              current_goal: "identify_navigation_master",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_navigation_master",
      text: "The coastal commander's directives arrive not as individual notes but through a formal channel that bypasses the coastal command entirely. They are filed into a ledger at Navigation Master's office, where marsh routes and visible navigation become entries in an even larger routing system. The coastal commander does not write these orders; they receive administrative directives from a higher authority center. From your vantage point above customs height, you see the structure of authority: multiple coastal commands across different regions report to the same central ledger, and each entry carries a code that links marsh routes with visible navigation movements. Mira studies the filing pattern before speaking. \"There. That is the upstream node. Navigation Master—the maritime command center where marsh routes are no longer individual operations but entries in an even larger routing system. The coastal commander translates administrative directives into operational windows, but this master coordinates across multiple regions and multiple covert lines. It sits above the routine entirely. If we keep going, the next question is who occupies that navigation office and decides which routes can be scheduled as ordinary traffic.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_navigation_master_to_make_routes_routable",
          text: "Watch who authorizes the Navigation Master to make routes routable",
          nextNodeId: "node_brine_lark_harbor_authority_council",
          effects: {
            setFlags: {
              brine_lark_navigation_master_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_authority_council",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_authority_council",
      text: "The Navigation Master's directives arrive not as individual notes but through a formal channel that bypasses the navigation office entirely. They are filed into a ledger at Harbor Authority Council, where marsh routes and visible navigation become entries in an even larger routing system. The Navigation Master does not write these orders; they receive administrative directives from a higher authority center. From your vantage point above customs height, you see the structure of authority: multiple Navigation Masters across different regions report to the same central ledger, and each entry carries a code that links marsh routes with visible navigation movements. Mira studies the filing pattern before speaking. \"There. That is the upstream node. Harbor Authority Council—the maritime command center where marsh routes are no longer individual operations but entries in an even larger routing system. The Navigation Master translates administrative directives into operational windows, but this council coordinates across multiple regions and multiple covert lines. It sits above the routine entirely. If we keep going, the next question is who occupies that council office and decides which routes can be scheduled as ordinary traffic.\"",
      choices: [
        {
          id: "watch_who_stably_sits_in_council_and_decides_routable_routes",
          text: "Watch who stably sits in Harbor Authority Council and decides routable routes",
          nextNodeId: "node_brine_lark_harbor_clerk",
          effects: {
            setFlags: {
              brine_lark_harbor_authority_council_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_clerk",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_clerk",
      text: "You stop looking for a name and start looking for the pattern of authority. The council ledger is always open to one person who never leaves their chair, even when messengers arrive or regional reports pile up. They do not write orders; they receive administrative directives from above and mark which entries can be activated as ordinary traffic. Their desk holds three distinct kinds of charts: patrol schedules that look identical to any harbor master's office, marsh route codes in a cipher system only the command center uses, and berth assignments that overlap with both. When a marsh route needs to become routable, they do not merely file it; they cross-reference it against coastal movements, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. A harbor clerk—not a council member or command officer in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where administrative directives become operational windows, and marsh-to-harbor operations become entries in the larger routing system. If we keep going, the next question is who authorizes the harbor clerk to make marsh routes appear as routine traffic.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_harbor_clerk_to_make_routes_routable",
          text: "Watch who authorizes the harbor clerk to make routes routable",
          nextNodeId: "node_brine_lark_harbor_authority",
          effects: {
            setFlags: {
              brine_lark_harbor_clerk_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_authority",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_authority",
      text: "The clerk's instructions arrive not as individual notes but through a formal channel that bypasses the council entirely. They are filed into a ledger at Harbor Authority, where marsh routes and visible navigation become entries in an even larger routing system. The clerk does not write these orders; they receive administrative directives from a higher authority center. From your vantage point above customs height, you see the structure of authority: multiple councils across different regions report to the same central ledger, and each entry carries a code that links marsh routes with visible navigation movements. Mira studies the filing pattern before speaking. \"There. That is the upstream node. Harbor Authority—the maritime command center where marsh routes are no longer individual operations but entries in an even larger routing system. The harbor clerk translates administrative directives into operational windows, but this authority coordinates across multiple regions and multiple covert lines. It sits above the routine entirely. If we keep going, the next question is who occupies that authority office and decides which routes can be scheduled as ordinary traffic.\"",
      choices: [
        {
          id: "watch_who_stably_sits_in_harbor_authority_and_decides_routable_routes",
          text: "Watch who stably sits in Harbor Authority and decides routable routes",
          nextNodeId: "node_brine_lark_harbor_authority_registrar",
          effects: {
            setFlags: {
              brine_lark_harbor_authority_identified: true,
            },
            setVars: {
              current_goal: "identify_harbor_authority_registrar",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_harbor_authority_registrar",
      text: "You stop looking for rank and start looking for repetition. The office above the council rooms is always open to one person who never leaves their desk, even when approval slips pile up. They do not draft policy; they receive administrative directives from above and stamp which route entries can be published as ordinary traffic. Their shelves hold three distinct kinds of records: route ledgers that look identical to any harbor office, marsh codes in a cipher system only the authority uses, and traffic approvals that overlap with both. When a route needs to become routable, they do not merely file it; they cross-reference it against navigation windows, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. A harbor authority registrar—not a council member or command officer in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where administrative directives become operational windows, and marsh-to-harbor operations become entries in the larger routing system. If we keep going, the next question is who authorizes the registrar to make marsh routes appear as routine traffic.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_registrar_to_make_routes_routable",
          text: "Watch who authorizes the registrar to make routes routable",
          nextNodeId: "node_brine_lark_maritime_oversight_board",
          effects: {
            setFlags: {
              brine_lark_harbor_authority_registrar_identified: true,
            },
            setVars: {
              current_goal: "identify_maritime_oversight_board",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_maritime_oversight_board",
      text: "The inspector's authority does not stand alone. It arrives through a formal review channel that bypasses the port office floor, then gets filed into a board ledger marked for the Maritime Oversight Board. The inspector does not create these approvals outright; they receive them under upstream governance and turn them into route decisions. From your vantage point above the harbor, you see the structure of authority: multiple authority offices across different regions report to the same board ledger, and each entry carries a review code that links marsh routes with larger route categories. Mira studies the filing pattern before speaking. \"There. That is the upstream node. The Maritime Oversight Board—the governing layer where marsh routes are no longer locally assigned operations but entries in a wider oversight framework. The maritime inspector translates board-reviewed authority into routine traffic windows, but this board is what reviews, constrains, and authorizes the whole chain. If we keep going, the next question is who sits on that board and decides which routes can be left to ordinary administration.\"",
      choices: [
        {
          id: "watch_who_stably_sits_on_the_oversight_board_and_decides_routable_routes",
          text: "Watch who stably sits on the Maritime Oversight Board and decides routable routes",
          nextNodeId: "node_brine_lark_oversight_secretary",
          effects: {
            setFlags: {
              brine_lark_maritime_oversight_board_identified: true,
            },
            setVars: {
              current_goal: "identify_oversight_secretary",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_oversight_secretary",
      text: "You stop looking for rank and start looking for repetition. The board ledger is always open to one person who never leaves their desk, even when review packets pile up. They do not draft policy; they receive governance directives from above and stamp which route entries can be published as ordinary traffic. Their shelves hold three distinct kinds of records: route ledgers that look identical to any harbor office, marsh codes in a cipher system only the board uses, and traffic approvals that overlap with both. When a route needs to become routable, they do not merely file it; they cross-reference it against oversight windows, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. An oversight secretary—not a board member or command officer in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where governance directives become operational windows, and marsh-to-harbor operations become entries in the larger routing system. If we keep going, the next question is who authorizes the secretary to make marsh routes appear as routine traffic.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_oversight_secretary_to_make_routes_routable",
          text: "Watch who authorizes the oversight secretary to make routes routable",
          nextNodeId: "node_brine_lark_maritime_minister",
          effects: {
            setFlags: {
              brine_lark_oversight_secretary_identified: true,
            },
            setVars: {
              current_goal: "identify_maritime_minister",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_maritime_minister",
      text: "The secretary's directives arrive not as individual notes but through a formal ministry channel that bypasses the board entirely. They are filed into a ledger at the Maritime Ministry, where oversight findings and route policy become entries in a wider government schedule. The secretary does not create these directives; they receive ministerial approval and convert it into route codes. From your vantage point above the harbor district, you see the structure of authority: multiple boards and councils across different regions report to the same ministry suite, and each entry carries a code that links marsh routes with larger policy categories. Mira studies the filing pattern before speaking. \"There. That is the upstream node. The Maritime Ministry—the governing office where marsh routes are no longer board-level operations but entries in a wider policy framework. The oversight secretary translates those decisions into routine traffic windows, but this ministry is what reviews, constrains, and authorizes the whole chain. If we keep going, the next question is who sits in that office and decides which routes can be left to ordinary administration.\"",
      choices: [
        {
          id: "watch_who_stably_sits_in_the_maritime_ministry_and_decides_routable_routes",
          text: "Watch who stably sits in the Maritime Ministry and decides routable routes",
          nextNodeId: "node_brine_lark_transport_cabinet",
          effects: {
            setFlags: {
              brine_lark_maritime_minister_identified: true,
            },
            setVars: {
              current_goal: "identify_transport_cabinet",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_transport_cabinet",
      text: "You stop looking for a name and start looking for the pattern of authority. The cabinet office is always open to one small group who never leave their chairs, even when cross-ministry packets pile up. They do not draft policy; they receive ministerial directives from above and stamp which route entries can be published as ordinary traffic. Their shelves hold three distinct kinds of records: route ledgers that look identical to any ministry office, marsh codes in a cipher system only the cabinet uses, and traffic approvals that overlap with both. When a route needs to become routable, they do not merely file it; they cross-reference it against cabinet windows, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. A cabinet secretary—not a minister or committee member in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where ministerial directives become operational windows, and marsh-to-harbor operations become entries in the larger routing system. If we keep going, the next question is who authorizes the cabinet secretary to make marsh routes appear as routine traffic.\"",
      choices: [
        {
          id: "watch_who_authorizes_the_cabinet_secretary_to_make_routes_routable",
          text: "Watch who authorizes the cabinet secretary to make routes routable",
          nextNodeId: "node_brine_lark_executive_office",
          effects: {
            setFlags: {
              brine_lark_transport_cabinet_identified: true,
            },
            setVars: {
              current_goal: "identify_executive_office",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_executive_office",
      text: "The cabinet secretary's directives do not originate in the cabinet floor after all. They arrive through a restricted government channel that bypasses the cabinet entirely, then get filed into a final authorization ledger at the Executive Office. The secretary does not create these approvals; they receive executive signoff and convert it into route codes. From your vantage point above the harbor district, you see the structure of authority: multiple cabinets and ministries across different regions report to the same executive suite, and each entry carries a signature code that links marsh routes with larger policy categories. Mira studies the filing pattern before speaking. \"There. That is the upstream node. The Executive Office—the governing suite where marsh routes are no longer cabinet-level operations but entries in a final policy framework. The cabinet secretary translates those decisions into routine traffic windows, but this office is what reviews, constrains, and authorizes the whole chain. If we keep going, the next question is who sits in that office and decides which routes can be left to ordinary administration.\"",
      choices: [
        {
          id: "watch_who_stably_sits_in_the_executive_office_and_decides_routable_routes",
          text: "Watch who stably sits in the Executive Office and decides routable routes",
          nextNodeId: "node_brine_lark_prime_minister",
          effects: {
            setFlags: {
              brine_lark_executive_office_identified: true,
            },
            setVars: {
              current_goal: "identify_prime_minister",
            },
            advanceQuestStep: ["quest_brine_lark"],
          },
        },
      ],
    },
    {
      id: "node_brine_lark_prime_minister",
      text: "You stop looking for a name and start looking for the pattern of authority. The executive suite is always open to one person who never leaves their desk, even when final approvals pile up. They do not draft the policy themselves; they receive cabinet and ministry directives from below and sign which route entries can be published as ordinary traffic. Their shelves hold three distinct kinds of records: route ledgers that look identical to any government office, marsh codes in a national cipher system, and traffic approvals that overlap with both. When a route needs to become routable, they do not merely file it; they cross-reference it against executive windows, then mark a code that makes the schedule appear routine while the entry remains active for covert passage. Mira watches the precision of their work before speaking. \"There. That is the operator class at this layer. A prime minister—not a minister or council member in the ordinary sense. The person who decides which marsh routes can be scheduled as ordinary traffic without triggering scrutiny. They sit where cabinet directives become final operating reality, and marsh-to-harbor operations become entries in the larger routing system. If we keep going, the next question is who authorizes the prime minister to make marsh routes appear as routine traffic.\"",
      choices: [],
    },
  ],
};
