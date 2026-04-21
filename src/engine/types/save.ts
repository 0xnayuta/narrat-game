/**
 * Serialized save payload format for persistence layer.
 */
import type { GameState } from "./state";

export interface SaveFile {
  version: number;
  savedAt: string;
  slotId: string;
  state: GameState;
  // TODO: Add migration metadata/checksum when save versioning strategy is finalized.
}
