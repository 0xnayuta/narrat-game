/**
 * Responsibility: localStorage persistence wrapper for versioned SaveFile payloads.
 * TODO: Add multi-slot listing APIs and storage backends.
 */

import type { GameState } from "../types";
import { deserializeSaveFile, serializeGameState } from "./serializer";

export class SaveService {
  save(slotId: string, state: GameState): void {
    const saveFile = serializeGameState({ slotId, state });
    localStorage.setItem(slotId, JSON.stringify(saveFile));
  }

  load(slotId: string): GameState | null {
    const raw = localStorage.getItem(slotId);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return deserializeSaveFile(parsed);
  }
}
