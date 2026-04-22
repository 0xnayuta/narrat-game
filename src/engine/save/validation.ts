/**
 * Responsibility: Minimal runtime schema validation for save payloads.
 * TODO: Replace hand-written checks with shared schema utilities if adopted later.
 */

import type { GameState, SaveFile } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "boolean");
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "number");
}

function isScalarVar(value: unknown): boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isVarsRecord(value: unknown): value is GameState["vars"] {
  return isRecord(value) && Object.values(value).every(isScalarVar);
}

function isEventHistoryState(value: unknown): value is NonNullable<GameState["eventHistory"]> {
  if (!isRecord(value)) {
    return false;
  }

  const onceTriggered = value.onceTriggeredByEventId;
  const cooldownLastTriggered = value.cooldownLastTriggeredMinuteByEventId;

  return isBooleanRecord(onceTriggered) && isNumberRecord(cooldownLastTriggered);
}

function isQuestProgressRecord(value: unknown): value is GameState["quests"] {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((progress) => {
    if (!isRecord(progress)) {
      return false;
    }
    const status = progress.status;
    if (
      status !== "inactive" &&
      status !== "active" &&
      status !== "completed" &&
      status !== "failed"
    ) {
      return false;
    }
    return (
      progress.currentStepId === undefined || typeof progress.currentStepId === "string"
    );
  });
}

export function isValidGameState(value: unknown): value is GameState {
  if (!isRecord(value)) {
    return false;
  }

  const player = value.player;
  const time = value.time;

  if (!isRecord(player) || !isRecord(time)) {
    return false;
  }

  const isPlayerValid =
    typeof player.id === "string" &&
    typeof player.name === "string" &&
    isNumberRecord(player.stats) &&
    isBooleanRecord(player.flags);

  const isTimeValid =
    typeof time.day === "number" &&
    typeof time.hour === "number" &&
    typeof time.minute === "number";

  return (
    isPlayerValid &&
    isTimeValid &&
    typeof value.currentLocationId === "string" &&
    isBooleanRecord(value.flags) &&
    isQuestProgressRecord(value.quests) &&
    isNumberRecord(value.inventory) &&
    isVarsRecord(value.vars) &&
    (value.eventHistory === undefined || isEventHistoryState(value.eventHistory))
  );
}

export function isValidSaveFile(value: unknown): value is SaveFile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.version === "number" &&
    typeof value.savedAt === "string" &&
    typeof value.slotId === "string" &&
    isValidGameState(value.state)
  );
}
