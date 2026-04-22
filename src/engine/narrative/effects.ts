/**
 * Responsibility: Apply narrative choice effects to GameState.
 * Effects are applied in a deterministic order:
 *   1. setFlags / setVars / setQuests — direct state writes
 *   2. addVars / addStats — numeric deltas (run after setVars so base values are set first)
 *   3. advanceQuestStep — step progression (runs after setQuests so status changes are visible)
 *   4. completeQuest / failQuest — status overrides (run last so they take final precedence)
 */

import { advanceQuestStep, buildQuestStepIndex } from "../quests/QuestService";
import type { QuestDefinition } from "../types";
import type { GameState, NarrativeChoiceEffects } from "../types";

function addToNumericRecord(
  record: Record<string, number | string | boolean>,
  deltas: Record<string, number>,
): Record<string, number | string | boolean> {
  const result = { ...record };
  for (const [key, delta] of Object.entries(deltas)) {
    const current = result[key];
    const base = typeof current === "number" ? current : 0;
    result[key] = base + delta;
  }
  return result;
}

function addToStats(
  stats: Record<string, number>,
  deltas: Record<string, number>,
): Record<string, number> {
  const result = { ...stats };
  for (const [key, delta] of Object.entries(deltas)) {
    result[key] = (result[key] ?? 0) + delta;
  }
  return result;
}

/**
 * Apply narrative choice effects to a GameState, returning a new state.
 *
 * @param state Current game state (not mutated)
 * @param effects Effects to apply
 * @param questDefinitions Required when using advanceQuestStep; provides step order.
 */
export function applyNarrativeChoiceEffects(
  state: GameState,
  effects?: NarrativeChoiceEffects,
  questDefinitions?: QuestDefinition[],
): GameState {
  if (!effects) {
    return state;
  }

  // Phase 1: direct state writes
  let nextQuests = {
    ...state.quests,
    ...(effects.setQuests ?? {}),
  };

  const nextState: GameState = {
    ...state,
    flags: {
      ...state.flags,
      ...(effects.setFlags ?? {}),
    },
    vars: {
      ...state.vars,
      ...(effects.setVars ?? {}),
    },
    quests: nextQuests,
  };

  // Phase 2: numeric deltas (run after setVars so base values are established)
  if (effects.addVars && Object.keys(effects.addVars).length > 0) {
    nextState.vars = addToNumericRecord(nextState.vars, effects.addVars);
  }

  if (effects.addStats && Object.keys(effects.addStats).length > 0) {
    nextState.player = {
      ...nextState.player,
      stats: addToStats(nextState.player.stats, effects.addStats),
    };
  }

  // Phase 3: advance quest steps
  if (effects.advanceQuestStep && effects.advanceQuestStep.length > 0) {
    if (!questDefinitions || questDefinitions.length === 0) {
      throw new Error(
        "advanceQuestStep effect requires questDefinitions to resolve step order",
      );
    }

    const stepIndex = buildQuestStepIndex(questDefinitions);
    for (const questId of effects.advanceQuestStep) {
      const result = advanceQuestStep(questId, nextQuests, stepIndex);
      if (result) {
        nextQuests = {
          ...nextQuests,
          [questId]: {
            status: result.status,
            currentStepId: result.currentStepId,
          },
        };
      }
    }
    nextState.quests = nextQuests;
  }

  // Phase 4: complete / fail overrides (these take final precedence)
  if (effects.completeQuest && effects.completeQuest.length > 0) {
    for (const questId of effects.completeQuest) {
      nextQuests = {
        ...nextQuests,
        [questId]: {
          ...nextQuests[questId],
          status: "completed",
        },
      };
    }
    nextState.quests = nextQuests;
  }

  if (effects.failQuest && effects.failQuest.length > 0) {
    for (const questId of effects.failQuest) {
      nextQuests = {
        ...nextQuests,
        [questId]: {
          ...nextQuests[questId],
          status: "failed",
        },
      };
    }
    nextState.quests = nextQuests;
  }

  return nextState;
}
