<template>
  <b-container fluid class="h-100 d-flex flex-column p-0">
    <b-row class="flex-grow-1 no-gutters">
      <b-col md="4" fluid="md" class="vh-100" v-if="sidebar">
        <b-card class="h-100" no-body>
          <b-card-header header-tag="nav">
            <b-row align-v="center" class="no-gutters">
              <b-col cols="auto" class="d-flex">
                <h2 class="d-none d-lg-block mb-0">Kenya Bird Atlas Viz</h2>
                <h2 class="d-lg-none">KBAViz</h2>
              </b-col>
              <b-col>
                <b-button class="ml-3" variant="outline-primary" size="sm" v-b-modal.modal-1 role="button">
                  <b-icon icon="question-circle-fill"></b-icon>
                </b-button>
              </b-col>
              <b-col class="text-right">
                <b-form-radio-group
                  v-model="mode"
                  :options="mode_options"
                  @change="update_url()"
                  buttons
                  button-variant="outline-primary"
                  size="sm"
                ></b-form-radio-group>
                <b-button size="sm" variant="primary" class="ml-2 d-lg-none" @click="sidebar = false">
                  <b-icon icon="map-fill"></b-icon>
                </b-button>
              </b-col>
            </b-row>
          </b-card-header>
          <b-card-body class="px-0">
            <b-container class="d-flex flex-column" v-if="mode == 'Grid'">
              <b-row class="px-0 py-2 my-2" align-v="center">
                <b-col>
                  Number of
                  {{ grid == "" ? "squares for  all " : "" }}species
                  <div class="kept d-flex w-100 p-0">
                    <div
                      class="lost py-2"
                      :style="{
                        width: (nb_lkgd[0] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) * 100 + '%',
                      }"
                    ></div>
                    <div
                      class="gained py-2 ml-auto"
                      :style="{
                        width: (nb_lkgd[2] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) * 100 + '%',
                      }"
                    ></div>
                  </div>
                  <b-row>
                    <b-col class="d-flex align-items-center justify-content-center">
                      <div class="box-sm lost mr-1"></div>
                      {{ number_with_commas(nb_lkgd[0]) }}
                      <span class="sublegend"> lost</span>
                    </b-col>
                    <b-col class="d-flex align-items-center justify-content-center">
                      <div class="box-sm kept mr-1"></div>
                      {{ number_with_commas(nb_lkgd[1]) }}
                      <span class="sublegend"> kept</span>
                    </b-col>
                    <b-col class="d-flex align-items-center justify-content-center">
                      <div class="box-sm gained mr-1"></div>
                      {{ number_with_commas(nb_lkgd[2]) }}
                      <span class="sublegend"> gained</span>
                    </b-col>
                  </b-row>
                </b-col>
                <b-col v-if="grid != ''" cols="auto">
                  <h4>
                    <b-badge variant="primary" class="d-flex align-items-center">
                      {{ grid }}
                      <b-button class="close ml-1 text-white primary" aria-label="Close" @click="grid = ''">
                        <span aria-hidden="true">&times;</span>
                      </b-button>
                    </b-badge>
                  </h4>
                  <!--<b>Coverage:</b>
                  <ul>
                    <li>
                      Old atlas: <small>{{ map_data.find((y) => y.properties.Sq == grid).properties.cov_old }}%</small>
                    </li>
                    <li>
                      New atlas: <small>{{ map_data.find((y) => y.properties.Sq == grid).properties.cov_new }}</small>
                    </li>
                  </ul>-->
                </b-col>
              </b-row>
              <b-row v-if="grid == ''">
                <b-col cols="12">
                  <b-alert show variant="light" class="mt-3">
                    <h4 class="alert-heading">Welcome!</h4>
                    <p>
                      Discover the change in bird distribution between 1980 and 2020! The distributions are retrieved
                      from
                      <a href="https://doi.org/10.1201/9781315136264" target="_blank">"A Bird Atlas of Kenya"</a>,
                      <a href="https://ebird.org/region/KE" target="_blank">eBird</a>
                      and
                      <a href="https://kenya.birdmap.africa/" target="_blank">Kenyan Bird Map</a>.
                    </p>
                    <hr />
                    <p>You can explore the changes with these two views:</p>
                    <ul>
                      <li>
                        <b-button :variant="mode == 'Grid' ? 'primary' : 'outline-primary'" size="sm">Grid</b-button>
                        Click a square on the map to see the change in species diversity.
                      </li>
                      <li>
                        <b-button
                          :variant="mode == 'Species' ? 'primary' : 'outline-primary'"
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
              <b-row v-if="grid != ''">
                <b-col cols="auto">Filter: </b-col>
                <b-col cols="auto">
                  <b-form-checkbox id="checkbox-lost" v-model="checkbox_lost">Lost</b-form-checkbox></b-col
                >
                <b-col cols="auto">
                  <b-form-checkbox id="checkbox-kept" v-model="checkbox_kept">Kept</b-form-checkbox></b-col
                >
                <b-col cols="auto">
                  <b-form-checkbox id="checkbox-gained" v-model="checkbox_gained">Gained</b-form-checkbox></b-col
                >
              </b-row>
              <b-row v-if="grid != ''" class="overflow-auto">
                <b-col cols="12">
                  <b-list-group class="small h-100">
                    <b-list-group-item v-for="i in grid_list" :key="i.Id" class="d-flex align-items-center py-1 px-3">
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
            </b-container>
            <b-container class="d-flex flex-column" v-if="mode == 'Species'">
              <b-row>
                <b-col cols="12">
                  <!--<v-select
                  v-model="species"
                  :options="species_options"
                  :reduce="(x) => x.SEQ"
                  label="CommonName"
                  
                ></v-select>-->
                  <multiselect
                    v-model="species"
                    :options="species_options"
                    placeholder="Select a species"
                    :custom-label="selectLabel"
                    track-by="SEQ"
                    @input="update_url()"
                    :show-labels="false"
                  >
                    <template slot="option" slot-scope="props">
                      {{ props.option.CommonName }}
                      <img
                        :src="iucn[props.option.IUCN]"
                        v-if="['CR', 'DD', 'EN', 'VU'].includes(props.option.IUCN)"
                        class="ml-1"
                        style="width: 1rem"
                      />
                    </template>
                    <template slot="singleLabel" slot-scope="props">
                      <b>{{ props.option.CommonName }}</b>
                      <span class="sublegend ml-2"
                        ><i>{{ props.option.ScientificName }}</i></span
                      >
                      <img :src="iucn[props.option.IUCN]" class="ml-2" style="width: 1rem" />
                    </template>
                  </multiselect>
                </b-col>
                <b-col v-if="species != null">
                  <b-button
                    squared
                    variant="outline-primary"
                    class="ml-1 btn-xs"
                    size="sm"
                    v-for="(i, u) in species.ebird"
                    :key="'sp-ebird-' + u"
                    :href="'https://ebird.org/species/' + i + '/KE'"
                    target="_blank"
                  >
                    eBird-{{ species.ebird.length > 1 ? i : i[0] }}
                  </b-button>
                  <b-button
                    squared
                    variant="outline-primary"
                    class="ml-1 btn-xs"
                    size="sm"
                    v-for="(i, u) in species.kbm"
                    :key="'sp-kbm-' + u"
                    :href="'https://kenya.birdmap.africa/species/' + i"
                    target="_blank"
                  >
                    KBM-{{ i }}
                  </b-button>
                </b-col>
              </b-row>
              <b-row class="px-0 py-2 my-2">
                <b-col>
                  Number of squares{{ species == null ? " for  all species" : "" }}
                  <div class="kept d-flex w-100 p-0">
                    <div
                      class="lost py-2"
                      :style="{
                        width: (nb_lkgd[0] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) * 100 + '%',
                      }"
                    ></div>
                    <div
                      class="gained py-2 ml-auto"
                      :style="{
                        width: (nb_lkgd[2] / (nb_lkgd[0] + nb_lkgd[1] + nb_lkgd[2])) * 100 + '%',
                      }"
                    ></div>
                  </div>
                  <b-row>
                    <b-col class="d-flex align-items-center justify-content-center">
                      <div class="box-sm lost mr-1"></div>
                      {{ number_with_commas(nb_lkgd[0]) }}<span class="sublegend"> lost</span>
                    </b-col>
                    <b-col class="d-flex align-items-center justify-content-center">
                      <div class="box-sm kept mr-1"></div>
                      {{ number_with_commas(nb_lkgd[1]) }}<span class="sublegend"> kept</span>
                    </b-col>
                    <b-col class="d-flex align-items-center justify-content-center">
                      <div class="box-sm gained mr-1"></div>
                      {{ number_with_commas(nb_lkgd[2]) }}<span class="sublegend"> gained</span>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="8" class="text-right pr-0">
                  <small>Sort by:</small>
                </b-col>
                <b-col cols="4" class="pl-1">
                  <b-form-select v-model="filter_selected" :options="filter_options" size="sm"></b-form-select>
                </b-col>
              </b-row>
              <b-row class="overflow-auto">
                <b-col cols="12" class="mt-2">
                  <b-list-group class="small h-100">
                    <b-list-group-item
                      v-for="i in species_list"
                      :key="i.Id"
                      class="d-flex align-items-center py-1 px-3"
                      :active="species == null ? false : i.SEQ == species.SEQ"
                      @click="
                        species = i;
                        update_url();
                      "
                      :action="true"
                      role="button"
                    >
                      {{ i.SEQ }}. <b class="ml-1">{{ i.CommonName }}</b>
                      <img
                        v-if="['CR', 'DD', 'EN', 'VU'].includes(i.IUCN)"
                        :src="iucn[i.IUCN]"
                        v-bind:alt="i.IUCN"
                        class="ml-1"
                        style="width: 1rem"
                      />
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
                            width: (i.nb_lkgd[0] / (i.nb_lkgd[0] + i.nb_lkgd[1] + i.nb_lkgd[2])) * 100 + 'px',
                          }"
                        ></div>
                        <div
                          class="bar-right gained"
                          :style="{
                            width: (i.nb_lkgd[2] / (i.nb_lkgd[0] + i.nb_lkgd[1] + i.nb_lkgd[2])) * 100 + 'px',
                          }"
                        ></div>
                      </div>
                    </b-list-group-item>
                  </b-list-group>
                </b-col>
              </b-row>
            </b-container>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col class="flex-grow-1" @shown="reloadMap()">
        <l-map :bounds="bounds" ref="map">
          <l-tile-layer
            v-for="tileProvider in tile_providers"
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
          <l-control position="bottomright">
            <b-button size="sm" variant="primary" class="d-lg-none" v-if="legend == false" @click="legend = true">
              <b-icon icon="question-circle-fill"></b-icon>
            </b-button>
            <div
              v-if="legend"
              class="leaflet-control-layers leaflet-control-layers-expanded px-3 py-2"
              style="width: 240px"
            >
              <b-button
                size="sm"
                class="close d-lg-none"
                style="margin-right: -0.6rem; margin-top: -0.5rem; font-size: 1.2rem"
                @click="legend = false"
              >
                x
              </b-button>
              <div v-if="mode == 'Grid'" class="mb-1">
                <b>Change in number of species</b>
                <div class="legend-gradient" style="width: 100%; height: 15px"></div>
                <div class="d-flex justify-content-between" style="font-size: 9px">
                  <span>-200</span>
                  <span> 0 </span>
                  <span>200</span>
                </div>
              </div>
              <div class="mb-1">
                <span v-if="mode == 'Grid'">
                  <b>Change in effort</b>
                  <b-button
                    size="sm"
                    class="p-0 ml-1"
                    variant="link"
                    v-b-tooltip.top.hover
                    title="Change in effort is based on the difference between estimated coverage of the old atlas and the total duration of the new atlas."
                    ><b-icon-question-circle-fill> </b-icon-question-circle-fill>
                  </b-button>
                </span>
                <span v-if="mode == 'Species'">
                  <b>Confidence</b>
                  <b-button
                    size="sm"
                    class="p-0 ml-1"
                    variant="link"
                    v-b-tooltip.top.hover
                    title="The confidence is based on the change in effort between the old and new atlases. For example, a small red circle indicates an unlikely loss of the species, while a large green circle indicates a likely gain."
                    ><b-icon-question-circle-fill> </b-icon-question-circle-fill>
                  </b-button>
                </span>
                <div class="d-flex align-items-center justify-content-between">
                  <CircleTemplate size="12" />
                  <CircleTemplate size="15" />
                  <CircleTemplate size="18" />
                  <CircleTemplate size="21" />
                  <CircleTemplate size="24" />
                </div>
                <div v-if="mode == 'Grid'" class="d-flex justify-content-between" style="font-size: 9px">
                  <span>Reduced</span>
                  <span>Increased</span>
                </div>
                <div v-if="mode == 'Species'" class="d-flex justify-content-between" style="font-size: 9px">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div>
                <b>Coverage</b>
                <b-button
                  size="sm"
                  class="p-0 ml-1"
                  variant="link"
                  v-b-tooltip.top.hover
                  title="Coverage is considered good if it had a modelled coverage >30% in the old atlas and at least 24hr of total observation time in the new atlas."
                  ><b-icon-question-circle-fill> </b-icon-question-circle-fill>
                </b-button>
                <div class="d-flex align-items-center">
                  <div style="width: 25px" class="d-flex">
                    <CircleTemplate size="7" opacity="0.7" class="m-auto" />
                  </div>
                  <span class="ml-1">Poor coverage </span>
                  <b-checkbox class="ml-1" v-model="display_poor_coverage" switch></b-checkbox>
                </div>

                <div class="d-flex align-items-center" v-if="mode == 'Species'">
                  <div style="width: 25px" class="d-flex">
                    <CircleTemplate size="18" opacity="0.3" class="m-auto" />
                  </div>
                  <span class="ml-1">Never observed</span>
                  <b-checkbox class="ml-1" v-model="display_never_observed" switch></b-checkbox>
                </div>

                <div class="d-flex align-items-center">
                  <div style="width: 25px" class="d-flex">
                    <div
                      class="legend-gradient-3 m-auto"
                      style="
                        width: 10px;
                        height: 10px; /* border-radius: 7px; */
                        background: transparent;
                        border: 2px solid rgb(33, 37, 41);
                        opacity: 1;
                      "
                    ></div>
                  </div>
                  <span class="ml-1">Grid square</span>
                  <b-checkbox class="ml-1" v-model="display_grid_geojson" switch></b-checkbox>
                </div>
              </div>
            </div>
          </l-control>
          <l-geo-json
            v-if="display_grid_geojson"
            :geojson="grid_geojson"
            :optionsStyle="{ color: '#555555', weight: 2, opacity: 0.65, fill: 0 }"
          />
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
            @click="click_circle"
          />
          <v-geosearch :options="geosearchOptions"></v-geosearch>
        </l-map>
      </b-col>
    </b-row>
    <b-modal id="modal-1" size="lg" ok-only>
      <p>
        Welcome to the vizualisation tool for the
        <a href="https://github.com/Rafnuss/KenyaAtlasComparison" target="_blank">Kenya bird atlas comparison project</a
        >. This project is studying the differences in bird distribution between the periods 1970s-1980s and
        2000s-2010s.
      </p>

      <h4><b-icon-clipboard-data class="pr-1"></b-icon-clipboard-data>Data sources</h4>
      <ul>
        <li>
          <b>1970s-1980s</b> A Bird Atlas of Kenya (<a href="https://doi.org/10.1201/9781315136264" target="_blank"
            >Lewis & Pomeroy, 1989</a
          >) is the reference book describing the status and distribution of 1 065 species of birds in Kenya for the
          period 1970-1984 at the quarter square degree spatial resolution. This digitized version of the book is
          published as GBIF dataset
          <a href="https://doi.org/10.15468/2ga3wk" target="_blank"
            ><img src="https://zenodo.org/badge/DOI/10.15468/2ga3wk.svg" alt="DOI:10.15468/2ga3wk" /></a
          >.
        </li>
        <li>
          <b>2000s-2010s</b>
          <ol>
            <li>
              Kenya Bird Map (KBM -
              <a href="https://kenya.birdmap.africa/" target="_blank">kenya.birdmap.africa</a>) leads the current
              efforts to establish a new bird atlas from citizen scientists. We extracted presence information (in full
              or ad-hoc protocol) for each species at the pentad level and upscaled each species map at the QSD
              resolution.
            </li>
            <li>
              eBird (<a href="https://ebird.org/region/KE" target="_blank">ebird.org</a>) is the largest online bird
              database. We used all data entered in Kenya since 2000 to produce species map presence at the QSD
              resolution.
            </li>
          </ol>
        </li>
      </ul>

      <h4><b-icon-map class="pr-1"></b-icon-map>How to read these maps</h4>

      <p>
        Take care when interpreting these maps! Only presence is considered, so there is no difference between the
        square holding 1 or 10 000 invididuals. This means that where there used to be multiple breeding pairs in the
        past, even if there is only one juvenile seen today, the territory is considered "kept".
      </p>
      <p>
        Also note that coverage is not consistent between the two periods, so species lost could be due to the absence
        of observers in this square.
      </p>

      <h4><b-icon-binoculars class="pr-1"></b-icon-binoculars>Go birding!</h4>
      <p>
        Help us extend today's coverage - a wide number of squares have not been birded in recent years... To target
        those areas, go to Grid mode, and check out the squares that have most lost species!
      </p>
      <p></p>
      <h4><b-icon-envelope class="pr-1"></b-icon-envelope>Contact</h4>
      <p>This work was done by Raphaël Nussbaumer , Sidney Shema, Sikenykeny Kennedy and Colin Jackson.</p>
      <a href="https://github.com/Zoziologie/KenyaBirdAtlasViz" target="_blank"
        ><b-icon-github class="h5 mb-0 pr-1"></b-icon-github>/Zoziologie/KenyaBirdAtlasViz</a
      >
    </b-modal>
  </b-container>
