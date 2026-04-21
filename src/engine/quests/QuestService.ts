/**
 * Responsibility: Create initial quest runtime state from static quest definitions.
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
