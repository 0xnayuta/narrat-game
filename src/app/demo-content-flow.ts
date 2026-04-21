/**
 * Minimal demo runner wiring content layer to engine flow.
 * This is for manual validation of the engine chain, not a full game loop.
 */

import { getCurrentTimeLabel } from "../engine/time";
import { NarrativeRuntime } from "../engine/narrative";
import { runTravelEventFlow } from "../engine/runtime";
import { createInitialGameState } from "../engine/state/GameState";
import { LocationService } from "../engine/world";
import { demoEvents, demoLocations, demoNarrativeGraph } from "../content/demo";

export interface DemoFlowStepResult {
  locationId: string;
  timeLabel: string;
  triggeredEventId: string | null;
  sceneText: string | null;
}

export function runDemoContentFlow(): DemoFlowStepResult[] {
  const locationService = new LocationService(demoLocations);
  const narrativeRuntime = new NarrativeRuntime(demoNarrativeGraph);

  let state = {
    ...createInitialGameState(),
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
    },
  };

  const results: DemoFlowStepResult[] = [];

  const step1 = runTravelEventFlow(
    state,
    "street",
    locationService,
    demoEvents,
    narrativeRuntime,
  );
  state = step1.state;
  results.push({
    locationId: step1.state.currentLocationId,
    timeLabel: getCurrentTimeLabel(step1.state.time),
    triggeredEventId: step1.triggeredEvent?.id ?? null,
    sceneText: step1.scene?.text ?? null,
  });

  const step2 = runTravelEventFlow(
    state,
    "market",
    locationService,
    demoEvents,
    narrativeRuntime,
  );
  results.push({
    locationId: step2.state.currentLocationId,
    timeLabel: getCurrentTimeLabel(step2.state.time),
    triggeredEventId: step2.triggeredEvent?.id ?? null,
    sceneText: step2.scene?.text ?? null,
  });

  return results;
}
