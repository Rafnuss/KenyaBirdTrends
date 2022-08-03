<template>
  <b-container fluid class="h-100 d-flex flex-column p-0">
    <b-row class="flex-grow-1 no-gutters">
      <b-col md="4" fluid="md" class="vh-100">
        <b-card class="h-100" no-body>
          <b-card-header header-tag="nav">
            <b-row align-v="center">
              <b-col md="auto">
                <h2>Kenya Bird Atlas</h2>
              </b-col>
              <b-col>
                <b-form-radio-group
                  v-model="mode_selected"
                  :options="mode_options"
                  buttons
                  button-variant="outline-primary"
                  size="sm"
                  class="float-right"
                ></b-form-radio-group>
              </b-col>
            </b-row>
          </b-card-header>
          <b-card-body>
            <b-row v-if="mode_selected == 'Grid'">
              <b-col cols="12">
                 <b-row class="alert-dark px-0 pb-2 pt-3">
                <b-col>
                <div class="kept d-flex w-100 p-0">
                  <div
                    class="p-2 lost"
                    :style="{
                      width:
                        (nb_lkgd[0] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) *
                          100 +
                        '%',
                    }"
                  ></div>
                  <div
                    class="gained p-2 ml-auto"
                    :style="{
                      width:
                        (nb_lkgd[2] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) *
                          100 +
                        '%',
                    }"
                  ></div>
                </div>
                <b-row>
                  <b-col class="d-flex align-items-center">
                    <div class="box-sm lost mr-1"></div>
                    {{ nb_lkgd[0] }}
                  </b-col>
                  <b-col class="d-flex align-items-center">
                    <div class="box-sm kept mr-1"></div>
                    {{ nb_lkgd[1] }}
                  </b-col>
                  <b-col class="d-flex align-items-center">
                    <div class="box-sm gained mr-1"></div>
                    {{ nb_lkgd[2] }}
                  </b-col>
                </b-row>
              </b-col>
              <b-col v-if="gridFilter != ''" cols="auto">
                <h4>
                  <b-badge variant="primary" class="d-flex align-items-center"
                    >{{ gridFilter }}
                    <b-button
                      class="close ml-1 text-white primary"
                      aria-label="Close"
                      @click="gridFilter = ''"
                    >
                      <span aria-hidden="true">&times;</span>
                    </b-button>
                  </b-badge>
                </h4>
              </b-col>
              </b-row>
              </b-col>
              <b-col cols="12" class="mb-3">
                <b-row>
                  <b-col cols="auto">Filter: </b-col>
                  <b-col cols="auto">
                    <b-form-checkbox id="checkbox-lost" v-model="checkbox_lost"
                      >Lost</b-form-checkbox
                    ></b-col
                  >
                  <b-col cols="auto">
                    <b-form-checkbox id="checkbox-kept" v-model="checkbox_kept"
                      >Kept</b-form-checkbox
                    ></b-col
                  >
                  <b-col cols="auto">
                    <b-form-checkbox
                      id="checkbox-gained"
                      v-model="checkbox_gained"
                      >Gained</b-form-checkbox
                    ></b-col
                  >
                </b-row>
              </b-col>
              <b-col v-if="gridFilter == ''" cols="12">
                <div>
                  <b-alert show variant="info" dismissible>
                    <h4 class="alert-heading">Welcome!</h4>
                    <p>
                      Explore the change of bird distribution between 1980 and
                      2020!
                    </p>
                    <p>
                      You can explore by <code>Grid</code> or
                      <code>Species</code>
                    </p>
                    <hr />
                    <p class="mb-0">
                      For <code>Grid</code> exploration, click on the map!
                    </p>
                  </b-alert>
                </div>
              </b-col>
              <b-col v-else>
                <b-row>
                  <b-col cols="12">
                    <b-list-group class="h-100">
                      <b-list-group-item
                        v-for="(i, u) in gridList"
                        :key="i.Id"
                        class="d-flex btn-sm py-1 px-3"
                      >
                        {{ u + 1 }}. <b class="ml-1">{{ i.CommonName }}</b>
                        <div
                          class="box box-sm"
                          :class="{
                            kept: i.cat == 'kept',
                            gained: i.cat == 'gained',
                            lost: i.cat == 'lost',
                          }"
                        ></div>
                      </b-list-group-item>
                    </b-list-group>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
            <b-row v-else>
              <b-col cols="12">
                <v-select
                  v-model="species_selected"
                  :options="species_options"
                  :reduce="(x) => x.SEQ"
                  label="CommonName"
                  placeholder="Select a species"
                ></v-select>
              </b-col>
              <b-col cols="12"> Ta </b-col>
              <b-col cols="12">
                <b-form-select
                  v-model="filter_selected"
                  :options="filter_options"
                ></b-form-select>
              </b-col>
              <b-col cols="12">
                <b-list-group class="h-100">
                  <b-list-group-item
                    v-for="(i, u) in speciesList"
                    :key="i.Id"
                    class="d-flex btn-sm py-1 px-2"
                  >
                    {{ u + 1 }}. <b>{{ i.CommonName }}</b>
                    <div
                      class="bar kept"
                      v-b-tooltip.right.hover.html="
                        '<b>Lost:</b> ' +
                        i.nb_lkgd[0] +
                        '<br><b>Kept:</b> ' +
                        i.nb_lkgd[1] +
                        '<br><b>Gained:</b> ' +
                        i.nb_lkgd[2]
                      "
                    >
                      <div
                        class="bar-left lost"
                        :style="{
                          width:
                            (i.nb_lkgd[0] /
                              (i.nb_lkgd[0] + i.nb_lkgd[1] + i.nb_lkgd[2])) *
                              100 +
                            'px',
                        }"
                      ></div>
                      <div
                        class="bar-right gained"
                        :style="{
                          width:
                            (i.nb_lkgd[2] /
                              (i.nb_lkgd[0] + i.nb_lkgd[1] + i.nb_lkgd[2])) *
                              100 +
                            'px',
                        }"
                      ></div>
                    </div>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col class="flex-grow-1">
        <l-map :bounds="bounds" ref="map">
          <l-tile-layer
            v-for="tileProvider in tileProviders"
            :key="tileProvider.name"
            :name="tileProvider.name"
            :visible="tileProvider.visible"
            :url="tileProvider.url"
            :attribution="tileProvider.attribution"
            layer-type="base"
          />
          <l-control-layers />
          <l-control
            position="bottomleft"
            class="
              leaflet-control-layers
              leaflet-control-layers-expanded
              leaflet-control
            "
          >
            <label for="range-1">Opacity</label>
            <b-form-input
              id="range-1"
              v-model="opacity_value"
              type="range"
              min="0"
              max="1"
              step="0.01"
            ></b-form-input>
          </l-control>

          <l-geo-json
            v-if="mode_selected == 'Grid'"
            :geojson="geojson"
            :options-style="geojson_grid_styleFunction"
            :options="geojson_grid_options"
            @click="geojson_grid_clickGeoJsonFunction"
          ></l-geo-json>
          <l-geo-json
            v-if="mode_selected == 'Species'"
            :geojson="geojson"
            :options-style="geojson_species_styleFunction"
            :options="geojson_species_options"
          ></l-geo-json>
        </l-map>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import "vue-select/dist/vue-select.css";

