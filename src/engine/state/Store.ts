/**
 * Responsibility: Minimal state store read/write contract.
 * TODO: Add subscriptions, immutable snapshots and transaction helpers.
 */

export interface Store<TState> {
  getState(): TState;
  setState(next: TState): void;
}
