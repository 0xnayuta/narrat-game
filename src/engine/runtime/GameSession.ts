/**
 * Responsibility: Coordinate state, travel flow and narrative choices for a minimal interactive session.
 * TODO: Add post-choice event checks and scene history.
 */

import { applyNarrativeChoiceEffects, NarrativeRuntime } from "../narrative";
import type { NarrativeViewModel } from "../narrative";
import { GameStateStore } from "../state/GameState";
import type { EventDefinition, GameState, NPCDefinition } from "../types";
import { getAvailableNpcInteractions, getNpcInteractionDebugInfo, LocationService } from "../world";
import type { AvailableNpcInteraction, NpcInteractionDebugEntry } from "../world";
import type { AppMode } from "./appMode";
import {
  runTravelEventFlow,
  runTriggeredEventFlow,
  type RuntimeRandomFloat,
} from "./travelEventFlow";

export interface SessionActionResult {
  state: GameState;
  scene: NarrativeViewModel | null;
  triggeredEventId: string | null;
}

export interface GameSessionOptions {
  randomFloat?: RuntimeRandomFloat;
}

export class GameSession {
  private activeScene: NarrativeViewModel | null = null;

  constructor(
    private readonly store: GameStateStore,
    private readonly locationService: LocationService,
    private readonly events: EventDefinition[],
    private readonly narrativeRuntime: NarrativeRuntime,
    private readonly npcs: NPCDefinition[] = [],
    private readonly options: GameSessionOptions = {},
  ) {}

  getState(): GameState {
    return this.store.getState();
  }

  restoreState(state: GameState): SessionActionResult {
    this.store.setState(state);
    this.activeScene = null;

    return {
      state: this.store.getState(),
      scene: null,
      triggeredEventId: null,
    };
  }

  getCurrentScene(): NarrativeViewModel | null {
    return this.activeScene;
  }

  getMode(): AppMode {
    return this.activeScene ? "in-scene" : "free-roam";
  }

  hasActiveScene(): boolean {
    return this.activeScene !== null;
  }

  canTravel(): boolean {
    return this.getMode() === "free-roam";
  }

  getAvailableNpcs(): AvailableNpcInteraction[] {
    return getAvailableNpcInteractions(this.store.getState(), this.npcs);
  }

  getNpcDebugInfo(): NpcInteractionDebugEntry[] {
    return getNpcInteractionDebugInfo(this.store.getState(), this.npcs);
  }

  canCloseScene(): boolean {
    return this.activeScene !== null && this.activeScene.choices.length === 0;
  }

  travelTo(toLocationId: string): SessionActionResult {
    if (!this.canTravel()) {
      throw new Error("Cannot travel while a narrative scene is active");
    }
    const result = runTravelEventFlow(
      this.store.getState(),
      toLocationId,
      this.locationService,
      this.events,
      this.narrativeRuntime,
      this.options.randomFloat,
    );

    this.store.setState(result.state);
    this.activeScene = result.scene;

    return {
      state: this.store.getState(),
      scene: this.activeScene,
      triggeredEventId: result.triggeredEvent?.id ?? null,
    };
  }

  interactWithNpc(npcId: string): SessionActionResult {
    if (!this.canTravel()) {
      throw new Error("Cannot start NPC interaction while a narrative scene is active");
    }

    const interaction = this.getAvailableNpcs().find((entry) => entry.npcId === npcId);
    if (!interaction) {
      throw new Error(`NPC not available at current location: ${npcId}`);
    }

    this.narrativeRuntime.jumpTo(interaction.nodeId);
    this.activeScene = this.narrativeRuntime.getCurrentView();

    return {
      state: this.store.getState(),
      scene: this.activeScene,
      triggeredEventId: null,
    };
  }

  choose(choiceId: string): SessionActionResult {
    if (this.getMode() !== "in-scene" || !this.activeScene) {
      throw new Error("No active narrative scene to choose from");
    }

    const choiceResult = this.narrativeRuntime.choose(choiceId);
    const nextState = applyNarrativeChoiceEffects(this.store.getState(), choiceResult.effects);
    const postChoiceResult = runTriggeredEventFlow(
      nextState,
      this.events,
      "after-choice",
      this.narrativeRuntime,
      this.options.randomFloat,
    );

    this.store.setState(postChoiceResult.state);
    this.activeScene = postChoiceResult.scene ?? this.narrativeRuntime.getCurrentView();

    return {
      state: this.store.getState(),
      scene: this.activeScene,
      triggeredEventId: postChoiceResult.triggeredEvent?.id ?? null,
    };
  }

  closeScene(): SessionActionResult {
    if (this.getMode() !== "in-scene" || !this.activeScene) {
      throw new Error("No active narrative scene to close");
    }
    if (!this.canCloseScene()) {
      throw new Error("Current narrative scene cannot be closed yet");
    }

    this.activeScene = null;

    return {
      state: this.store.getState(),
      scene: null,
      triggeredEventId: null,
    };
  }
}
