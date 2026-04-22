/**
 * Responsibility: Minimal runtime validation for content bundles.
 * TODO: Replace with shared schema validation if content formats grow more complex.
 */

import type { ContentBundle } from "./bundle";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "boolean");
}

function isScalarRecord(value: unknown): value is Record<string, string | number | boolean> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (entry) =>
        typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean",
    )
  );
}

function isComparableValue(value: unknown): boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function isBaseScalarOperatorPredicate(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return false;
  }

  return entries.every(([key, operand]) => {
    if (key === "!=") {
      return isComparableValue(operand);
    }

    if (key === "in") {
      return Array.isArray(operand) && operand.every(isComparableValue);
    }

    return (key === ">=" || key === ">" || key === "<=" || key === "<") && typeof operand === "number";
  });
}

function isScalarOperatorPredicate(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return false;
  }

  return entries.every(([key, operand]) => {
    if (key === "not") {
      return isComparableValue(operand) || isBaseScalarOperatorPredicate(operand);
    }

    if (key === "!=") {
      return isComparableValue(operand);
    }

    if (key === "in") {
      return Array.isArray(operand) && operand.every(isComparableValue);
    }

    return (key === ">=" || key === ">" || key === "<=" || key === "<") && typeof operand === "number";
  });
}

function isScalarConditionRecord(value: unknown): boolean {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (entry) =>
        typeof entry === "string" ||
        typeof entry === "number" ||
        typeof entry === "boolean" ||
        isScalarOperatorPredicate(entry),
    )
  );
}

function hasValidNarrative(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.startNodeId !== "string" || !Array.isArray(value.nodes)) {
    return false;
  }

  return value.nodes.every((node: unknown) => {
    if (!isRecord(node)) {
      return false;
    }
    if (typeof node.id !== "string" || typeof node.text !== "string" || !Array.isArray(node.choices)) {
      return false;
    }
    return node.choices.every((choice: unknown) => {
      if (!isRecord(choice)) {
        return false;
      }
      const effectsValid =
        choice.effects === undefined ||
        (isRecord(choice.effects) &&
          (choice.effects.addVars === undefined || isNumberRecord(choice.effects.addVars)) &&
          (choice.effects.addStats === undefined || isNumberRecord(choice.effects.addStats)));
      return (
        typeof choice.id === "string" &&
        typeof choice.text === "string" &&
        typeof choice.nextNodeId === "string" &&
        hasValidEventConditions(choice.conditions) &&
        effectsValid
      );
    });
  });
}

function hasValidLocations(value: unknown): boolean {
  return Array.isArray(value) && value.every((location) => {
    if (!isRecord(location)) {
      return false;
    }
    return (
      typeof location.id === "string" &&
      typeof location.name === "string" &&
      typeof location.description === "string" &&
      Array.isArray(location.connections)
    );
  });
}

function isQuestStatusRecord(
  value: unknown,
): value is Record<string, "inactive" | "active" | "completed" | "failed"> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (status) =>
        status === "inactive" ||
        status === "active" ||
        status === "completed" ||
        status === "failed",
    )
  );
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "number");
}

function hasValidEventConditions(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  if (!isRecord(value)) {
    return false;
  }

  const timeRange = value.timeRange;
  const timeRangeValid =
    timeRange === undefined ||
    (isRecord(timeRange) &&
      typeof timeRange.startHour === "number" &&
      typeof timeRange.endHour === "number");

  const anyValid =
    value.any === undefined ||
    (Array.isArray(value.any) && value.any.every((entry) => hasValidEventConditions(entry)));

  return (
    (value.locationIds === undefined || isStringArray(value.locationIds)) &&
    timeRangeValid &&
    (value.flags === undefined || isBooleanRecord(value.flags)) &&
    (value.vars === undefined || isScalarConditionRecord(value.vars)) &&
    (value.quests === undefined || isQuestStatusRecord(value.quests)) &&
    (value.questSteps === undefined || isStringRecord(value.questSteps)) &&
    anyValid
  );
}

function hasValidEvents(value: unknown): boolean {
  return Array.isArray(value) && value.every((event) => {
    if (!isRecord(event)) {
      return false;
    }
    return (
      typeof event.id === "string" &&
      typeof event.type === "string" &&
      typeof event.trigger === "string" &&
      (event.priority === undefined || typeof event.priority === "number") &&
      (event.weight === undefined || typeof event.weight === "number") &&
      (event.cooldownMinutes === undefined || typeof event.cooldownMinutes === "number") &&
      hasValidEventConditions(event.conditions)
    );
  });
}

function hasValidQuests(value: unknown): boolean {
  return Array.isArray(value) && value.every((quest) => {
    if (!isRecord(quest)) {
      return false;
    }
    return (
      typeof quest.id === "string" &&
      typeof quest.title === "string" &&
      typeof quest.status === "string" &&
      isStringArray(quest.stepIds)
    );
  });
}

function hasValidNpcs(value: unknown): boolean {
  return Array.isArray(value) && value.every((npc) => {
    if (!isRecord(npc)) {
      return false;
    }

    const interactionsValid =
      npc.interactions === undefined ||
      (Array.isArray(npc.interactions) &&
        npc.interactions.every((rule) => {
          if (!isRecord(rule)) {
            return false;
          }
          const requiredQuestsValid =
            rule.requiredQuests === undefined ||
            (isRecord(rule.requiredQuests) &&
              Object.values(rule.requiredQuests).every(
                (status) =>
                  status === "inactive" ||
                  status === "active" ||
                  status === "completed" ||
                  status === "failed",
              ));

          const requiredTimeOfDayValid =
            rule.requiredTimeOfDay === undefined ||
            rule.requiredTimeOfDay === "morning" ||
            rule.requiredTimeOfDay === "afternoon" ||
            rule.requiredTimeOfDay === "evening" ||
            rule.requiredTimeOfDay === "night";

          const requiredQuestStepsValid =
            rule.requiredQuestSteps === undefined || isStringRecord(rule.requiredQuestSteps);

          return (
            typeof rule.id === "string" &&
            typeof rule.label === "string" &&
            typeof rule.nodeId === "string" &&
            (rule.requiredFlags === undefined || isBooleanRecord(rule.requiredFlags)) &&
            requiredQuestsValid &&
            requiredQuestStepsValid &&
            (rule.requiredVars === undefined || isScalarConditionRecord(rule.requiredVars)) &&
            requiredTimeOfDayValid
          );
        }));

    return (
      typeof npc.id === "string" &&
      typeof npc.name === "string" &&
      interactionsValid
    );
  });
}

export function isValidContentBundle(value: unknown): value is ContentBundle {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.version === "number" &&
    hasValidLocations(value.locations) &&
    hasValidEvents(value.events) &&
    hasValidNarrative(value.narrative) &&
    hasValidQuests(value.quests) &&
    hasValidNpcs(value.npcs) &&
    isBooleanRecord(value.initialFlags) &&
    (value.initialVars === undefined || isScalarRecord(value.initialVars))
  );
}

export function validateContentBundle(value: unknown): ContentBundle {
  if (!isValidContentBundle(value)) {
    throw new Error("Invalid content bundle");
  }
  return value;
}
