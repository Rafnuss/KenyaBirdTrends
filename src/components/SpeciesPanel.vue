<script setup>
import AppIcon from "./AppIcon.vue";
import { computed, ref, useTemplateRef, watch } from "vue";
import Multiselect from "vue-multiselect";

import { downloadSpeciesMap } from "../utils/speciesMap";
import IucnBadge from "./IucnBadge.vue";
import LkgdSummary from "./LkgdSummary.vue";
import SpeciesTrendBar from "./SpeciesTrendBar.vue";
import VirtualList from "./VirtualList.vue";
import { lkgd, spFiltered, spSorted, species } from "../composables/useSpeciesLists";
import { RED_LIST_OPTIONS, SORT_OPTIONS, TRAIT_OPTIONS, state } from "../store";

const list = useTemplateRef("list");
const showFilters = ref(false);

/** Multiselect needs an object; the store's source of truth is an Avibase ID. */
const selected = computed({
  get: () => species.value,
  set: (sp) => {
    state.speciesId = sp?.avibase_id ?? null;
  },
});

const label = computed(() => `Number of squares${species.value ? "" : " for all species"}`);

/**
 * eBird codes for the concept. The pipeline now emits a flat array of
 * species-level codes only (2026-09) - it used to nest them unevenly and to
 * include slash/spuh codes like `y00820`, which have no eBird species page
 * and rendered as dead links. Flattening stays as a cheap guard.
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
    if (state.speciesId == null) return;
    const i = spSorted.value.findIndex((sp) => sp.avibase_id === state.speciesId);
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
        track-by="avibase_id"
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

    <div v-if="species" class="d-flex flex-wrap flex-shrink-0 align-items-center gap-1 pt-2">
      <IucnBadge :category="species.IUCN" :birdlife-url="species.birdlife_url" always />
      <a
        v-for="concept in species.atlas_concepts"
        :key="concept.avibase_id"
        class="btn btn-outline-primary btn-xs flex-shrink-0"
        :href="`https://avibase.bsc-eoc.org/species.jsp?avibaseid=${concept.avibase_id.replace('avibase-', '')}`"
        target="_blank"
        :title="`Historical atlas: ${concept.common_name}`"
      >
        Avibase<span v-if="species.atlas_concepts.length > 1">: {{ concept.common_name }}</span>
      </a>
      <span v-if="species.atlas_concepts.length" aria-label="Historical atlas to recent records" title="Historical atlas to recent records">→</span>
      <a
        v-for="code in ebirdCodes"
        :key="'ebird-' + code"
        class="btn btn-outline-primary btn-xs flex-shrink-0"
        :href="`https://ebird.org/species/${code}/KE`"
        target="_blank"
      >
        eBird-{{ code }}
      </a>
      <a
        v-for="(id, i) in species.kbm"
        :key="'kbm-' + i"
        class="btn btn-outline-primary btn-xs flex-shrink-0"
        :href="`https://kenya.birdmap.africa/species/${id}`"
        target="_blank"
      >
        KBM-{{ id }}
      </a>
      <button class="btn btn-primary btn-xs ms-auto flex-shrink-0" @click="downloadSpeciesMap(species)">
        <AppIcon name="download" /> Download map
      </button>
    </div>

    <div v-if="species?.flag" class="alert alert-warning flex-shrink-0 my-2 small py-2 px-3">
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

    <div v-show="showFilters" class="filters-panel flex-shrink-0 my-2">
      <div class="filters-heading">Species traits</div>
      <div class="traits-grid">
        <div v-for="t in TRAIT_OPTIONS" :key="t" class="form-check">
          <input
            :id="'trait-' + t"
            class="form-check-input"
            type="checkbox"
            :checked="state.traitsSelected.includes(t)"
            @change="toggleTrait(t)"
          />
          <label class="form-check-label" :for="'trait-' + t">{{ t }}</label>
        </div>
      </div>
      <div class="red-list-filter">
        <label for="red-list" class="filters-heading mb-0">Red list category</label>
        <select id="red-list" v-model="state.redListSelected" class="form-select form-select-sm">
          <option v-for="o in RED_LIST_OPTIONS" :key="o" :value="o">{{ o }}</option>
        </select>
      </div>
    </div>

    <!-- Windowed: ~1065 rows, and every row used to re-render on selection. -->
    <div class="species-list flex-grow-1 overflow-hidden mt-2 mb-2">
      <VirtualList ref="list" :items="spSorted" label="Species" class="small border rounded">
        <template #default="{ item }">
          <div
            class="species-row d-flex align-items-center gap-2 h-100 ps-3 pe-2 border-bottom"
            :class="{ active: item.avibase_id === state.speciesId }"
            role="gridcell"
            tabindex="0"
            :aria-selected="item.avibase_id === state.speciesId"
            @click="state.speciesId = item.avibase_id"
            @keydown.enter="state.speciesId = item.avibase_id"
            @keydown.space.prevent="state.speciesId = item.avibase_id"
          >
            <b class="text-truncate" :title="item.common_name">{{ item.common_name }}</b>
            <IucnBadge :category="item.IUCN" :birdlife-url="item.birdlife_url" />
            <SpeciesTrendBar :values="item.nb_lkgd" />
          </div>
        </template>
      </VirtualList>
    </div>
  </div>
</template>

<style scoped>
.filters-panel {
  padding: 0.75rem 0.9rem;
  border: 1px solid #e0e8e5;
  border-radius: 0.5rem;
  background: #f7faf8;
  font-size: 0.875rem;
}
.filters-heading {
  color: #526a64;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}
.traits-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem 0.75rem;
  margin-top: 0.45rem;
}
.traits-grid .form-check {
  min-width: 0;
  margin: 0;
}
.traits-grid .form-check-label {
  line-height: 1.3;
}
.red-list-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem 1rem;
  margin-top: 0.7rem;
  padding-top: 0.65rem;
  border-top: 1px solid #e0e8e5;
}
.red-list-filter select {
  width: min(100%, 12rem);
}
@media (max-width: 340px) {
  .traits-grid {
    grid-template-columns: 1fr;
  }
}

.species-list {
  min-height: 0;
}

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
