<!--
  Responsibility: Render minimal HUD stats (time/state preview).
-->
<template>
  <section class="hud-stats">
    <p><strong>Location:</strong> {{ locationName }}</p>
    <p><strong>Time:</strong> {{ timeLabel }}</p>
    <p><strong>Quest:</strong> {{ questStatus ?? "none" }}</p>
    <p><strong>Step:</strong> {{ questStepId ?? "none" }}</p>
    <p><strong>Goal:</strong> {{ currentGoal ?? "none" }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  locationName: string;
  timeLabel: string;
  questStatus: string | null;
  questStepId: string | null;
  currentGoal: string | null;
}>();
</script>
