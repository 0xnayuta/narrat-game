<!--
  Responsibility: Render interactive narrative choices.
-->
<template>
  <section class="choice-list">
    <p v-if="choices.length === 0" class="choice-list__empty">No choices available.</p>
    <div v-else class="choice-list__items">
      <button
        v-for="choice in choices"
        :key="choice.id"
        type="button"
        class="choice-list__button"
        @click="emit('select', choice.id)"
      >
        {{ choice.text }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ChoiceView {
  id: string;
  text: string;
}

defineProps<{
  choices: ChoiceView[];
}>();

const emit = defineEmits<{
  select: [choiceId: string];
}>();
</script>