</template>

<script>
import "leaflet/dist/leaflet.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import "leaflet-geosearch/assets/css/leaflet.css";
import "./app.scss";

import Multiselect from "vue-multiselect";
import { LMap, LTileLayer, LControlLayers, LControl, LPopup, LCircle, LGeoJson } from "vue2-leaflet";
import { latLngBounds } from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import VGeosearch from "vue2-leaflet-geosearch";

import CircleTemplate from "./circle.vue";

import chroma from "chroma-js";
import map_data from "./assets/map_data.json";
import sp_old from "./assets/sp_old.json";
import grid_geojson from "./assets/grid.json";

import iucn_CR from "./assets/iucn_CR.png";
import iucn_VU from "./assets/iucn_VU.png";
import iucn_DD from "./assets/iucn_DD.png";
import iucn_EN from "./assets/iucn_EN.png";
import iucn_NT from "./assets/iucn_NT.png";
import iucn_LC from "./assets/iucn_LC.png";

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

const init_lkgd_gc = sp_old.reduce(
  (acc, sp) => {
    acc[0] = acc[0] + sp.nb_lkgd_gc[0];
    acc[1] = acc[1] + sp.nb_lkgd_gc[1];
    acc[2] = acc[2] + sp.nb_lkgd_gc[2];
    acc[3] = acc[3] + sp.nb_lkgd_gc[3];
    return acc;
  },
  [0, 0, 0, 0]
);

