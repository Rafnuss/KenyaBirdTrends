<script setup>
import { computed } from "vue";

/** The 100px lost/kept/gained bar shown against each species row. */
const props = defineProps({
  /** [lost, kept, gained, difference] */
  values: { type: Array, required: true },
});

const total = computed(() => props.values[0] + props.values[1] + props.values[2]);
const show = computed(() => total.value > 0);
const width = (n) => (total.value === 0 ? 0 : (n / total.value) * 100);

const tooltip = computed(
  () =>
    `<b>Lost:</b> ${props.values[0]}<br><b>Kept:</b> ${props.values[1]}<br><b>Gained:</b> ${props.values[2]}`
);
</script>

<template>
  <div v-if="show" v-tooltip:right.html="tooltip" class="bar kept">
    <div class="bar-left lost" :style="{ width: width(values[0]) + 'px' }"></div>
    <div class="bar-right gained" :style="{ width: width(values[2]) + 'px' }"></div>
  </div>
</template>
