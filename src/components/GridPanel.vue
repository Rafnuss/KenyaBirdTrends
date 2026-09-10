<script setup>
import { computed } from "vue";

import IucnBadge from "./IucnBadge.vue";
import LkgdSummary from "./LkgdSummary.vue";
import VirtualList from "./VirtualList.vue";
import { gridList, lkgd } from "../composables/useSpeciesLists";
import { clearSquares, state } from "../store";
import { exportGridListCsv } from "../utils/csv";

const emit = defineEmits(["locate"]);

const label = computed(
  () => `Number of ${state.grid.length === 0 ? "squares for all " : ""}species`
);

const TREND_FILTERS = [
  { key: "showLost", label: "Lost" },
  { key: "showKept", label: "Kept" },
  { key: "showGained", label: "Gained" },
];
</script>

<template>
  <div class="d-flex flex-column h-100 px-2">
    <div class="my-2">
      <LkgdSummary :label="label" :values="lkgd" />
    </div>

    <div v-if="state.grid.length === 0" class="alert alert-info mt-3">
      <p>
        Click on one or multiple circle(s) on the map to select a grid square and view the species
        list for that area.
      </p>
      <p>
        For each species, you can see whether it has been gained, lost, or kept between the two
        periods.
      </p>
      <p>You can export this species list as a CSV file.</p>
      <div class="text-center">
        <button type="button" class="btn btn-primary" @click="emit('locate')">
          Find target list at my location
        </button>
      </div>
    </div>

    <template v-else>
      <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
        <span v-for="g in state.grid" :key="g" class="badge text-bg-primary">{{ g }}</span>
        <button
          v-tooltip="'Clear squares selection'"
          type="button"
          class="badge text-bg-danger border-0"
          @click="clearSquares()"
        >
          <i class="bi bi-trash-fill" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm btn-xs ms-auto"
          @click="exportGridListCsv(gridList, state.grid)"
        >
          <i class="bi bi-download" /> Download list
        </button>
      </div>

      <div class="d-flex align-items-center flex-wrap gap-3 mb-1">
        <span>Filter:</span>
        <div v-for="f in TREND_FILTERS" :key="f.key" class="form-check mb-0">
          <input :id="f.key" v-model="state[f.key]" class="form-check-input" type="checkbox" />
          <label class="form-check-label" :for="f.key">{{ f.label }}</label>
        </div>
      </div>

      <!-- Windowed: the unfiltered list is ~1000 rows. -->
      <div class="flex-grow-1 overflow-hidden mb-2">
        <VirtualList :items="gridList" class="small border rounded">
          <template #default="{ item }">
            <div class="d-flex align-items-center h-100 px-3 border-bottom">
              <b class="text-truncate" :title="item.common_name">{{ item.common_name }}</b>
              <IucnBadge :category="item.IUCN" :iucn-id="item.IUCNID" />
              <div class="box-sm ms-auto flex-shrink-0" :class="item.trend" />
            </div>
          </template>
        </VirtualList>
      </div>
    </template>
  </div>
</template>
