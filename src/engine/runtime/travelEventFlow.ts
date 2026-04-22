/**
 * Responsibility: Orchestrate a minimal happy-path flow: travel -> time advance -> event check -> narrative start.
 * TODO: Extend with failure results, cooldowns and multi-event resolution strategies.
 */

import {
  getCandidateEvents,
  markEventCooldownTimestamp,
  markEventTriggered,
  selectResolvedEvent,
  type EventHistoryWriteStrategy,
} from "../events";
import { NarrativeRuntime } from "../narrative";
import type { NarrativeViewModel } from "../narrative";
import { advanceGameStateMinutes } from "../time";
import type { EventDefinition, EventTrigger, GameState } from "../types";
import { LocationService } from "../world";

export interface TravelEventFlowResult {
  state: GameState;
  triggeredEvent: EventDefinition | null;
  scene: NarrativeViewModel | null;
}

export type RuntimeRandomFloat = () => number;

export interface RuntimeEventHistoryOptions {
  eventHistoryWriteStrategy?: EventHistoryWriteStrategy;
}

function readNarrativeNodeId(event: EventDefinition | null): string | null {
  if (!event?.payload) {
    return null;
  }
  const nodeId = event.payload["narrativeNodeId"];
  return typeof nodeId === "string" ? nodeId : null;
}

export function runTriggeredEventFlow(
  state: GameState,
  events: EventDefinition[],
  trigger: EventTrigger,
  narrativeRuntime: NarrativeRuntime,
  randomFloat?: RuntimeRandomFloat,
  eventHistoryOptions: RuntimeEventHistoryOptions = {},
): Pick<TravelEventFlowResult, "state" | "triggeredEvent" | "scene"> {
  const candidates = getCandidateEvents(events, state, trigger);
  const triggeredEvent = selectResolvedEvent(candidates, randomFloat);
  const stateAfterEventMark = triggeredEvent
    ? markEventCooldownTimestamp(
        markEventTriggered(state, triggeredEvent, eventHistoryOptions.eventHistoryWriteStrategy),
        triggeredEvent,
        eventHistoryOptions.eventHistoryWriteStrategy,
      )
    : state;

  let scene: NarrativeViewModel | null = null;
  const targetNodeId = readNarrativeNodeId(triggeredEvent);
  if (targetNodeId) {
    narrativeRuntime.jumpTo(targetNodeId);
    scene = narrativeRuntime.getCurrentView();
  }

  return {
    state: stateAfterEventMark,
    triggeredEvent,
    scene,
  };
}

/**
 * Runs a minimal travel flow after a location change.
 *
 * Resolution behavior:
 * - deterministic candidate filtering (trigger/conditions/once)
 * - priority-first event resolution
 * - optional weighted tie-breaking (uses default RNG when not injected)
 *
 * Phase 1: state update (location + time)
 * Phase 2: event filtering
 * Phase 3: narrative startup (if event contains narrativeNodeId)
 */
export function runTimeAdvanceEventFlow(
  state: GameState,
  minutes: number,
  events: EventDefinition[],
  narrativeRuntime: NarrativeRuntime,
  randomFloat?: RuntimeRandomFloat,
  eventHistoryOptions: RuntimeEventHistoryOptions = {},
): TravelEventFlowResult {
  const advancedState = advanceGameStateMinutes(state, minutes);

  return runTriggeredEventFlow(
    advancedState,
    events,
    "on-time-check",
    narrativeRuntime,
    randomFloat,
    eventHistoryOptions,
  );
}

export function runTravelEventFlow(
  state: GameState,
  toLocationId: string,
  locationService: LocationService,
  events: EventDefinition[],
  narrativeRuntime: NarrativeRuntime,
  randomFloat?: RuntimeRandomFloat,
  eventHistoryOptions: RuntimeEventHistoryOptions = {},
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
  const triggeredEvent = selectResolvedEvent([...locationCandidates, ...timeCandidates], randomFloat);

  // 3) Narrative startup
  if (!triggeredEvent) {
    return {
      state: advancedState,
      triggeredEvent: null,
      scene: null,
    };
  }

  return runTriggeredEventFlow(
    advancedState,
    [triggeredEvent],
    triggeredEvent.trigger,
    narrativeRuntime,
    randomFloat,
    eventHistoryOptions,
  );
}
