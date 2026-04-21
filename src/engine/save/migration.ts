/**
 * Responsibility: Save-file migration contracts and minimal migration pipeline.
 * TODO: Add version-step migration registry when schema evolves.
 */

import { CURRENT_SAVE_VERSION } from "./constants";
import type { SaveFile } from "../types";

export interface SaveMigration {
  fromVersion: number;
  toVersion: number;
  migrate: (input: SaveFile) => SaveFile;
}

export const identityMigration: SaveMigration = {
  fromVersion: CURRENT_SAVE_VERSION,
  toVersion: CURRENT_SAVE_VERSION,
  migrate: (input) => input,
};

export function migrateSaveFile(
  input: SaveFile,
  targetVersion = CURRENT_SAVE_VERSION,
  migrations: SaveMigration[] = [identityMigration],
): SaveFile {
  if (input.version === targetVersion) {
    const migration = migrations.find(
      (entry) => entry.fromVersion === targetVersion && entry.toVersion === targetVersion,
    );
    return migration ? migration.migrate(input) : input;
  }

  throw new Error(
    `Unsupported save migration path: ${input.version} -> ${targetVersion}. ` +
      "TODO: register forward migrations.",
  );
}
