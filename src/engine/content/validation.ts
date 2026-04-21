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
      typeof event.trigger === "string"
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
    return typeof npc.id === "string" && typeof npc.name === "string";
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
