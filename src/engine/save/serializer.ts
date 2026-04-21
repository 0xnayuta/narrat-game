/**
 * Responsibility: Serialize/deserialize GameState with versioned SaveFile format.
 * TODO: Add metadata signatures/checksum if tamper detection is required.
 */

import { CURRENT_SAVE_VERSION } from "./constants";
import { migrateSaveFile } from "./migration";
import { isValidSaveFile } from "./validation";
import type { GameState, SaveFile } from "../types";

export interface SerializeSaveInput {
  state: GameState;
  slotId: string;
  savedAt?: string;
}

export function serializeGameState(input: SerializeSaveInput): SaveFile {
  return {
    version: CURRENT_SAVE_VERSION,
    savedAt: input.savedAt ?? new Date().toISOString(),
    slotId: input.slotId,
    state: input.state,
  };
}

export function deserializeSaveFile(payload: unknown): GameState {
  if (!isValidSaveFile(payload)) {
    throw new Error("Invalid save payload schema");
  }

  const migrated = migrateSaveFile(payload, CURRENT_SAVE_VERSION);
  if (!isValidSaveFile(migrated)) {
    throw new Error("Invalid save payload after migration");
  }

  return migrated.state;
}