const RdYlGn = [
  "#a50026",
  "#d73027",
  "#f46d43",
  "#fdae61",
  "#fee08b",
  "#ffffbf",
  "#d9ef8b",
  "#a6d96a",
  "#66bd63",
  "#1a9850",
  "#006837",
];

import { latLngBounds } from "leaflet";
import {
  LMap,
  LTileLayer,
  LControlLayers,
  LControl,
  LControlZoom,
  LMarker,
  LPopup,
  LIcon,
  LCircle,
  LCircleMarker,
  LGeoJson,
} from "vue2-leaflet";
import Vue2LeafletMarkerCluster from "vue2-leaflet-markercluster";

import "leaflet-defaulticon-compatibility/";

import chroma from "chroma-js";
import geojson from "./assets/grid_target.json";
import sp_old0 from "./assets/sp_old.json";

const sp_old = sp_old0.filter((sp) => sp.SEQ != null);

let init_lkgd = sp_old.reduce(
  (acc, sp) => {
    acc[0] = acc[0] + sp.nb_lkgd[0];
    acc[1] = acc[1] + sp.nb_lkgd[1];
    acc[2] = acc[2] + sp.nb_lkgd[2];
    acc[3] = acc[3] + sp.nb_lkgd[3];
    return acc;
  },
  [0, 0, 0, 0]
);

