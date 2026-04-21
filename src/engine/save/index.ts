/**
 * Responsibility: Public save module exports.
 */

export { CURRENT_SAVE_VERSION } from "./constants";
export type { SaveMigration } from "./migration";
export { identityMigration, migrateSaveFile } from "./migration";
export type { SerializeSaveInput } from "./serializer";
export { serializeGameState, deserializeSaveFile } from "./serializer";
export { isValidGameState, isValidSaveFile } from "./validation";
export { SaveService } from "./SaveService";
