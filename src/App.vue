<script setup>
import { useTemplateRef } from "vue";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/assets/css/leaflet.css";
import "leaflet.locatecontrol/dist/L.Control.Locate.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import "./app.scss";

import AppNavbar from "./components/AppNavbar.vue";
import GridPanel from "./components/GridPanel.vue";
import IntroPage from "./components/IntroPage.vue";
import MapView from "./components/MapView.vue";
import SettingsModal from "./components/SettingsModal.vue";
import SpeciesPanel from "./components/SpeciesPanel.vue";
import { restoreFromUrl, state, syncUrl } from "./store";

restoreFromUrl();
syncUrl();

const map = useTemplateRef("map");
</script>

<template>
  <div class="container-fluid d-flex flex-column p-0">
    <AppNavbar />

    <IntroPage
      v-if="state.mode === 'Intro'"
      @change-mode-grid="state.mode = 'Grid'"
      @change-mode-species="state.mode = 'Species'"
    />

    <div v-else class="row flex-grow-1 g-0">
      <div v-if="state.sidebar" class="col-md-6 col-lg-4 h-100-56 overflow-hidden">
        <GridPanel v-if="state.mode === 'Grid'" @locate="map?.startLocate()" />
        <SpeciesPanel v-else />
      </div>
      <!-- `h-100-56` must be on the map column too: it is the only height
           source in this row, so without it hiding the sidebar collapses the
           map to zero height and leaves a blank screen. -->
      <div class="col flex-grow-1 h-100-56">
        <MapView ref="map" />
      </div>
    </div>

    <SettingsModal />
  </div>
</template>
