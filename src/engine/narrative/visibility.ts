/**
 * Responsibility: Filter narrative choices by visibility conditions.
 * Choices with a `conditions` field are only shown when all conditions match the current state.
 */

import { matchesAllEventConditions } from "../events/conditions";
import type { ChoiceOption } from "../types";
import type { GameState } from "../types";

/**
 * Filter a list of choices to only those visible in the current game state.
 * Choices without `conditions` are always visible.
 */
export function filterVisibleChoices(
  choices: ChoiceOption[],
  state: GameState,
): ChoiceOption[] {
  return choices.filter((choice) =>
    matchesAllEventConditions(state, choice.conditions),
  );
}

/**
 * Build a view-model-ready choice list (id + text only) with visibility filtering applied.
 */
export function getVisibleChoiceViewModels(
  choices: ChoiceOption[],
  state: GameState,
): Array<Pick<ChoiceOption, "id" | "text">> {
  return filterVisibleChoices(choices, state).map((choice) => ({
    id: choice.id,
    text: choice.text,
  }));
}
