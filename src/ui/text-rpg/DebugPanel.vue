<!--
  Responsibility: Render a compact debug/status snapshot for the demo session.
-->
<template>
  <section class="debug-panel">
    <h2>Debug</h2>
    <div class="debug-panel__grid">
      <div>
        <h3>Session</h3>
        <p><strong>App mode:</strong> {{ appMode }}</p>
        <p><strong>Can travel:</strong> {{ canTravel ? "yes" : "no" }}</p>
        <p><strong>Active scene:</strong> {{ hasActiveScene ? "yes" : "no" }}</p>
        <p><strong>Closable:</strong> {{ canCloseScene ? "yes" : "no" }}</p>
        <p><strong>Scene id:</strong> {{ sceneId ?? "none" }}</p>
        <p><strong>Last event:</strong> {{ lastEventId ?? "none" }}</p>
      </div>

      <div>
        <h3>Once events</h3>
        <p v-if="triggeredOnceEvents.length === 0">none</p>
        <ul v-else>
          <li v-for="eventId in triggeredOnceEvents" :key="eventId">{{ eventId }}</li>
        </ul>
      </div>

      <div>
        <h3>Flags</h3>
        <p v-if="activeFlags.length === 0">none</p>
        <ul v-else>
          <li v-for="flag in activeFlags" :key="flag.key">{{ flag.key }} = {{ flag.value }}</li>
        </ul>
      </div>

      <div>
        <h3>Vars</h3>
        <p v-if="vars.length === 0">none</p>
        <ul v-else>
          <li v-for="entry in vars" :key="entry.key">{{ entry.key }} = {{ entry.value }}</li>
        </ul>
      </div>

      <div>
        <h3>Quests</h3>
        <p v-if="quests.length === 0">none</p>
        <ul v-else>
          <li v-for="quest in quests" :key="quest.id">
            {{ quest.id }} → {{ quest.status }} ({{ quest.stepId ?? "no-step" }})
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface FlagEntry {
  key: string;
  value: boolean;
}

interface VarEntry {
  key: string;
  value: string | number | boolean;
}

interface QuestEntry {
  id: string;
  status: string;
  stepId: string | null;
}

defineProps<{
  appMode: string;
  canTravel: boolean;
  hasActiveScene: boolean;
  canCloseScene: boolean;
  sceneId: string | null;
  lastEventId: string | null;
  triggeredOnceEvents: string[];
  activeFlags: FlagEntry[];
  vars: VarEntry[];
  quests: QuestEntry[];
}>();
</script>
