/**
 * Minimal demo runner wiring content layer to engine flow.
 * This is for manual validation of the engine chain, not a full game loop.
 */

import { applyNarrativeChoiceEffects, NarrativeRuntime } from "../engine/narrative";
import { createQuestStateFromDefinitions } from "../engine/quests";
import { runTravelEventFlow } from "../engine/runtime";
import { createInitialGameState } from "../engine/state/GameState";
import { getCurrentTimeLabel } from "../engine/time";
import { LocationService } from "../engine/world";
import { demoEvents, demoLocations, demoNarrativeGraph, demoQuests } from "../content/demo";
import type { GameState } from "../engine/types";

export interface DemoFlowStepResult {
  locationId: string;
  timeLabel: string;
  triggeredEventId: string | null;
  sceneText: string | null;
  selectedChoiceId: string | null;
  marketVisitIntent: boolean;
  currentGoal: string | null;
  questStatus: string | null;
  questStepId: string | null;
}

export function runDemoContentFlow(): DemoFlowStepResult[] {
  const locationService = new LocationService(demoLocations);
  const narrativeRuntime = new NarrativeRuntime(demoNarrativeGraph);

  let state: GameState = {
    ...createInitialGameState(),
    quests: createQuestStateFromDefinitions(demoQuests),
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
    },
  };

  const results: DemoFlowStepResult[] = [];

  const step1 = runTravelEventFlow(
    state,
    "street",
    locationService,
    demoEvents,
    narrativeRuntime,
  );
  state = step1.state;

  let selectedChoiceId: string | null = null;
  if (step1.scene?.choices[0]) {
    selectedChoiceId = step1.scene.choices[0].id;
    const choiceResult = narrativeRuntime.choose(selectedChoiceId);
    state = applyNarrativeChoiceEffects(state, choiceResult.effects, demoQuests);
  }

  results.push({
    locationId: state.currentLocationId,
    timeLabel: getCurrentTimeLabel(state.time),
    triggeredEventId: step1.triggeredEvent?.id ?? null,
    sceneText: step1.scene?.text ?? null,
    selectedChoiceId,
    marketVisitIntent: state.flags.market_visit_intent === true,
    currentGoal: typeof state.vars.current_goal === "string" ? state.vars.current_goal : null,
    questStatus: state.quests.quest_intro_walk?.status ?? null,
    questStepId: state.quests.quest_intro_walk?.currentStepId ?? null,
  });

  const step2 = runTravelEventFlow(
    state,
    "market",
    locationService,
    demoEvents,
    narrativeRuntime,
  );
  state = step2.state;

  selectedChoiceId = null;
  if (step2.scene?.choices[0]) {
    const preferredChoice = step2.scene.choices.find((choice) => choice.id === "finish_walk");
    selectedChoiceId = preferredChoice?.id ?? step2.scene.choices[0].id;
    const choiceResult = narrativeRuntime.choose(selectedChoiceId);
    state = applyNarrativeChoiceEffects(state, choiceResult.effects, demoQuests);
  }

  results.push({
    locationId: state.currentLocationId,
    timeLabel: getCurrentTimeLabel(state.time),
    triggeredEventId: step2.triggeredEvent?.id ?? null,
    sceneText: step2.scene?.text ?? null,
    selectedChoiceId,
    marketVisitIntent: state.flags.market_visit_intent === true,
    currentGoal: typeof state.vars.current_goal === "string" ? state.vars.current_goal : null,
    questStatus: state.quests.quest_intro_walk?.status ?? null,
    questStepId: state.quests.quest_intro_walk?.currentStepId ?? null,
  });

  return results;
}
