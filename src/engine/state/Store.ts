/**
 * Responsibility: Minimal state store contracts for deterministic state updates.
 * TODO: Add subscriptions and middleware hooks when event system is introduced.
 */

export type StateUpdater<TState> = (previous: Readonly<TState>) => TState;

export interface Store<TState> {
  getState(): TState;
  setState(next: TState): void;
}

export interface ResettableStore<TState> extends Store<TState> {
  update(updater: StateUpdater<TState>): TState;
  reset(): TState;
  getInitialState(): TState;
}
