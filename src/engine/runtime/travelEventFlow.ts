/**
 * Responsibility: Orchestrate a minimal happy-path flow: travel -> time advance -> event check -> narrative start.
 * TODO: Extend with failure results, cooldowns and multi-event resolution strategies.
 */

import { getCandidateEvents, selectFirstEvent } from "../events";
import { NarrativeRuntime } from "../narrative";
import type { NarrativeViewModel } from "../narrative";
import { advanceGameStateMinutes } from "../time";
import type { EventDefinition, GameState } from "../types";
import { LocationService } from "../world";

export interface TravelEventFlowResult {
  state: GameState;
  triggeredEvent: EventDefinition | null;
  scene: NarrativeViewModel | null;
}

function readNarrativeNodeId(event: EventDefinition | null): string | null {
  if (!event?.payload) {
    return null;
  }
  const nodeId = event.payload["narrativeNodeId"];
  return typeof nodeId === "string" ? nodeId : null;
}

/**
 * Runs a minimal deterministic flow after a location change.
 *
 * Phase 1: state update (location + time)
 * Phase 2: event filtering
 * Phase 3: narrative startup (if event contains narrativeNodeId)
 */
export function runTravelEventFlow(
  state: GameState,
  toLocationId: string,
  locationService: LocationService,
  events: EventDefinition[],
  narrativeRuntime: NarrativeRuntime,
): TravelEventFlowResult {
  // 1) State update
  const travelMinutes = locationService.getTravelMinutes(state.currentLocationId, toLocationId);
  if (travelMinutes == null) {
    throw new Error(`No travel route from ${state.currentLocationId} to ${toLocationId}`);
  }
  const locationChanged = locationService.switchCurrentLocation(state, toLocationId);
  const advancedState = advanceGameStateMinutes(locationChanged, travelMinutes);

  // 2) Event filtering
  const locationCandidates = getCandidateEvents(events, advancedState, "on-location-enter");
  const timeCandidates = getCandidateEvents(events, advancedState, "on-time-check");
  const triggeredEvent = selectFirstEvent([...locationCandidates, ...timeCandidates]);

  // 3) Narrative startup
  let scene: NarrativeViewModel | null = null;
  const targetNodeId = readNarrativeNodeId(triggeredEvent);
  if (targetNodeId) {
    narrativeRuntime.jumpTo(targetNodeId);
    scene = narrativeRuntime.getCurrentView();
  }

  return {
    state: advancedState,
    triggeredEvent,
    scene,
  };
}
