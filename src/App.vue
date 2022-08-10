<template>
  <b-container fluid class="h-100 d-flex flex-column p-0">
    <b-row class="flex-grow-1 no-gutters">
      <b-col md="4" fluid="md" class="vh-100">
        <b-card class="h-100" no-body>
          <b-card-header header-tag="nav">
            <b-row align-v="center" class="no-gutters">
              <b-col cols="auto">
                <h2 class="d-none d-lg-block">Kenya Bird Atlas Viz</h2>
                <h2 class="d-lg-none">KBAViz</h2>
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
          <b-card-body class="flex-column d-flex">
            <b-row
              v-if="mode_selected == 'Grid'"
              class="alert-dark px-0 pb-2 pt-2"
              align-v="center"
            >
              <b-col>
                Number of
                {{ gridFilter == "" ? "squares for  all " : "" }}species
                <div class="kept d-flex w-100 p-0">
                  <div
                    class="lost py-2"
                    :style="{
                      width:
                        (nb_lkgd[0] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) *
                          100 +
                        '%',
                    }"
                  ></div>
                  <div
                    class="gained py-2 ml-auto"
                    :style="{
                      width:
                        (nb_lkgd[2] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) *
                          100 +
                        '%',
                    }"
                  ></div>
                </div>
                <b-row>
                  <b-col
                    class="d-flex align-items-center justify-content-center"
                  >
                    <div class="box-sm lost mr-1"></div>
                    {{ numberWithCommas(nb_lkgd[0]) }}
                  </b-col>
                  <b-col
                    class="d-flex align-items-center justify-content-center"
                  >
                    <div class="box-sm kept mr-1"></div>
                    {{ numberWithCommas(nb_lkgd[1]) }}
                  </b-col>
                  <b-col
                    class="d-flex align-items-center justify-content-center"
                  >
                    <div class="box-sm gained mr-1"></div>
                    {{ numberWithCommas(nb_lkgd[2]) }}
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
            <b-row v-if="mode_selected == 'Grid'">
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
                <b-form-checkbox id="checkbox-gained" v-model="checkbox_gained"
                  >Gained</b-form-checkbox
                ></b-col
              >
            </b-row>
            <b-row v-if="(mode_selected == 'Grid') & (gridFilter == '')">
              <b-col cols="12">
                <b-alert show variant="info">
                  <h4 class="alert-heading">Welcome!</h4>
                  <p>
                    Discover the change in bird distribution between 1980 and
                    2020! The distributions are retrieved from
                    <a
                      href="https://doi.org/10.1201/9781315136264"
                      target="_blank"
                      >"A Bird Atlas of Kenya"</a
                    >,
                    <a href="https://ebird.org/region/KE" target="_blank"
                      >eBird</a
                    >
                    and
                    <a href="https://kenya.birdmap.africa/" target="_blank"
                      >Kenyan Bird Map</a
                    >.
                  </p>
                  <hr />
                  <p>You can explore the changes with these two views:</p>
                  <ul>
                    <li>
                      <b-button
                        :variant="
                          mode_selected == 'Grid'
                            ? 'primary'
                            : 'outline-primary'
                        "
                        size="sm"
                        >Grid</b-button
                      >
                      Click a square on the map to see the change in species
                      diversity.
                    </li>
                    <li>
                      <b-button
                        :variant="
                          mode_selected == 'Species'
                            ? 'primary'
                            : 'outline-primary'
                        "
                        size="sm"
                        @click="mode_selected = 'Species'"
                        >Species</b-button
                      >
                      Select a species to view the changes in its distribution.
                    </li>
                  </ul>
                </b-alert>
              </b-col>
            </b-row>
            <b-row
              v-if="(mode_selected == 'Grid') & (gridFilter != '')"
              class="overflow-auto"
            >
              <b-col cols="12">
                <b-list-group class="small h-100">
                  <b-list-group-item
                    v-for="i in gridList"
                    :key="i.Id"
                    class="d-flex align-items-center py-1 px-3"
                  >
                    {{ i.SEQ }}. <b class="ml-1">{{ i.CommonName }}</b>
                    <div
                      class="box box-sm ml-auto"
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
            <b-row
              class="alert-dark px-0 pb-2 pt-2"
              v-if="mode_selected == 'Species'"
            >
              <b-col>
                Number of squares{{
                  species_selected == null ? " for  all species" : ""
                }}
                <div class="kept d-flex w-100 p-0">
                  <div
                    class="lost py-2"
                    :style="{
                      width:
                        (nb_lkgd[0] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) *
                          100 +
                        '%',
                    }"
                  ></div>
                  <div
                    class="gained py-2 ml-auto"
                    :style="{
                      width:
                        (nb_lkgd[2] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) *
                          100 +
                        '%',
                    }"
                  ></div>
                </div>
                <b-row>
                  <b-col
                    class="d-flex align-items-center justify-content-center"
                  >
                    <div class="box-sm lost mr-1"></div>
                    {{ numberWithCommas(nb_lkgd[0]) }}
                  </b-col>
                  <b-col
                    class="d-flex align-items-center justify-content-center"
                  >
                    <div class="box-sm kept mr-1"></div>
                    {{ numberWithCommas(nb_lkgd[1]) }}
                  </b-col>
                  <b-col
                    class="d-flex align-items-center justify-content-center"
                  >
                    <div class="box-sm gained mr-1"></div>
                    {{ numberWithCommas(nb_lkgd[2]) }}
                  </b-col>
                </b-row>
              </b-col>
              <b-col v-if="species_selected != null" cols="12"
                ><small>
                  SEQ: {{ sp_selected.SEQ }} |
                  <span
                    v-for="(i, u) in sp_selected.ebird"
                    :key="'sp_selected-ebird-' + u"
                    class="pr-1"
                    ><a :href="i" target="_blank">eBird {{ sp_selected.ebird.length>1 ? u + 1 : "" }}</a></span
                  >
                  |
                  <span
                    v-for="(i, u) in sp_selected.kbm"
                    :key="'sp_selected-kbm-' + u"
                    class="pr-1"
                    ><a :href="i" target="_blank">KBM {{ sp_selected.kbm.length>1 ? u + 1 : ""}}</a></span
                  ></small
                >
              </b-col>
            </b-row>
            <b-row v-if="mode_selected == 'Species'">
              <b-col cols="12" class="my-2">
                <v-select
                  v-model="species_selected"
                  :options="species_options"
                  :reduce="(x) => x.SEQ"
                  label="CommonName"
                  placeholder="Select a species"
                ></v-select>
              </b-col>
              <!--<b-col cols="12"><hr /></b-col>
             <b-col cols="12" class="text-center my-1 grey">
                <small>--Or explore species in this table--</small>
              </b-col>-->
            </b-row>
            <b-row v-if="mode_selected == 'Species'">
              <b-col cols="8" class="text-right pr-0">
                <small>Sort by:</small>
              </b-col>
              <b-col cols="4" class="pl-1">
                <b-form-select
                  v-model="filter_selected"
                  :options="filter_options"
                  size="sm"
                ></b-form-select>
              </b-col>
            </b-row>
            <b-row v-if="mode_selected == 'Species'" class="overflow-auto">
              <b-col cols="12" class="mt-2">
                <b-list-group class="small h-100">
                  <b-list-group-item
                    v-for="i in speciesList"
                    :key="i.Id"
                    class="d-flex align-items-center py-1 px-3"
                    :active="i.SEQ == species_selected"
                    @click="species_selected = i.SEQ"
                    :action="true"
                    role="button"
                  >
                    {{ i.SEQ }}. <b class="ml-1">{{ i.CommonName }}</b>
                    <!--<b-form-radio v-model="species_selected" :value="i.SEQ" class="ml-1"></b-form-radio>-->
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
  LPopup,
  LGeoJson,
} from "vue2-leaflet";

