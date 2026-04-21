/**
 * Responsibility: Minimal demo wiring for travel -> time -> event -> narrative flow.
 * TODO: Replace console/demo usage with real app coordinator wiring.
 */

import { mockFlowEvents } from "../engine/events";
import { mockNarrativeGraph, NarrativeRuntime } from "../engine/narrative";
import { runTravelEventFlow } from "../engine/runtime";
import { createInitialGameState } from "../engine/state/GameState";
import { LocationService, mockLocations } from "../engine/world";

export function runMinimalFlowDemo() {
  const initialState = createInitialGameState();
  const locationService = new LocationService(mockLocations);
  const narrativeRuntime = new NarrativeRuntime(mockNarrativeGraph);

  const demoState = {
    ...initialState,
    flags: {
      ...initialState.flags,
      flow_demo_enabled: true,
    },
  };

  return runTravelEventFlow(
    demoState,
    "street",
    locationService,
    mockFlowEvents,
    narrativeRuntime,
  );
}
