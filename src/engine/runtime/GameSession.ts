/**
 * Responsibility: Coordinate state, travel flow and narrative choices for a minimal interactive session.
 * TODO: Add post-choice event checks and scene history.
 */

import { applyNarrativeChoiceEffects, filterVisibleChoices, NarrativeRuntime } from "../narrative";
import type { NarrativeViewModel } from "../narrative";
import { GameStateStore } from "../state/GameState";
import type { EventDefinition, GameState, NPCDefinition, QuestDefinition } from "../types";
import { getAvailableNpcInteractions, getNpcInteractionDebugInfo, LocationService } from "../world";
import type { AvailableNpcInteraction, NpcInteractionDebugEntry } from "../world";
import type { AppMode } from "./appMode";
import {
  runTravelEventFlow,
  runTriggeredEventFlow,
  type RuntimeRandomFloat,
  type RuntimeEventHistoryOptions,
} from "./travelEventFlow";

export interface SessionActionResult {
  state: GameState;
  scene: NarrativeViewModel | null;
  triggeredEventId: string | null;
}

export interface GameSessionOptions extends RuntimeEventHistoryOptions {
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
    private readonly quests: QuestDefinition[] = [],
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

  /**
   * Build a NarrativeViewModel with visibility-filtered choices.
   * Reads the current node from NarrativeRuntime, then filters choices
   * whose conditions don't match the current GameState.
   */
  private buildSceneView(): NarrativeViewModel {
    const node = this.narrativeRuntime.getCurrentNode();
    return {
      nodeId: node.id,
      text: node.text,
      choices: filterVisibleChoices(node.choices, this.store.getState())
        .map((choice) => ({ id: choice.id, text: choice.text })),
    };
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
      { eventHistoryWriteStrategy: this.options.eventHistoryWriteStrategy },
    );

    this.store.setState(result.state);
    this.activeScene = result.scene ? this.buildSceneView() : null;

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
    this.activeScene = this.buildSceneView();

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

    // Validate the choice is visible (conditions match current state)
    const visibleChoices = filterVisibleChoices(
      this.narrativeRuntime.getCurrentChoices(),
      this.store.getState(),
    );
    if (!visibleChoices.some((choice) => choice.id === choiceId)) {
      throw new Error(`Choice not available: ${choiceId}`);
    }

    const choiceResult = this.narrativeRuntime.choose(choiceId);
    const nextState = applyNarrativeChoiceEffects(this.store.getState(), choiceResult.effects, this.quests);
    const postChoiceResult = runTriggeredEventFlow(
      nextState,
      this.events,
      "after-choice",
      this.narrativeRuntime,
      this.options.randomFloat,
      { eventHistoryWriteStrategy: this.options.eventHistoryWriteStrategy },
    );

    this.store.setState(postChoiceResult.state);
    // If an after-choice event triggered a new scene, build view from that;
    // otherwise build view from the narrative runtime's current node.
    this.activeScene = postChoiceResult.scene ? this.buildSceneView() : this.buildSceneView();

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
