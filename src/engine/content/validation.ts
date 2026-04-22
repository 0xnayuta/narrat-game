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

function hasValidNarrative(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.startNodeId === "string" && Array.isArray(value.nodes);
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
      (event.cooldownMinutes === undefined || typeof event.cooldownMinutes === "number")
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

          return (
            typeof rule.id === "string" &&
            typeof rule.label === "string" &&
            typeof rule.nodeId === "string" &&
            (rule.requiredFlags === undefined || isBooleanRecord(rule.requiredFlags)) &&
            requiredQuestsValid &&
            (rule.requiredVars === undefined || isScalarRecord(rule.requiredVars)) &&
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
    isBooleanRecord(value.initialFlags)
  );
}

export function validateContentBundle(value: unknown): ContentBundle {
  if (!isValidContentBundle(value)) {
    throw new Error("Invalid content bundle");
  }
  return value;
}
