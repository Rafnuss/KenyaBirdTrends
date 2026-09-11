<script setup>
import { Control, DomEvent, DomUtil, control, geoJSON, map as createMap, tileLayer } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { LocateControl } from "leaflet.locatecontrol";
import { markRaw, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue";

import MapLegend from "./MapLegend.vue";
import { useCircleLayer } from "../composables/useCircleLayer";
import { KENYA_BOUNDS, gridGeojson, loadCountyGeojson, mapData, state } from "../store";

const TILE_TOKEN = "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g";
const TILE_PROVIDERS = [
  {
    name: "Streets",
    url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${TILE_TOKEN}`,
  },
  {
    name: "Satellite",
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${TILE_TOKEN}`,
  },
];

const OUTLINE = { color: "#555555", opacity: 0.65, fill: 0 };

const container = useTemplateRef("container");
/** The legend's Leaflet control container, once it exists, as a Teleport target. */
const legendHost = shallowRef(null);

const map = shallowRef(null);
const locate = shallowRef(null);
let gridLayer = null;
let countyLayer = null;
/** Set while we are reacting to the layers control, to avoid a feedback loop. */
let syncingOverlays = false;

const { attach } = useCircleLayer();

/**
 * Hosts <MapLegend> inside a Leaflet control.
 *
 * The control only supplies the positioned container; Vue renders into it via
 * <Teleport>, so the legend stays an ordinary component with normal
 * reactivity rather than imperative DOM.
 */
const LegendControl = Control.extend({
  options: { position: "bottomright" },
  onAdd() {
    const el = DomUtil.create("div");
    // Otherwise clicking the legend's switches pans the map underneath.
    DomEvent.disableClickPropagation(el);
    DomEvent.disableScrollPropagation(el);
    legendHost.value = markRaw(el);
    return el;
  },
  onRemove() {
    legendHost.value = null;
  },
});

function onLocationFound(e) {
  let nearest = 0;
  let best = Infinity;
  mapData.forEach((f, i) => {
    const d =
      (f.geometry.coordinates[0] - e.latitude) ** 2 + (f.geometry.coordinates[1] - e.longitude) ** 2;
    if (d < best) {
      best = d;
      nearest = i;
    }
  });
  if (best < 1) {
    state.grid = [mapData[nearest].properties.Sq];
    state.gridGeojsonVisible = true;
    state.showLost = true;
    state.showKept = false;
    state.showGained = false;
  } else {
    alert("Your location is too far from a square. No list will be shown");
  }
}

onMounted(() => {
  const leafletMap = createMap(container.value).fitBounds(KENYA_BOUNDS);
  map.value = markRaw(leafletMap);

  const baseLayers = Object.fromEntries(
    TILE_PROVIDERS.map((p) => [p.name, tileLayer(p.url, { attribution: "" })])
  );
  Object.values(baseLayers)[0].addTo(leafletMap);

  gridLayer = geoJSON(gridGeojson, { style: () => ({ ...OUTLINE, weight: 2 }) });
  countyLayer = geoJSON(state.countyGeojson, { style: () => ({ ...OUTLINE, weight: 1.2 }) });
  if (state.gridGeojsonVisible) gridLayer.addTo(leafletMap);
  if (state.countyGeojsonVisible) countyLayer.addTo(leafletMap);

  control
    .layers(baseLayers, { "Grid square": gridLayer, Counties: countyLayer })
    .addTo(leafletMap);

  // The layers control and the settings modal toggle the same overlays, so
  // let the control write back rather than letting the two drift apart.
  const reflect = (event, visible) => {
    if (syncingOverlays) return;
    if (event.layer === gridLayer) state.gridGeojsonVisible = visible;
    if (event.layer === countyLayer) state.countyGeojsonVisible = visible;
  };
  leafletMap.on("overlayadd", (e) => reflect(e, true));
  leafletMap.on("overlayremove", (e) => reflect(e, false));

  leafletMap.on("locationfound", onLocationFound);

  attach(leafletMap);
  new LegendControl().addTo(leafletMap);
  leafletMap.addControl(
    new GeoSearchControl({
      provider: new OpenStreetMapProvider({ params: { countrycodes: "KE" } }),
    })
  );

  locate.value = markRaw(
    new LocateControl({
      strings: { title: "Explore target species at my location!" },
      locateOptions: { maxZoom: 9 },
    })
  );
  locate.value.addTo(leafletMap);
});

onBeforeUnmount(() => {
  map.value?.remove();
  map.value = null;
  gridLayer = countyLayer = null;
});

function setOverlay(layer, visible) {
  if (!map.value || !layer) return;
  syncingOverlays = true;
  if (visible) layer.addTo(map.value);
  else map.value.removeLayer(layer);
  syncingOverlays = false;
}

watch(
  () => state.gridGeojsonVisible,
  (visible) => setOverlay(gridLayer, visible)
);

watch(
  () => state.countyGeojsonVisible,
  async (visible) => {
    setOverlay(countyLayer, visible);
    if (!visible) return;
    await loadCountyGeojson();
    // Keep the outlines under the grid circles.
    countyLayer?.bringToBack();
  }
);

// The outlines arrive after the first toggle, so refill the layer then.
watch(
  () => state.countyGeojson,
  (data) => {
    if (!countyLayer) return;
    countyLayer.clearLayers();
    countyLayer.addData(data);
    countyLayer.bringToBack();
  }
);

// Hiding the sidebar changes the map's width; Leaflet needs telling.
watch(
  () => state.sidebar,
  (open) => {
    if (open) return;
    setTimeout(() => {
      if (!map.value) return;
      map.value.invalidateSize();
      map.value.fitBounds(KENYA_BOUNDS);
    }, 10);
  }
);

defineExpose({
  startLocate: () => locate.value?.start(),
});
</script>

<template>
  <!-- Grid circles are managed imperatively in useCircleLayer rather than as
       ~215 components; the rest of the map is plain Leaflet too. -->
  <div ref="container" class="map-container"></div>
  <Teleport v-if="legendHost" :to="legendHost">
    <MapLegend />
  </Teleport>
</template>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}
</style>
