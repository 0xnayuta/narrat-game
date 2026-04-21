/**
 * Responsibility: Apply minimal quest progression rules without coupling to UI or narrative.
 * TODO: Add event-driven and narrative-driven quest updates when quest runtime expands.
 */

import type { GameState, QuestDefinition, QuestProgress } from "../types";

export interface LocationQuestTransition {
  questId: string;
  locationId: string;
  status: QuestProgress["status"];
  currentStepId?: string;
}

export function createQuestStateFromDefinitions(
  definitions: QuestDefinition[],
): Record<string, QuestProgress> {
  return Object.fromEntries(
    definitions.map((quest) => [
      quest.id,
      {
        status: quest.status,
        currentStepId: quest.stepIds[0],
      },
    ]),
  );
}

export function applyLocationQuestTransitions(
  state: GameState,
  transitions: LocationQuestTransition[],
): GameState {
  const matchingTransitions = transitions.filter(
    (transition) => transition.locationId === state.currentLocationId,
  );

  if (matchingTransitions.length === 0) {
    return state;
  }

  const nextQuests = { ...state.quests };
  for (const transition of matchingTransitions) {
    nextQuests[transition.questId] = {
      status: transition.status,
      currentStepId: transition.currentStepId,
    };
  }

  return {
    ...state,
    quests: nextQuests,
  };
}