let min = geojson.features.reduce(
  (acc, x) => Math.min(x.properties.nb_lkgd[3], acc),
  10000
);
let max = geojson.features.reduce(
  (acc, x) => Math.max(x.properties.nb_lkgd[3], acc),
  -10000
);
const colorscale_grid = chroma.scale("RdYlGn").domain([min, max]);

export default {
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LControl,
    LControlZoom,
    LMarker,
    LPopup,
    LIcon,
    LCircle,
    LCircleMarker,
    LGeoJson,
    "v-marker-cluster": Vue2LeafletMarkerCluster,
  },
  data() {
    return {
      mode_options: ["Grid", "Species"],
      mode_selected: "Grid",
      checkbox_lost: true,
      checkbox_kept: true,
      checkbox_gained: true,
      species_options: sp_old,
      species_selected: "",
      filter_options: ["Taxonomy", "Lost", "Gained", "Kept", "Gained-Lost"],
      filter_selected: "Taxonomy",
      gridFilter: "",
      bounds: latLngBounds([
        [5.615985, 43.50585],
        [-5.353521, 32.958984],
      ]),
      geojson: geojson,
      tileProviders: [
        {
          name: "Mapbox.Streets",
          visible: true,
          url: "https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
          attribution: "",
        },
        {
          name: "Mapbox.Satellite",
          visible: false,
          url: "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
          attribution: "",
        },
        {
          name: "OpenStreetMap",
          visible: false,
          attribution:
            '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        {
          name: "Esri.WorldImagery",
          visible: false,
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      ],
      opacity_value: 0.8,
    };
  },
  methods: {},
  computed: {
    nb_lkgd() {
      if (this.gridFilter == "") {
        return init_lkgd;
      } else {
        let f = geojson.features.filter((y) => {
          return y.properties.Sq == this.gridFilter;
        });
        //let prop = f[0].properties.nb_lkgd;
        //return [prop.lost, prop.kept, prop.gained];
        return f[0].properties.nb_lkgd;
      }
    },
    gridList() {
      let f = geojson.features.filter((y) => {
        return y.properties.Sq == this.gridFilter;
      });
      let sp_old_returned = sp_old.map((y) => {
        var n = f[0].properties.SEQ_new.includes(y.SEQ);
        let o = f[0].properties.SEQ_old.includes(y.SEQ);
        y.cat = n & o ? "kept" : n ? "gained" : o ? "lost" : "";
        return y;
      });
      return sp_old_returned.filter((y) => {
        if (y.cat == "lost") {
          return this.checkbox_lost;
        } else if (y.cat == "kept") {
          return this.checkbox_kept;
        } else if (y.cat == "gained") {
          return this.checkbox_gained;
        } else {
          return false;
        }
      });
    },
    speciesList() {
      let sp_old_returned = sp_old;
      if (this.filter_selected == "Taxonomy") {
        sp_old_returned = sp_old_returned.sort((a, b) => a.SEQ - b.SEQ);
      } else if (this.filter_selected == "Lost") {
        sp_old_returned = sp_old_returned.sort((a, b) => b.lost - a.lost);
      } else if (this.filter_selected == "Gained") {
        sp_old_returned = sp_old_returned.sort((a, b) => b.gained - a.gained);
      } else if (this.filter_selected == "Kept") {
        sp_old_returned = sp_old_returned.sort((a, b) => b.kept - a.kept);
      } else if (this.filter_selected == "Gained-Lost") {
        sp_old_returned = sp_old_returned.sort((a, b) => b.diff - a.diff);
      }
      return sp_old_returned;
    },
    geojson_grid_options() {
      return {
        onEachFeature: (feature, layer) => {
          let prop = feature.properties;
          layer.bindTooltip(
            "<b>grid:</b> " +
              prop.Sq +
              "<br>" +
              "<b>lost:</b> " +
              prop.nb_lkgd[0] +
              "<br>" +
              "<b>kept:</b> " +
              prop.nb_lkgd[1] +
              "<br>" +
              "<b>gained:</b> " +
              prop.nb_lkgd[2] +
              "<br>" +
              "<b>difference:</b> " +
              prop.nb_lkgd[3],
            { permanent: false, sticky: true }
          );
        },
      };
    },
    geojson_grid_styleFunction() {
      let opa = this.opacity_value;
      let sq = this.gridFilter;
      return (feature, layer) => {
        let fillColor = colorscale_grid(feature.properties.nb_lkgd[3]);
        if (sq != "") {
          if (sq != feature.properties.Sq) {
            //fillColor = fillColor.darken(2)
            opa = parseFloat(this.opacity_value) / 3;
          } else {
            opa = 1;
          }
        }
        return {
          weight: 0,
          color: "#FFFFFF",
          opacity: opa,
          fillColor: fillColor,
          fillOpacity: opa,
        };
      };
    },
    geojson_grid_clickGeoJsonFunction() {
      return (e) => {
        if (this.mode_selected == "Grid") {
          let Sq = e.sourceTarget.feature.properties.Sq;
          this.gridFilter = this.gridFilter == Sq ? "" : Sq;
        }
      };
    },
    geojson_species_styleFunction() {
      let opa = this.opacity_value;
      let sp = this.species_selected;
      return (feature, layer) => {
        let n = feature.properties.SEQ_new.includes(sp);
        let o = feature.properties.SEQ_old.includes(sp);
        let fillColor = o ? (n ? "#d9ef8b" : "#d73027") : "#1a9850";
        return {
          weight: 0,
          color: "#FFFFFF",
          opacity: !n & !o ? 0 : opa,
          fillColor: fillColor,
          fillOpacity: !n & !o ? 0 : opa,
        };
      };
    },
    geojson_species_options() {
      let sp = this.species_selected;
      return {
        onEachFeature: (feature, layer) => {
          let n = feature.properties.SEQ_new.includes(sp);
          let o = feature.properties.SEQ_old.includes(sp);
          let status = o ? (n ? "kept" : "lost") : "gained";
          if (n | o) {
            layer.bindTooltip(
              "<b>Grid:</b> " +
                feature.properties.Sq +
                "<br>" +
                "<b>Status:</b> " +
                status,
              { permanent: false, sticky: true }
            );
          }
        },
      };
    },
  },
  mounted() {},
  created() {},
};
</script>
<style>
html,
body {
  height: 100%;
  margin: 0;
}
.card-body {
  overflow-y: scroll;
}
.box-legend {
  width: 20px;
  height: 20px;
  margin: 5px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.box-sm {
  width: 0.875rem;
  height: 0.875rem;
  margin-left: auto;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.bar {
  width: 100px;
  height: 0.875rem;
  margin-left: auto;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
.bar-left {
  float: left;
  height: 0.875rem;
}
.bar-right {
  float: right;
  height: 0.875rem;
}
.lost {
  background: #d73027;
}
.kept {
  background: #d9ef8b;
}
.gained {
  background: #1a9850;
}
.custom-checkbox #checkbox-lost:checked ~ .custom-control-label::before {
  background-color: #d73027 !important;
}
.custom-checkbox #checkbox-lost ~ .custom-control-label::before {
  border: 1px solid #d73027;
}
.custom-checkbox #checkbox-kept:checked ~ .custom-control-label::before {
  background-color: #d9ef8b !important;
}
.custom-checkbox #checkbox-kept ~ .custom-control-label::before {
  border: 1px solid #d9ef8b;
}
.custom-checkbox #checkbox-gained:checked ~ .custom-control-label::before {
  background-color: #1a9850 !important;
}
.custom-checkbox #checkbox-gained ~ .custom-control-label::before {
  border: 1px solid #1a9850;
}
</style>
