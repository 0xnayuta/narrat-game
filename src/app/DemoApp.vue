<template>
  <main class="demo-app">
    <header class="demo-app__header">
      <h1>Engine Demo</h1>
      <p>{{ locationName }} · {{ timeLabel }}</p>
      <p><strong>Mode:</strong> {{ appMode }}</p>
    </header>

    <HudStats
      :location-name="locationName"
      :time-label="timeLabel"
      :quest-status="questStatus"
      :quest-step-id="questStepId"
      :current-goal="currentGoal"
    />

    <TextPanel :text="sceneText" />
    <ChoiceList :choices="sceneChoices" @select="handleChoice" />
    <section v-if="showCloseScene" class="demo-app__scene-actions">
      <button type="button" class="demo-app__button" @click="handleCloseScene">
        Continue
      </button>
    </section>

    <section class="demo-app__travel">
      <h2>Travel</h2>
      <div class="demo-app__travel-buttons">
        <button
          v-for="location in adjacentLocations"
          :key="location.id"
          type="button"
          class="demo-app__button"
          :disabled="!canTravel"
          @click="handleTravel(location.id)"
        >
          Go to {{ location.name }}
        </button>
      </div>
      <p v-if="!canTravel" class="demo-app__hint">Finish or close the current scene before traveling.</p>
    </section>

    <section class="demo-app__save-actions">
      <h2>Save / Load</h2>
      <div class="demo-app__travel-buttons">
        <button type="button" class="demo-app__button" @click="handleSave">Save</button>
        <button type="button" class="demo-app__button" @click="handleLoad">Load</button>
      </div>
      <p class="demo-app__hint">{{ saveMessage }}</p>
    </section>

    <section class="demo-app__meta">
      <p><strong>Last event:</strong> {{ lastEventId ?? "none" }}</p>
      <p><strong>Flags:</strong> {{ activeFlagSummary }}</p>
    </section>

    <DebugPanel
      :app-mode="appMode"
      :can-travel="canTravel"
      :has-active-scene="hasActiveScene"
      :can-close-scene="showCloseScene"
      :scene-id="sceneId"
      :last-event-id="lastEventId"
      :triggered-once-events="triggeredOnceEvents"
      :active-flags="activeFlagEntries"
      :vars="varEntries"
      :quests="questEntries"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { createDemoSession } from "./createDemoSession";
import { getCurrentTimeLabel, LocationService, SaveService } from "../engine";
import { demoContentBundle } from "../content/demo";
import TextPanel from "../ui/text-rpg/TextPanel.vue";
import ChoiceList from "../ui/text-rpg/ChoiceList.vue";
import HudStats from "../ui/text-rpg/HudStats.vue";
import DebugPanel from "../ui/text-rpg/DebugPanel.vue";

const DEMO_SAVE_SLOT = "demo-slot-1";

const session = createDemoSession();
const saveService = new SaveService();
const locationService = new LocationService(demoContentBundle.locations);

const state = ref(session.getState());
const scene = ref(session.getCurrentScene());
const lastEventId = ref<string | null>(null);
const saveMessage = ref("No save loaded.");

const currentLocation = computed(() => locationService.getLocationById(state.value.currentLocationId));
const adjacentLocations = computed(() =>
  locationService.getAdjacentLocations(state.value.currentLocationId),
);
const locationName = computed(() => currentLocation.value?.name ?? state.value.currentLocationId);
const timeLabel = computed(() => getCurrentTimeLabel(state.value.time));
const sceneText = computed(() => scene.value?.text ?? "Travel to a nearby location to trigger the demo.");
const sceneChoices = computed(() => scene.value?.choices ?? []);
const appMode = computed(() => session.getMode());
const canTravel = computed(() => session.canTravel());
const hasActiveScene = computed(() => session.hasActiveScene());
const sceneId = computed(() => scene.value?.nodeId ?? null);
const showCloseScene = computed(() => session.canCloseScene());
const quest = computed(() => state.value.quests.quest_intro_walk);
const questStatus = computed(() => quest.value?.status ?? null);
const questStepId = computed(() => quest.value?.currentStepId ?? null);
const currentGoal = computed(() => {
  const goal = state.value.vars.current_goal;
  return typeof goal === "string" ? goal : null;
});
const activeFlagEntries = computed(() =>
  Object.entries(state.value.flags)
    .filter(([, active]) => active)
    .map(([key, value]) => ({ key, value })),
);
const activeFlagSummary = computed(() =>
  activeFlagEntries.value.length > 0
    ? activeFlagEntries.value.map((entry) => entry.key).join(", ")
    : "none",
);
const triggeredOnceEvents = computed(() =>
  activeFlagEntries.value
    .map((entry) => entry.key)
    .filter((key) => key.startsWith("event.once."))
    .map((key) => key.replace("event.once.", "")),
);
const varEntries = computed(() =>
  Object.entries(state.value.vars).map(([key, value]) => ({ key, value })),
);
const questEntries = computed(() =>
  Object.entries(state.value.quests).map(([id, quest]) => ({
    id,
    status: quest.status,
    stepId: quest.currentStepId ?? null,
  })),
);

function syncFromSession() {
  state.value = session.getState();
  scene.value = session.getCurrentScene();
}

function handleTravel(locationId: string) {
  const result = session.travelTo(locationId);
  lastEventId.value = result.triggeredEventId;
  syncFromSession();
}

function handleChoice(choiceId: string) {
  const result = session.choose(choiceId);
  lastEventId.value = result.triggeredEventId;
  syncFromSession();
}

function handleCloseScene() {
  session.closeScene();
  lastEventId.value = null;
  syncFromSession();
}

function handleSave() {
  saveService.save(DEMO_SAVE_SLOT, session.getState());
  saveMessage.value = `Saved to ${DEMO_SAVE_SLOT}.`;
}

function handleLoad() {
  const loaded = saveService.load(DEMO_SAVE_SLOT);
  if (!loaded) {
    saveMessage.value = `No save found in ${DEMO_SAVE_SLOT}.`;
    return;
  }

  session.restoreState(loaded);
  lastEventId.value = null;
  saveMessage.value = `Loaded from ${DEMO_SAVE_SLOT}.`;
  syncFromSession();
}
</script>
