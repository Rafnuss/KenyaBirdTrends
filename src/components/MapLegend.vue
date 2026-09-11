<script setup>
import AppIcon from "./AppIcon.vue";
import LegendCircle from "./LegendCircle.vue";
import { state } from "../store";

const TRENDS = [
  {
    key: "lost",
    label: "Lost",
    title:
      "The species was present in the historical atlas but was not recorded in the recent period.",
  },
  { key: "kept", label: "Kept", title: "The species was present in both time periods." },
  {
    key: "gained",
    label: "Gained",
    title:
      "The species was not present in the historical atlas but was recorded in the recent period.",
  },
];

const EFFORT_HELP =
  "Change in effort is based on the difference between estimated coverage of the old atlas and the total duration of the new atlas.";
const CONFIDENCE_HELP =
  "The confidence is based on the change in effort between the old and new atlases. For example, a small red circle indicates an unlikely loss of the species, while a large green circle indicates a likely gain.";
const COVERAGE_HELP =
  "Coverage is considered good if it had a modelled coverage >30% in the old atlas and at least 24hr of total observation time in the new atlas.";
</script>

<template>
  <button
    v-if="!state.legend"
    type="button"
    class="btn btn-primary btn-sm d-lg-none"
    title="Show legend"
    @click="state.legend = true"
  >
    <AppIcon name="question-circle-fill" />
  </button>

  <div
    v-else
    class="leaflet-control-layers leaflet-control-layers-expanded px-3 py-2"
    style="width: 240px"
  >
    <button
      type="button"
      class="btn-close float-end d-lg-none"
      aria-label="Hide legend"
      @click="state.legend = false"
    ></button>

    <div v-if="state.mode === 'Grid'" class="mb-1">
      <b>Change in number of species</b>
      <div class="legend-gradient" style="width: 100%; height: 15px"></div>
      <div class="d-flex justify-content-between legend-scale">
        <span>-200</span><span>0</span><span>200</span>
      </div>
    </div>

    <div v-else class="mb-1">
      <b>Circle color</b>
      <div class="d-flex">
        <div
          v-for="t in TRENDS"
          :key="t.key"
          v-tooltip="t.title"
          class="flex-fill d-inline-flex justify-content-center align-items-center"
        >
          <LegendCircle size="18" class="me-1" :class="t.key" /> {{ t.label }}
        </div>
      </div>
    </div>

    <div class="mb-1">
      <b>{{ state.mode === "Grid" ? "Change in effort" : "Confidence" }}</b>
      <AppIcon
        v-tooltip="state.mode === 'Grid' ? EFFORT_HELP : CONFIDENCE_HELP"
        name="question-circle-fill"
        class="help-icon"
      />
      <div class="d-flex align-items-center justify-content-between">
        <LegendCircle v-for="size in [12, 15, 18, 21, 24]" :key="size" :size="size" />
      </div>
      <div class="d-flex justify-content-between legend-scale">
        <span>{{ state.mode === "Grid" ? "Reduced" : "Low" }}</span>
        <span>{{ state.mode === "Grid" ? "Increased" : "High" }}</span>
      </div>
    </div>

    <div>
      <b>Coverage</b>
      <AppIcon v-tooltip="COVERAGE_HELP" name="question-circle-fill" class="help-icon" />
      <div class="d-flex align-items-center">
        <div style="width: 25px" class="d-flex">
          <LegendCircle size="7" opacity="0.7" class="m-auto" />
        </div>
        <label class="ms-1 flex-grow-1" for="poor-coverage">Poor coverage</label>
        <div class="form-check form-switch mb-0">
          <input
            id="poor-coverage"
            v-model="state.displayPoorCoverage"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
        </div>
      </div>
      <div v-if="state.mode === 'Species'" class="d-flex align-items-center">
        <div style="width: 25px" class="d-flex">
          <LegendCircle size="18" opacity="0.3" class="m-auto" />
        </div>
        <label class="ms-1 flex-grow-1" for="never-observed">Never observed</label>
        <div class="form-check form-switch mb-0">
          <input
            id="never-observed"
            v-model="state.displayNeverObserved"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legend-scale {
  font-size: 9px;
}
.help-icon {
  margin-left: 0.25rem;
  color: #6a6a6a;
  cursor: help;
}
.help-icon:hover {
  color: #204e4a;
}
</style>