import chroma from "chroma-js";
import geojson from "./assets/grid_target.json";
import sp_old0 from "./assets/sp_old.json";

const sp_old = sp_old0
  .filter((sp) => sp.SEQ != null)
  .filter((sp) => sp.MergedSEQ == null)
  .map((x) => {
    x.ebird = x.ebird == null ? [] : x.ebird.split(",");
    x.kbm = x.kbm == null ? [] : x.kbm.split(",");
    let sum = x.nb_lkgd[0] + x.nb_lkgd[1] + x.nb_lkgd[2];
    x.per_lkgd = [
      x.nb_lkgd[0] / sum,
      x.nb_lkgd[1] / sum,
      x.nb_lkgd[2] / sum,
      x.nb_lkgd[3] / sum,
    ];
    return x;
  });

const init_lkgd = sp_old.reduce(
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
    LPopup,
    LGeoJson,
  },
  data() {
    return {
      mode_options: ["Grid", "Species"],
      mode_selected: "Grid",
      checkbox_lost: true,
      checkbox_kept: true,
      checkbox_gained: true,
      species_options: sp_old,
      species_selected: null,
      filter_options: [
        "Taxonomy",
        "# Lost",
        "# Gained",
        "# Kept",
        "# Difference",
        "% Lost",
        "% Gained",
        "% Kept",
        "% Difference",
      ],
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
  methods: {
    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },
  computed: {
    nb_lkgd() {
      if ((this.mode_selected == "Grid") & (this.gridFilter != "")) {
        let f = geojson.features.filter((y) => {
          return y.properties.Sq == this.gridFilter;
        });
        return f[0].properties.nb_lkgd;
      } else if (
        (this.mode_selected == "Species") &
        (this.species_selected != null)
      ) {
        let sp = sp_old.filter((y) => {
          return y.SEQ == this.species_selected;
        });
        return sp[0].nb_lkgd;
      } else {
        return init_lkgd;
      }
    },
    gridList() {
      let f = geojson.features.filter((y) => {
        return y.properties.Sq == this.gridFilter;
      });
      if (f.length == 0) {
        return [];
      }
      let sp_old_returned = [...sp_old];
      sp_old_returned = sp_old_returned.map((y) => {
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
      let disp_lkgd = this.filter_selected.includes("%")
        ? "per_lkgd"
        : "nb_lkgd";
      if (this.filter_selected == "Taxonomy") {
        return sp_old.sort((a, b) => a.SEQ - b.SEQ);
      } else if (this.filter_selected.includes("Lost")) {
        return sp_old.sort((a, b) => b[disp_lkgd][0] - a[disp_lkgd][0]);
      } else if (this.filter_selected.includes("Gained")) {
        return sp_old.sort((a, b) => b[disp_lkgd][2] - a[disp_lkgd][2]);
      } else if (this.filter_selected.includes("Kept")) {
        return sp_old.sort((a, b) => b[disp_lkgd][1] - a[disp_lkgd][1]);
      } else if (this.filter_selected.includes("Difference")) {
        return sp_old.sort((a, b) => b[disp_lkgd][3] - a[disp_lkgd][3]);
      } else {
        return sp_old;
      }
    },
    sp_selected() {
      if (this.species_selected == null) {
        return null;
      } else {
        let sp = sp_old.filter((x) => x.SEQ == this.species_selected)[0];
        return {
          SEQ: sp.SEQ,
          ebird: sp.ebird.map((x) => "https://ebird.org/species/" + x + "/KE"),
          kbm: sp.kbm.map((x) => "https://kenya.birdmap.africa/species/" + x),
        };
      }
    },
    geojson_grid_options() {
      return {
        onEachFeature: (feature, layer) => {
          let prop = feature.properties;
          /*layer.bindTooltip(
            "<b>Grid:</b> " +
              prop.Sq
              "<br>" +
              "<br>" +
              "Number of species:" +
              "<b>Lost:</b> " +
              prop.nb_lkgd[0] +
              "<br>" +
              "<b>Kept:</b> " +
              prop.nb_lkgd[1] +
              "<br>" +
              "<b>Gained:</b> " +
              prop.nb_lkgd[2] +
              "<br>" +
              "<b>Difference:</b> " +
              prop.nb_lkgd[3],
            { permanent: false, sticky: true }
          );*/
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
          weight: 1,
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
          weight: 1,
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
.box-legend {
  width: 20px;
  height: 20px;
  margin: 5px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.box-sm {
  width: 0.875rem;
  height: 0.875rem;
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
