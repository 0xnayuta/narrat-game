<!--
  Responsibility: Render current narrative text block.
-->
<template>
  <section class="text-panel">
    <p>{{ text }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>
