/**
 * Responsibility: Create initial quest runtime state from static quest definitions
 * and provide quest progression helpers.
 * TODO: Add event-driven and narrative-driven quest update helpers when quest runtime expands.
 */

import type { QuestDefinition, QuestProgress } from "../types";

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

/**
 * Build a lookup map from quest id to stepIds array for efficient step advancement.
 */
export function buildQuestStepIndex(
  definitions: QuestDefinition[],
): Map<string, string[]> {
  return new Map(definitions.map((q) => [q.id, q.stepIds]));
}

export interface QuestStepAdvanceResult {
  /** ID of the step after advancement, or unchanged if already at last step. */
  currentStepId: string;
  /** Whether the quest was at the final step before advancing. */
  wasAtLastStep: boolean;
}

/**
 * Compute the next step for a quest based on its stepIds order.
 * Pure function — does not mutate input.
 *
 * - If the quest is not found in stepIndex, returns null.
 * - If the current step is not in stepIds, starts from step 0.
 * - If already at the last step, stays at the last step (wasAtLastStep = true).
 *   Content authors should use `completeQuest` effect explicitly if they want completion.
 */
export function advanceQuestStep(
  questId: string,
  quests: Record<string, QuestProgress>,
  stepIndex: Map<string, string[]>,
): (QuestProgress & QuestStepAdvanceResult) | null {
  const stepIds = stepIndex.get(questId);
  if (!stepIds || stepIds.length === 0) {
    return null;
  }

  const current = quests[questId];
  if (!current) {
    return null;
  }

  const currentIdx = stepIds.indexOf(current.currentStepId ?? "");
  const wasAtLastStep = currentIdx === stepIds.length - 1;
  const nextIdx = currentIdx === -1 ? 0 : Math.min(currentIdx + 1, stepIds.length - 1);

  return {
    status: current.status,
    currentStepId: stepIds[nextIdx],
    wasAtLastStep,
  };
}