const colorscale_grid = chroma.scale("RdYlGn").domain([-200, 200]);

export default {
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LControl,
    LPopup,
    LCircle,
    LGeoJson,
    CircleTemplate,
    Multiselect,
    VGeosearch,
  },
  data() {
    return {
      grid_geojson: grid_geojson,
      sidebar: true,
      legend: true,
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
      display_poor_coverage: true,
      display_never_observed: true,
      display_grid_geojson: false,
      map_data: map_data.features,
      iucn: {
        CR: iucn_CR,
        EN: iucn_EN,
        NT: iucn_NT,
        LC: iucn_LC,
        DD: iucn_DD,
        VU: iucn_VU,
      },
      tile_providers: [
        {
          name: "Mapbox Streets",
          visible: true,
          url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
          attribution: "",
        },
        {
          name: "Mapbox Satellite",
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
      geosearchOptions: {
        provider: new OpenStreetMapProvider({
          params: {
            countrycodes: "KE",
          },
        }),
      },
    };
  },
  methods: {
    number_with_commas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    update_url() {
      let qp = new URLSearchParams();
      if ((this.mode != "") & (this.mode != null)) qp.set("mode", this.mode);
      if ((this.grid != "") & (this.grid != null)) qp.set("grid", this.grid);
      if (this.species != null) qp.set("species", this.species.SEQ);
      history.replaceState(null, null, "?" + qp.toString());
    },
    selectLabel({ CommonName, ScientificName }) {
      return `${CommonName} — [${ScientificName}]`;
    },
  },
  computed: {
    nb_lkgd() {
      if ((this.mode == "Grid") & (this.grid != "")) {
        let f = this.map_data.find((y) => y.properties.Sq == this.grid);
        return f.properties.nb_lkgd;
      } else if ((this.mode == "Species") & (this.species != null)) {
        if (this.display_poor_coverage) {
          return this.species.nb_lkgd;
        } else {
          return this.species.nb_lkgd_gc;
        }
      } else {
        if (this.display_poor_coverage) {
          return init_lkgd;
        } else {
          return init_lkgd_gc;
        }
      }
    },
    grid_list() {
      this.update_url();
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
    species_list() {
      let disp_lkgd = this.filter_selected.includes("%") ? "per_lkgd" : "nb_lkgd";
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
    map_data_filtered() {
      let m = this.map_data
        .filter((x) => !((x.properties.cov_old == "0") & (x.properties.cov_new == 0)))
        .map((x) => {
          x.style = {};
          x.style.fillOpacity = 0.9;
          x.style.visible = true;
          let sz_dir = 1;
          if (this.mode == "Grid") {
            sz_dir = -1;
            x.style.fillColor = colorscale_grid(x.properties.nb_lkgd[3]).hex();
            if (this.grid) {
              x.style.fillOpacity = this.grid == x.properties.Sq ? 1 : 0.3;
            }
          } else if (this.mode == "Species") {
            let seq = this.species == null ? null : this.species.SEQ;
            let n = x.properties.SEQ_new.includes(seq);
            let o = x.properties.SEQ_old.includes(seq);
            if (o & n) {
              x.style.fillColor = "#fee08b";
            } else if (o & !n) {
              x.style.fillColor = "#d73027";
              sz_dir = -1;
            } else if (!o & n) {
              x.style.fillColor = "#45aa59";
            } else {
              x.style.visible = this.display_never_observed ? !x.properties.mask : false;
              x.style.fillColor = "#000000";
              x.style.fillOpacity = 0.2;
              x.style.opacity = 0.2;
              sz_dir = -1;
            }
          }
          x.style.opacity = x.style.fillOpacity;
          x.style.radius = (40000 / 2) * (1 + sz_dir * 3 * x.properties.corr);
          if (x.properties.mask) {
            x.style.visible = this.display_poor_coverage ? x.style.visible : false;
            x.style.radius = 7000;
            x.style.opacity = 0.4;
            x.style.fillOpacity = 0.4;
          }
          x.style.color = "#2e2e2e";
          x.style.weight = 1;
          return x;
        });
      return m;
    },
    click_circle() {
      return (e) => {
        if (this.mode == "Grid") {
          let Sq = e.sourceTarget.options.Sq;
          this.grid = this.grid == Sq ? "" : Sq;
        }
      };
    },
    geojson_species_options() {
      return {
        onEachFeature: (feature, layer) => {
          let seq = this.species == null ? null : this.species.SEQ;
          let n = feature.properties.SEQ_new.includes(seq);
          let o = feature.properties.SEQ_old.includes(seq);
          let status = o ? (n ? "kept" : "lost") : "gained";
          if (n | o) {
            layer.bindTooltip("<b>Grid:</b> " + feature.properties.Sq + "<br>" + "<b>Status:</b> " + status, {
              permanent: false,
              sticky: true,
            });
          }
        },
      };
    },
  },
  mounted() {},
  created() {
    let qp = new URLSearchParams(window.location.search);
    let species = qp.get("species");
    if ((species != "null") & (species != "NaN")) {
      this.species = sp_old.filter((x) => x.SEQ == Number(species))[0];
    }
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
