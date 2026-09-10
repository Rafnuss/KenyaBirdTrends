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
    {{ label }}
    <span v-if="state.displayPoorCoverage" class="sublegend">(including poor coverage)</span>
    <div class="kept d-flex w-100 p-0">
      <div class="lost py-2" :style="{ width: pct(values[0]) + '%' }"></div>
      <div class="gained py-2 ms-auto" :style="{ width: pct(values[2]) + '%' }"></div>
    </div>
    <div class="row">
      <div
        v-for="part in parts"
        :key="part.key"
        class="col d-flex align-items-center justify-content-center"
      >
        <div class="box-sm me-1" :class="part.key"></div>
        {{ formatNumber(part.value) }}
        <span class="sublegend"> {{ part.label }}</span>
      </div>
    </div>
  </div>
</template>
