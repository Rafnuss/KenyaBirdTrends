<template>
  <b-container fluid class="h-100 d-flex flex-column p-0">
    <b-row class="flex-grow-1 no-gutters">
      <b-col md="4" fluid="md" class="vh-100" v-if="sidebar">
        <b-card class="h-100" no-body>
          <b-card-header header-tag="nav">
            <b-row align-v="center" class="no-gutters">
              <b-col cols="auto" class="d-flex">
                <h2 class="d-none d-lg-block">Kenya Bird Atlas Viz</h2>
                <h2 class="d-lg-none">KBAViz</h2>
              </b-col>
              <b-col class="text-right">
                <b-form-radio-group
                  v-model="mode"
                  :options="mode_options"
                  buttons
                  button-variant="outline-primary"
                  size="sm"
                ></b-form-radio-group>
                <b-button
                  size="sm"
                  variant="primary"
                  class="ml-2 d-lg-none"
                  @click="sidebar = false"
                >
                  <b-icon icon="map-fill"></b-icon>
                </b-button>
              </b-col>
            </b-row>
          </b-card-header>
          <b-card-body class="flex-column d-flex">
            <b-row
              v-if="mode == 'Grid'"
              class="alert-dark px-0 pb-2 pt-2"
              align-v="center"
            >
              <b-col>
                Number of
                {{ grid == "" ? "squares for  all " : "" }}species
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
              <b-col v-if="grid != ''" cols="auto">
                <h4>
                  <b-badge variant="primary" class="d-flex align-items-center"
                    >{{ grid }}
                    <b-button
                      class="close ml-1 text-white primary"
                      aria-label="Close"
                      @click="grid = ''"
                    >
                      <span aria-hidden="true">&times;</span>
                    </b-button>
                  </b-badge>
                </h4>
              </b-col>
            </b-row>
            <b-row v-if="mode == 'Grid'">
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
            <b-row v-if="(mode == 'Grid') & (grid == '')">
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
                          mode == 'Grid' ? 'primary' : 'outline-primary'
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
                          mode == 'Species' ? 'primary' : 'outline-primary'
                        "
                        size="sm"
                        @click="mode = 'Species'"
                        >Species</b-button
                      >
                      Select a species to view the changes in its distribution.
                    </li>
                  </ul>
                </b-alert>
              </b-col>
            </b-row>
            <b-row v-if="(mode == 'Grid') & (grid != '')" class="overflow-auto">
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
            <b-row class="alert-dark px-0 pb-2 pt-2" v-if="mode == 'Species'">
              <b-col>
                Number of squares{{
                  species == null ? " for  all species" : ""
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
              <b-col v-if="species != null" cols="12"
                ><small>
                  SEQ: {{ sp_selected.SEQ }} |
                  <span
                    v-for="(i, u) in sp_selected.ebird"
                    :key="'sp_selected-ebird-' + u"
                    class="pr-1"
                    ><a :href="i" target="_blank"
                      >eBird{{
                        sp_selected.ebird.length > 1 ? "-" + (u + 1) : ""
                      }}</a
                    ></span
                  >
                  |
                  <span
                    v-for="(i, u) in sp_selected.kbm"
                    :key="'sp_selected-kbm-' + u"
                    class="pr-1"
                    ><a :href="i" target="_blank"
                      >KBM{{
                        sp_selected.kbm.length > 1 ? "-" + (u + 1) : ""
                      }}</a
                    ></span
                  ></small
                >
              </b-col>
            </b-row>
            <b-row v-if="mode == 'Species'">
              <b-col cols="12" class="my-2">
                <v-select
                  v-model="species"
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
            <b-row v-if="mode == 'Species'">
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
            <b-row v-if="mode == 'Species'" class="overflow-auto">
              <b-col cols="12" class="mt-2">
                <b-list-group class="small h-100">
                  <b-list-group-item
                    v-for="i in speciesList"
                    :key="i.Id"
                    class="d-flex align-items-center py-1 px-3"
                    :active="i.SEQ == species"
                    @click="species = i.SEQ"
                    :action="true"
                    role="button"
                  >
                    {{ i.SEQ }}. <b class="ml-1">{{ i.CommonName }}</b>
                    <!--<b-form-radio v-model="species" :value="i.SEQ" class="ml-1"></b-form-radio>-->
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
          <b-card-footer>
            <div
              class="d-flex align-items-center w-100 justify-content-between"
            >
              <b-icon-info-circle-fill
                v-b-modal.modal-1
                role="button"
              ></b-icon-info-circle-fill>
              <a
                href="https://github.com/Rafnuss/KenyaBirdAtlasViz/"
                target="_blank"
              >
                <b-icon-github role="button"></b-icon-github
              ></a>
            </div>
          </b-card-footer>
        </b-card>
      </b-col>
      <b-col class="flex-grow-1" @shown="reloadMap()">
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
          <l-control position="topleft" class="d-lg-none">
            <b-button size="sm" variant="primary" @click="sidebar = true">
              <b-icon icon="list"></b-icon>
            </b-button>
          </l-control>
          <l-control
            position="bottomleft"
            class="leaflet-control-layers leaflet-control-layers-expanded leaflet-control"
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

          <!--<l-geo-json
            v-if="mode == 'Grid'"
            :geojson="geojson"
            :options-style="geojson_grid_styleFunction"
            :options="geojson_grid_options"
            @click="geojson_grid_clickGeoJsonFunction"
          ></l-geo-json>
          <l-geo-json
            v-if="mode == 'Species'"
            :geojson="geojson"
            :options-style="geojson_species_styleFunction"
            :options="geojson_species_options"
          ></l-geo-json>-->
          <l-circle
            v-for="c in map_data_filtered"
            :key="c.properties.Sq"
            :lat-lng="c.geometry.coordinates"
            :radius="c.style.radius"
            :color="c.style.color"
            :opacity="c.style.opacity"
            :fillColor="c.style.fillColor"
            :fillOpacity="c.style.fillOpacity"
            :weight="c.style.weight"
            :visible="c.style.visible"
            :options="{ Sq: c.properties.Sq }"
            @click="clickCircle"
          />
        </l-map>
      </b-col>
    </b-row>
    <b-modal id="modal-1" size="lg" ok-only>
      <p>
        Welcome to the vizualisation tool for the
        <a
          href="https://github.com/Rafnuss/KenyaAtlasComparison"
          target="_blank"
          >Kenya bird atlas comparison project</a
        >. This project is studying the differences in bird distribution between
        the periods 1970s-1980s and 2000s-2010s.
      </p>

      <h4>
        <b-icon-clipboard-data class="pr-1"></b-icon-clipboard-data>Data sources
      </h4>
      <ul>
        <li>
          <b>1970s-1980s</b> A Bird Atlas of Kenya (<a
            href="https://doi.org/10.1201/9781315136264"
            target="_blank"
            >Lewis & Pomeroy, 1989</a
          >) is the reference book describing the status and distribution of 1
          065 species of birds in Kenya for the period 1970-1984 at the quarter
          square degree spatial resolution. This digitized version of the book
          is published as GBIF dataset
          <a href="https://doi.org/10.15468/2ga3wk" target="_blank"
            ><img
              src="https://zenodo.org/badge/DOI/10.15468/2ga3wk.svg"
              alt="DOI:10.15468/2ga3wk" /></a
          >.
        </li>
        <li>
          <b>2000s-2010s</b>
          <ol>
            <li>
              Kenya Bird Map (KBM -
              <a href="https://kenya.birdmap.africa/" target="_blank"
                >kenya.birdmap.africa</a
              >) leads the current efforts to establish a new bird atlas from
              citizen scientists. We extracted presence information (in full or
              ad-hoc protocol) for each species at the pentad level and upscaled
              each species map at the QSD resolution.
            </li>
            <li>
              eBird (<a href="https://ebird.org/region/KE" target="_blank"
                >ebird.org</a
              >) is the largest online bird database. We used all data entered
              in Kenya since 2000 to produce species map presence at the QSD
              resolution.
            </li>
          </ol>
        </li>
      </ul>

      <h4><b-icon-map class="pr-1"></b-icon-map>How to read these maps</h4>

      <p>
        Take care when interpreting these maps! Only presence is considered, so
        there is no difference between the square holding 1 or 10 000
        invididuals. This means that where there used to be multiple breeding
        pairs in the past, even if there is only one juvenile seen today, the
        territory is considered "kept".
      </p>
      <p>
        Also note that coverage is not consistent between the two periods, so
        species lost could be due to the absence of observers in this square.
      </p>

      <h4><b-icon-binoculars class="pr-1"></b-icon-binoculars>Go birding!</h4>
      <p>
        Help us extend today's coverage - a wide number of squares have not been
        birded in recent years... To target those areas, go to Grid mode, and
        check out the squares that have most lost species!
      </p>
      <p></p>
      <h4><b-icon-envelope class="pr-1"></b-icon-envelope>Contact</h4>
      <p>
        This work was done by Raphaël Nussbaumer , Sidney Shema, Sikenykeny
        Kennedy and Colin Jackson.
      </p>
      <a href="https://github.com/Zoziologie/KenyaBirdAtlasViz" target="_blank"
        ><b-icon-github class="h5 mb-0 pr-1"></b-icon-github
        >/Zoziologie/KenyaBirdAtlasViz</a
      >
    </b-modal>
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
  LCircle,
} from "vue2-leaflet";

import chroma from "chroma-js";
import map_data from "./assets/map_data.json";
import sp_old from "./assets/sp_old.json";

/*
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
  });*/

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

let min = map_data.features.reduce(
  (acc, x) => Math.min(x.properties.nb_lkgd[3], acc),
  10000
);
let max = map_data.features.reduce(
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
    LCircle,
  },
  data() {
    return {
      sidebar: true,
      mode_options: ["Grid", "Species"],
      mode: "Grid",
      checkbox_lost: true,
      checkbox_kept: true,
      checkbox_gained: true,
      species_options: sp_old,
      species: null,
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
      grid: "",
      bounds: latLngBounds([
        [5.615985, 43.50585],
        [-5.353521, 32.958984],
      ]),
      map_data: map_data.features,
      tileProviders: [
        {
          name: "Mapbox.Streets",
          visible: true,
          url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
          attribution: "",
        },
        {
          name: "Mapbox.Dark",
          visible: false,
          url: "https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
          attribution: "",
        },
        {
          name: "Mapbox.Satellite",
          visible: false,
          url: "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
          attribution: "",
        } /*
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
        },*/,
      ],
      opacity_value: 0.9,
    };
  },
  methods: {
    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    updateURL() {
      let qp = new URLSearchParams();
      if (this.species !== "") qp.set("species", this.species);
      if (this.mode !== "") qp.set("mode", this.mode);
      if (this.grid !== "") qp.set("grid", this.grid);
      history.replaceState(null, null, "?" + qp.toString());
    },
  },
  computed: {
    nb_lkgd() {
      if ((this.mode == "Grid") & (this.grid != "")) {
        let f = this.map_data.filter((y) => {
          return y.properties.Sq == this.grid;
        });
        return f[0].properties.nb_lkgd;
      } else if ((this.mode == "Species") & (this.species != null)) {
        let sp = sp_old.filter((y) => {
          return y.SEQ == this.species;
        });
        return sp[0].nb_lkgd;
      } else {
        return init_lkgd;
      }
    },
    gridList() {
      this.updateURL();
      let f = this.map_data.filter((y) => {
        return y.properties.Sq == this.grid;
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
      this.updateURL();
      if (this.species == null) {
        return null;
      } else {
        let sp = sp_old.filter((x) => x.SEQ == this.species)[0];
        return {
          SEQ: sp.SEQ,
          ebird: sp.ebird.map((x) => "https://ebird.org/species/" + x + "/KE"),
          kbm: sp.kbm.map((x) => "https://kenya.birdmap.africa/species/" + x),
        };
      }
    },
    map_data_filtered() {
      let m = this.map_data
        .filter(
          (x) =>
            !(
              (x.properties.coverage_old == "0") &
              (x.properties.coverage_new == 0)
            )
        )
        .map((x) => {
          x.style = {};
          x.style.fillOpacity = parseFloat(this.opacity_value);
          x.style.visible = true;
          let sz_dir = 1;
          if (this.mode == "Grid") {
            x.style.fillColor = colorscale_grid(x.properties.nb_lkgd[3]).hex();
            if (this.grid) {
              x.style.fillOpacity = this.grid == x.properties.Sq ? 1 : 0.3;
            }
          } else if (this.mode == "Species") {
            let sp = this.species;
            let n = x.properties.SEQ_new.includes(sp);
            let o = x.properties.SEQ_old.includes(sp);
            if (o & n) {
              x.style.fillColor = "#d9ef8b";
            } else if (o & !n) {
              x.style.fillColor = "#d73027";
              sz_dir = -1;
            } else if (!o & n) {
              x.style.fillColor = "#1a9850";
            } else {
              x.style.visible = x.properties.mask;
              x.style.fillColor = "#000000";
              x.style.fillOpacity = 0.2;
              x.style.opacity = 0.2;
              sz_dir = -1;
            }
            //x.style.fillOpacity = !n & !o ? 0 : parseFloat(this.opacity_value);
          }
          x.style.opacity = x.style.fillOpacity;
          x.style.radius = (40000 / 2) * (1 + sz_dir * 3 * x.properties.corr);
          x.style.radius = x.properties.mask ? x.style.radius : 7000;
          x.style.color = "#2e2e2e";
          x.style.weight = 1;
          return x;
        });
      return m;
    },
    clickCircle() {
      return (e) => {
        if (this.mode == "Grid") {
          let Sq = e.sourceTarget.options.Sq;
          this.grid = this.grid == Sq ? "" : Sq;
        }
      };
    },
    geojson_species_options() {
      let sp = this.species;
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
  created() {
    let qp = new URLSearchParams(window.location.search);
    let species = qp.get("species");
    if (species) this.species = Number(species);
    let mode = qp.get("mode");
    if (mode) this.mode = mode;
    let grid = qp.get("grid");
    if (grid) this.grid = grid;
  },
  watch: {
    sidebar: function (val) {
      if (!val) {
        setTimeout(() => {
          this.$refs.map.mapObject.invalidateSize();

          this.$refs.map.mapObject.fitBounds(
            latLngBounds([
              [5.615985, 43.50585],
              [-5.353521, 32.958984],
            ])
          );
        }, "10");
      }
    },
  },
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
