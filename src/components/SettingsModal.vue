<script setup>
import BaseModal from "./BaseModal.vue";
import { TAXONOMY_OPTIONS, state } from "../store";
</script>

<template>
  <BaseModal v-model="state.settingsOpen" title="Settings">
    <div class="card bg-light mb-3">
      <div class="card-body">
        <label for="taxonomy-select" class="form-label">Select your preferred taxonomy:</label>
        <select
          id="taxonomy-select"
          v-model="state.taxonomySelected"
          class="form-select form-select-sm mb-2"
        >
          <option v-for="t in TAXONOMY_OPTIONS" :key="t" :value="t">{{ t }}</option>
        </select>
        <p class="small mb-0">
          <b>Note: </b>In order to match the taxonomies used in the old atlas with eBird and KBM, we
          had to align species name to the lowest taxonomical resolution (i.e. lump species),
          explaining some unusual species names.
        </p>
      </div>
    </div>

    <div class="card bg-light">
      <div class="card-body">
        <p class="mb-2">Customize the map background:</p>
        <div class="form-check">
          <input
            id="show-grid"
            v-model="state.gridGeojsonVisible"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="show-grid">Show the grid squares</label>
        </div>
        <div class="form-check mb-2">
          <input
            id="show-counties"
            v-model="state.countyGeojsonVisible"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="show-counties">
            Show the county boundary lines
          </label>
        </div>
        <div class="d-flex">
          <div class="leaflet-control-layers leaflet-control d-inline">
            <span class="leaflet-control-layers-toggle"></span>
          </div>
          <span class="small ms-2">
            <b>Note: </b>You can also modify these values in the top-right menu of the map.
          </span>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
