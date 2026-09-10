<script setup>
import { LControl, LControlLayers, LGeoJson, LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { LocateControl } from "leaflet.locatecontrol";
import { markRaw, shallowRef, watch } from "vue";

import MapLegend from "./MapLegend.vue";
import { useCircleLayer } from "../composables/useCircleLayer";
import { KENYA_BOUNDS, gridGeojson, loadCountyGeojson, mapData, state } from "../store";

const TILE_TOKEN = "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g";
const TILE_PROVIDERS = [
  {
    name: "Streets",
    visible: true,
    url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${TILE_TOKEN}`,
  },
  {
    name: "Satellite",
    visible: false,
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${TILE_TOKEN}`,
  },
];

const OUTLINE = { color: "#555555", opacity: 0.65, fill: 0 };
const gridStyle = () => ({ ...OUTLINE, weight: 2 });
const countyStyle = () => ({ ...OUTLINE, weight: 1.2 });

const geosearchOptions = {
  provider: markRaw(new OpenStreetMapProvider({ params: { countrycodes: "KE" } })),
};

const map = shallowRef(null);
const countyLayer = shallowRef(null);
const locate = shallowRef(null);

const { attach } = useCircleLayer();

/**
 * <l-map> lives behind `v-if`, so the map is created and destroyed as the user
 * moves in and out of the intro screen. Everything imperative hangs off this.
 */
function onMapReady(leafletMap) {
  map.value = markRaw(leafletMap);

  // @vue-leaflet treats `bounds` as a watcher rather than an initial view, so
  // without this the map has no center/zoom and renders nothing.
  leafletMap.fitBounds(KENYA_BOUNDS);

  leafletMap.on("locationfound", (e) => {
    let nearest = 0;
    let best = Infinity;
    mapData.forEach((f, i) => {
      const d =
        (f.geometry.coordinates[0] - e.latitude) ** 2 +
        (f.geometry.coordinates[1] - e.longitude) ** 2;
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
  });

  attach(leafletMap);
  leafletMap.addControl(new GeoSearchControl(geosearchOptions));

  locate.value = markRaw(
    new LocateControl({
      strings: { title: "Explore target species at my location!" },
      locateOptions: { maxZoom: 9 },
    })
  );
  locate.value.addTo(leafletMap);
}

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

watch(
  () => state.countyGeojsonVisible,
  async (visible) => {
    if (!visible) return;
    await loadCountyGeojson();
    countyLayer.value?.leafletObject?.bringToBack();
  }
);

defineExpose({
  startLocate: () => locate.value?.start(),
});
</script>

<template>
  <l-map :bounds="KENYA_BOUNDS" @ready="onMapReady">
    <l-tile-layer
      v-for="provider in TILE_PROVIDERS"
      :key="provider.name"
      :name="provider.name"
      :visible="provider.visible"
      :url="provider.url"
      attribution=""
      layer-type="base"
    />
    <l-control-layers />

    <l-control position="bottomright">
      <MapLegend />
    </l-control>

    <l-geo-json
      :geojson="gridGeojson"
      :visible="state.gridGeojsonVisible"
      :options-style="gridStyle"
      layer-type="overlay"
      name="Grid square"
    />
    <l-geo-json
      ref="countyLayer"
      :geojson="state.countyGeojson"
      :visible="state.countyGeojsonVisible"
      :options-style="countyStyle"
      layer-type="overlay"
      name="Counties"
    />
    <!-- Grid circles are managed imperatively in useCircleLayer rather than as
         ~215 <l-circle> components. -->
  </l-map>
</template>
