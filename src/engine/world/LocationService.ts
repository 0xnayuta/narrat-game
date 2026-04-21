/**
 * Responsibility: Manage location lookup and navigation rules without narrative/event coupling.
 * TODO: Add dynamic availability filters once condition system exists.
 */

import type { GameState, LocationDefinition } from "../types";

export interface LocationEnterHookContext {
  fromLocationId: string;
  toLocationId: string;
  nextState: GameState;
}

export interface SwitchLocationOptions {
  allowNonAdjacent?: boolean;
  onAfterEnter?: (context: LocationEnterHookContext) => void;
}

export class LocationService {
  private readonly locationsById: Map<string, LocationDefinition>;

  constructor(locations: LocationDefinition[]) {
    this.locationsById = new Map(locations.map((location) => [location.id, location]));
  }

  getLocationById(id: string): LocationDefinition | undefined {
    return this.locationsById.get(id);
  }

  hasLocation(id: string): boolean {
    return this.locationsById.has(id);
  }

  getAdjacentLocations(id: string): LocationDefinition[] {
    const location = this.getLocationById(id);
    if (!location) {
      return [];
    }

    return location.connections
      .map((connection) => this.getLocationById(connection.to))
      .filter((candidate): candidate is LocationDefinition => !!candidate);
  }

  canTravel(fromLocationId: string, toLocationId: string): boolean {
    const from = this.getLocationById(fromLocationId);
    if (!from) {
      return false;
    }
    return from.connections.some((connection) => connection.to === toLocationId);
  }

  getTravelMinutes(fromLocationId: string, toLocationId: string): number | null {
    const from = this.getLocationById(fromLocationId);
    if (!from) {
      return null;
    }
    const connection = from.connections.find((item) => item.to === toLocationId);
    return connection ? connection.travelMinutes : null;
  }

  switchCurrentLocation(
    state: GameState,
    toLocationId: string,
    options?: SwitchLocationOptions,
  ): GameState {
    if (!this.hasLocation(toLocationId)) {
      throw new Error(`Unknown location id: ${toLocationId}`);
    }

    const fromLocationId = state.currentLocationId;
    const allowNonAdjacent = options?.allowNonAdjacent ?? false;
    if (!allowNonAdjacent && !this.canTravel(fromLocationId, toLocationId)) {
      throw new Error(`Cannot travel from ${fromLocationId} to ${toLocationId}`);
    }
    const nextState: GameState = {
      ...state,
      currentLocationId: toLocationId,
    };

    options?.onAfterEnter?.({
      fromLocationId,
      toLocationId,
      nextState,
    });

    return nextState;
  }
}
