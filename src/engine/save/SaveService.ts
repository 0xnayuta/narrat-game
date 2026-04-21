/**
 * Responsibility: Save/load game snapshots (localStorage-first).
 * TODO: Add save slots, migration and integrity checks.
 */

export class SaveService {
  save(key: string, data: unknown): void {
    // TODO: Add robust serialization and error handling.
    localStorage.setItem(key, JSON.stringify(data));
  }

  load<T>(key: string): T | null {
    // TODO: Add robust parsing and schema validation.
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
}
