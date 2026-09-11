<script setup>
import AppIcon from "./AppIcon.vue";
import { computed, ref, useTemplateRef, watch } from "vue";
import Multiselect from "vue-multiselect";

import IucnBadge from "./IucnBadge.vue";
import LkgdSummary from "./LkgdSummary.vue";
import SpeciesTrendBar from "./SpeciesTrendBar.vue";
import VirtualList from "./VirtualList.vue";
import { lkgd, spFiltered, spSorted, species } from "../composables/useSpeciesLists";
import { RED_LIST_OPTIONS, SORT_OPTIONS, TRAIT_OPTIONS, state } from "../store";

const list = useTemplateRef("list");
const showFilters = ref(false);

/** Multiselect needs an object; the store's source of truth is a SEQ. */
const selected = computed({
  get: () => species.value,
  set: (sp) => {
    state.speciesSeq = sp?.SEQ ?? null;
  },
});

const label = computed(() => `Number of squares${species.value ? "" : " for all species"}`);

/**
 * sp_base.json is inconsistent here: most species nest their eBird codes
 * ([["golher1"]]) while a few list them flat (["ostric2", "ostric3"]).
 * Flattening covers both without the template having to guess.
 */
const ebirdCodes = computed(() => (species.value?.ebird ?? []).flat(Infinity).filter(Boolean));

const selectLabel = ({ common_name, scientific_name }) =>
  scientific_name ? `${common_name} — [${scientific_name}]` : common_name;

function toggleTrait(trait) {
  const i = state.traitsSelected.indexOf(trait);
  if (i === -1) state.traitsSelected.push(trait);
  else state.traitsSelected.splice(i, 1);
}

// Re-sorting moves the selected row; bring it back into view.
watch(
  () => state.sortSelected,
  () => {
    if (state.speciesSeq == null) return;
    const i = spSorted.value.findIndex((sp) => sp.SEQ === state.speciesSeq);
    if (i >= 0) list.value?.scrollToIndex(i);
  }
);
</script>

<template>
  <div class="d-flex flex-column h-100 px-2">
    <div class="mt-2">
      <Multiselect
        v-model="selected"
        :options="spFiltered"
        placeholder="Select a species"
        :custom-label="selectLabel"
        track-by="SEQ"
        :show-labels="false"
      >
        <template #option="{ option }">
          {{ option.common_name }}
          <IucnBadge :category="option.IUCN" :link="false" class="ms-1" />
        </template>
        <template #singleLabel="{ option }">
          <b>{{ option.common_name }}</b>
          <span v-if="option.scientific_name" class="sublegend ms-2">
            <i>{{ option.scientific_name }}</i>
          </span>
        </template>
      </Multiselect>
    </div>

    <div v-if="species" class="d-flex flex-wrap align-items-center gap-1 pt-2">
      <IucnBadge :category="species.IUCN" :iucn-id="species.IUCNID" always />
      <a
        v-for="code in ebirdCodes"
        :key="'ebird-' + code"
        class="btn btn-outline-primary btn-xs"
        :href="`https://ebird.org/species/${code}/KE`"
        target="_blank"
      >
        eBird-{{ code }}
      </a>
      <a
        v-for="(id, i) in species.kbm"
        :key="'kbm-' + i"
        class="btn btn-outline-primary btn-xs"
        :href="`https://kenya.birdmap.africa/species/${id}`"
        target="_blank"
      >
        KBM-{{ id }}
      </a>
      <a
        class="btn btn-primary btn-xs ms-auto"
        :href="`species_map/${species.SEQ}.png`"
        target="_blank"
      >
        <AppIcon name="download" /> Download map
      </a>
    </div>

    <div v-if="species?.flag" class="alert alert-warning my-2 small py-2 px-3">
      <AppIcon name="exclamation-triangle" />
      {{ species.flag }}
    </div>

    <div class="my-2">
      <LkgdSummary :label="label" :values="lkgd" />
    </div>

    <div class="d-flex align-items-center gap-2">
      <button
        type="button"
        class="btn btn-link btn-sm p-0 me-auto text-decoration-none"
        :aria-expanded="showFilters"
        @click="showFilters = !showFilters"
      >
        <AppIcon :name="showFilters ? 'caret-down-fill' : 'caret-right-fill'" />
        Filters list
      </button>
      <small class="text-muted">Sort by:</small>
      <select v-model="state.sortSelected" class="form-select form-select-sm w-auto">
        <option v-for="o in SORT_OPTIONS" :key="o" :value="o">{{ o }}</option>
      </select>
    </div>

    <div v-show="showFilters" class="card bg-light my-2">
      <div class="card-body py-2 d-flex flex-wrap align-items-end gap-3">
        <div>
          <div v-for="t in TRAIT_OPTIONS" :key="t" class="form-check form-check-inline">
            <input
              :id="'trait-' + t"
              class="form-check-input"
              type="checkbox"
              :checked="state.traitsSelected.includes(t)"
              @change="toggleTrait(t)"
            />
            <label class="form-check-label small" :for="'trait-' + t">{{ t }}</label>
          </div>
        </div>
        <div>
          <label for="red-list" class="form-label small mb-1">Red list category:</label>
          <select id="red-list" v-model="state.redListSelected" class="form-select form-select-sm">
            <option v-for="o in RED_LIST_OPTIONS" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Windowed: ~1065 rows, and every row used to re-render on selection. -->
    <div class="flex-grow-1 overflow-hidden mt-2 mb-2">
      <VirtualList ref="list" :items="spSorted" label="Species" class="small border rounded">
        <template #default="{ item }">
          <div
            class="species-row d-flex align-items-center gap-2 h-100 ps-3 pe-2 border-bottom"
            :class="{ active: item.SEQ === state.speciesSeq }"
            role="gridcell"
            tabindex="0"
            :aria-selected="item.SEQ === state.speciesSeq"
            @click="state.speciesSeq = item.SEQ"
            @keydown.enter="state.speciesSeq = item.SEQ"
            @keydown.space.prevent="state.speciesSeq = item.SEQ"
          >
            <b class="text-truncate" :title="item.common_name">{{ item.common_name }}</b>
            <IucnBadge :category="item.IUCN" :iucn-id="item.IUCNID" />
            <SpeciesTrendBar :values="item.nb_lkgd" />
          </div>
        </template>
      </VirtualList>
    </div>
  </div>
</template>

<style scoped>
.species-row {
  cursor: pointer;
}
.species-row:hover {
  background: #f8f9fa;
}
.species-row.active {
  background: #cfe2ff;
}
</style>
