<script setup>
import { computed } from "vue";

import { state } from "../store";
import { formatNumber } from "../utils/format";

const props = defineProps({
  /** Leading text, e.g. "Number of squares". */
  label: { type: String, required: true },
  /** [lost, kept, gained, difference] */
  values: { type: Array, required: true },
});

const total = computed(() => props.values[0] + props.values[1] + props.values[2]);
const pct = (n) => (total.value === 0 ? 0 : (n / total.value) * 100);

const parts = computed(() => [
  { key: "lost", label: "lost", value: props.values[0] },
  { key: "kept", label: "kept", value: props.values[1] },
  { key: "gained", label: "gained", value: props.values[2] },
]);
</script>

<template>
  <div>
    <div class="mb-1">
      {{ label }}
      <span v-if="state.displayPoorCoverage" class="sublegend">(including poor coverage)</span>
    </div>
    <div class="lkgd-bar kept d-flex w-100">
      <div class="lost" :style="{ width: pct(values[0]) + '%' }"></div>
      <div class="gained ms-auto" :style="{ width: pct(values[2]) + '%' }"></div>
    </div>
    <div class="d-flex justify-content-between mt-1">
      <div
        v-for="part in parts"
        :key="part.key"
        class="d-flex align-items-center gap-1 flex-fill justify-content-center"
      >
        <div class="box-sm" :class="part.key"></div>
        <span>{{ formatNumber(part.value) }}</span>
        <span class="sublegend">{{ part.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lkgd-bar {
  height: 1rem;
  border-radius: 0.25rem;
  overflow: hidden;
}
</style>
