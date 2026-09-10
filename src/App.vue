<template>
  <b-container fluid class="d-flex flex-column p-0">
    <b-navbar toggleable="sm" variant="light" style="border-bottom: 1px solid #e5e9ef" sticky>
      <b-navbar-brand
        href="#"
        @click="
          mode = 'Intro';
          update_url();
        "
      >
        <img :src="logo_png" width="30" height="30" class="d-inline-block align-top" />
        Kenya Bird Trends
      </b-navbar-brand>
      <b-button
        v-if="mode != 'Intro'"
        size="sm"
        variant="primary"
        class="mr-2 d-lg-none"
        @click="sidebar = sidebar ? false : true"
      >
        <b-icon v-if="sidebar" icon="map-fill" />
        <b-icon v-if="!sidebar" icon="list" />
      </b-button>
      <b-navbar-toggle target="nav-collapse" />
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <!--<b-nav-item
            href="#"
            @click="
              mode = 'Intro';
              update_url();
            "
            :active="mode == 'Intro'"
          >
            Intro 
          </b-nav-item>-->
          <b-nav-item
            href="#"
            :active="mode == 'Grid'"
            @click="
              mode = 'Grid';
              update_url();
            "
          >
            Grid
          </b-nav-item>
          <b-nav-item
            href="#"
            :active="mode == 'Species'"
            @click="
              mode = 'Species';
              update_url();
            "
          >
            Species
          </b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto d-inline-block">
          <b-button v-b-modal.modal-settings variant="light">
            <b-icon-gear />
          </b-button>
          <b-button v-if="showInstallButton" variant="light" @click="promptInstall">
            <b-icon icon="file-arrow-down" />
          </b-button>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <Intro
      v-if="mode == 'Intro'"
      @changeModeGrid="mode = 'Grid'"
      @changeModeSpecies="mode = 'Species'"
    />
    <b-row v-else class="flex-grow-1 no-gutters">
      <b-col v-if="sidebar" md="6" lg="4" fluid class="h-100-56">
        <b-container v-if="mode == 'Grid'" fluid class="d-flex flex-column h-100">
          <b-row class="px-0 py-0 my-2" align-v="center">
            <b-col>
              Number of
              {{ grid.length == 0 ? "squares for  all " : "" }}species
              <span v-if="display_poor_coverage" class="sublegend">(including poor coverage)</span>
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
          </b-row>
          <b-row v-if="grid.length == 0">
            <b-col cols="12">
              <b-alert show variant="info" class="mt-3">
                <p>
                  Click on one or multiple circle(s) on the map to select a grid square and view the
                  species list for that area.
                </p>
                <p>
                  For each species, you can see whether it has been gained, lost, or kept between
                  the two periods.
                </p>
                <p>You can export this species list as a CSV file.</p>
                <div class="col text-center">
                  <b-button variant="primary" @click="locate.start()">
                    Find target list at my location
                  </b-button>
                </div>
              </b-alert>
            </b-col>
          </b-row>
          <b-row v-if="grid.length > 0">
            <b-col>
              <b-badge v-for="g in grid" :key="g" variant="primary" class="mr-1">
                {{ g }}
                <!--<span style="cursor: pointer" @click="grid = grid.filter((i) => g != i)">
                      &times;
                    </span>-->
              </b-badge>
              <b-badge
                v-if="grid.length > 0"
                v-b-tooltip.hover
                variant="danger"
                class="mr-1"
                style="cursor: pointer"
                title="Clear squares selection"
                @click="grid = []"
              >
                <b-icon icon="trash-fill" aria-hidden="true" />
              </b-badge>

              <b-button
                v-if="grid.length > 0"
                class="float-right ml-auto mr-1 btn-xs"
                squared
                variant="primary"
                size="sm"
                @click="export_csv"
              >
                <b-icon icon="download" /> Download list
              </b-button>
            </b-col>
          </b-row>
          <b-row v-if="grid.length > 0">
            <b-col cols="auto">Filter: </b-col>
            <b-col cols="auto">
              <b-form-checkbox id="checkbox-lost" v-model="checkbox_lost">Lost</b-form-checkbox>
            </b-col>
            <b-col cols="auto">
              <b-form-checkbox id="checkbox-kept" v-model="checkbox_kept"> Kept </b-form-checkbox>
            </b-col>
            <b-col cols="auto">
              <b-form-checkbox id="checkbox-gained" v-model="checkbox_gained"
                >Gained
              </b-form-checkbox>
            </b-col>
          </b-row>
          <b-row v-if="grid.length > 0" class="overflow-auto">
            <b-col cols="12">
              <b-list-group class="small h-100">
                <b-list-group-item
                  v-for="i in grid_list"
                  :key="i.SEQ"
                  class="d-flex align-items-center py-1 px-3"
                >
                  <b class="ml-1">{{ i.common_name }}</b>
                  <div
                    class="box box-sm ml-auto"
                    :class="{
                      kept: i.trend == 'kept',
                      gained: i.trend == 'gained',
                      lost: i.trend == 'lost',
                    }"
                  />
                </b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>
        </b-container>
        <b-container v-if="mode == 'Species'" fluid class="d-flex flex-column h-100">
          <b-row>
            <b-col cols="12" class="mt-2">
              <multiselect
                v-model="species"
                :options="sp_filter"
                placeholder="Select a species"
                :custom-label="selectLabel"
                track-by="SEQ"
                :show-labels="false"
                @input="update_url()"
              >
                <template slot="option" slot-scope="props">
                  {{ props.option.common_name }}
                  <img
                    v-if="
                      [
                        'Critically Endangered',
                        'Data Deficient',
                        'Endangered',
                        'Vulnerable',
                      ].includes(props.option.IUCN)
                    "
                    :src="iucn[props.option.IUCN]"
                    class="ml-1"
                    style="width: 1rem"
                  />
                </template>
                <template slot="singleLabel" slot-scope="props">
                  <b>{{ props.option.common_name }}</b>
                  <span class="sublegend ml-2">
                    <i>{{ props.option.scientific_name }}</i>
                  </span>
                </template>
              </multiselect>
            </b-col>
            <b-col v-if="species != null" class="d-flex flex-wrap pt-1">
              <a
                target="_blank"
                class="d-flex align-items-center justify-content-center"
                title="IUCN page"
                :href="'https://apiv3.iucnredlist.org/api/v3/taxonredirect/' + species.IUCNID"
              >
                <img :src="iucn[species.IUCN]" class="ml-1" style="width: 1rem" />
              </a>
              <b-button
                v-for="(i, u) in species.ebird"
                :key="'sp-ebird-' + u"
                squared
                variant="outline-primary"
                class="ml-1 btn-xs d-flex align-items-center justify-content-center"
                size="sm"
                :href="'https://ebird.org/species/' + i + '/KE'"
                target="_blank"
              >
                eBird-{{ species.ebird.length > 1 ? i : i[0] }}
              </b-button>
              <b-button
                v-for="(i, u) in species.kbm"
                :key="'sp-kbm-' + u"
                squared
                variant="outline-primary"
                class="ml-1 btn-xs d-flex align-items-center justify-content-center"
                size="sm"
                :href="'https://kenya.birdmap.africa/species/' + i"
                target="_blank"
              >
                KBM-{{ i }}
              </b-button>
              <b-button
                squared
                variant="primary"
                class="ml-auto mr-1 btn-xs"
                size="sm"
                :href="'species_map/' + species.SEQ + '.png'"
                target="_blank"
              >
                <b-icon icon="download" /> Download map
              </b-button>
            </b-col>
          </b-row>
          <b-alert
            v-if="species && species.flag != null"
            show
            variant="warning"
            class="m-2 small py-2 px-3"
          >
            <b-icon icon="exclamation-triangle"></b-icon>
            {{ species.flag }}
          </b-alert>
          <b-row class="px-0 my-2">
            <b-col>
              Number of squares{{ species == null ? " for all species" : "" }}
              <span class="sublegend">{{
                display_poor_coverage ? "(including poor coverage)" : ""
              }}</span>
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
            <b-col class="d-flex align-items-center flex-row">
              <div class="flex-grow-1">
                <b-button v-b-toggle:my-collapse size="sm" variant="link">
                  <span class="when-open"><b-icon icon="caret-down-fill" font-scale="1" /></span>
                  <span class="when-closed"><b-icon icon="caret-right-fill" font-scale="1" /></span>
                  Filters list
                </b-button>
              </div>
              <small>Sort by:</small>
              <b-form inline>
                <b-form-select
                  v-model="sort_selected"
                  class="flex-grow-0 ml-1"
                  :options="sort_options"
                  size="sm"
                />
              </b-form>
            </b-col>
          </b-row>
          <b-collapse id="my-collapse">
            <b-card bg-variant="light" class="m-2" no-body>
              <b-card-body class="py-2 d-flex">
                <b-form-checkbox-group
                  v-model="filter_checkbox_selected"
                  :options="filter_checkbox_options"
                  size="sm"
                />
                <b-form inline>
                  <b-form-group label-size="sm" label="Red list category:">
                    <b-form-select
                      v-model="filter_red_list_selected"
                      :options="filter_red_list_options"
                      size="sm"
                    />
                  </b-form-group>
                </b-form>
              </b-card-body>
            </b-card>
          </b-collapse>
          <b-row class="overflow-auto my-2">
            <b-col cols="12" class="mt-2">
              <b-list-group class="small h-100">
                <b-list-group-item
                  v-for="i in sp_sort"
                  :key="i.SEQ"
                  class="d-flex align-items-center py-1 px-3"
                  :active="species == null ? false : i.SEQ == species.SEQ"
                  :action="true"
                  role="button"
                  @click="
                    species = i;
                    update_url();
                  "
                >
                  <b class="ml-1">{{ i.common_name }}</b>
                  <a
                    target="_blank"
                    title="IUCN page"
                    :href="'https://apiv3.iucnredlist.org/api/v3/taxonredirect/' + i.IUCNID"
                  >
                    <img
                      v-if="
                        [
                          'Critically Endangered',
                          'Data Deficient',
                          'Endangered',
                          'Vulnerable',
                        ].includes(i.IUCN)
                      "
                      :src="iucn[i.IUCN]"
                      :alt="i.IUCN"
                      class="ml-1"
                      style="width: 1rem"
                    />
                  </a>
                  <div
                    v-if="i.nb_lkgd[0] + i.nb_lkgd[1] + i.nb_lkgd[2] > 0"
                    v-b-tooltip.right.hover.html="
                      '<b>Lost:</b> ' +
                      i.nb_lkgd[0] +
                      '<br><b>Kept:</b> ' +
                      i.nb_lkgd[1] +
                      '<br><b>Gained:</b> ' +
                      i.nb_lkgd[2]
                    "
                    class="bar kept"
                  >
                    <div
                      class="bar-left lost"
                      :style="{
                        width:
                          (i.nb_lkgd[0] / (i.nb_lkgd[0] + i.nb_lkgd[1] + i.nb_lkgd[2])) * 100 +
                          'px',
                      }"
                    ></div>
                    <div
                      class="bar-right gained"
                      :style="{
                        width:
                          (i.nb_lkgd[2] / (i.nb_lkgd[0] + i.nb_lkgd[1] + i.nb_lkgd[2])) * 100 +
                          'px',
                      }"
                    ></div>
                  </div>
                </b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>
        </b-container>
      </b-col>
      <!-- `h-100-56` must be on the map column too: it is the only height
           source in this row, so without it hiding the sidebar collapsed the
           map to zero height and left a blank screen. -->
      <b-col v-if="mode != 'Intro'" class="flex-grow-1 h-100-56">
        <l-map ref="map" :bounds="bounds">
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
          <l-control position="bottomright">
            <b-button
              v-if="legend == false"
              size="sm"
              variant="primary"
              class="d-lg-none"
              @click="legend = true"
            >
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
              <div v-if="mode == 'Species'" class="mb-1">
                <b>Circle color</b>
                <b-row no-gutters>
                  <b-col
                    v-b-tooltip.top.hover
                    cols="4"
                    class="d-inline-flex justify-content-center"
                    title="The species was present in the historical atlas but was not recorded in the recent period."
                  >
                    <CircleTemplate size="18" class="lost mr-1" /> Lost
                  </b-col>
                  <b-col
                    v-b-tooltip.top.hover
                    cols="4"
                    class="d-inline-flex justify-content-center"
                    title="The species was present in both time periods."
                  >
                    <CircleTemplate size="18" class="kept mr-1" /> Kept
                  </b-col>
                  <b-col
                    v-b-tooltip.top.hover
                    cols="4"
                    class="d-inline-flex justify-content-center"
                    title="The species was not present in the historical atlas but was recorded in the recent period."
                  >
                    <CircleTemplate size="18" class="gained mr-1" />
                    Gained
                  </b-col>
                </b-row>
              </div>
              <div class="mb-1">
                <span v-if="mode == 'Grid'">
                  <b>Change in effort</b>
                  <b-button
                    v-b-tooltip.top.hover
                    size="sm"
                    class="p-0 ml-1"
                    variant="link"
                    title="Change in effort is based on the difference between estimated coverage of the old atlas and the total duration of the new atlas."
                    ><b-icon-question-circle-fill> </b-icon-question-circle-fill>
                  </b-button>
                </span>
                <span v-if="mode == 'Species'">
                  <b>Confidence</b>
                  <b-button
                    v-b-tooltip.top.hover
                    size="sm"
                    class="p-0 ml-1"
                    variant="link"
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
                <div
                  v-if="mode == 'Grid'"
                  class="d-flex justify-content-between"
                  style="font-size: 9px"
                >
                  <span>Reduced</span>
                  <span>Increased</span>
                </div>
                <div
                  v-if="mode == 'Species'"
                  class="d-flex justify-content-between"
                  style="font-size: 9px"
                >
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div>
                <b>Coverage</b>
                <b-button
                  v-b-tooltip.top.hover
                  size="sm"
                  class="p-0 ml-1"
                  variant="link"
                  title="Coverage is considered good if it had a modelled coverage >30% in the old atlas and at least 24hr of total observation time in the new atlas."
                  ><b-icon-question-circle-fill> </b-icon-question-circle-fill>
                </b-button>
                <div class="d-flex align-items-center">
                  <div style="width: 25px" class="d-flex">
                    <CircleTemplate size="7" opacity="0.7" class="m-auto" />
                  </div>
                  <span class="ml-1">Poor coverage </span>
                  <b-checkbox v-model="display_poor_coverage" class="ml-1" switch></b-checkbox>
                </div>

                <div v-if="mode == 'Species'" class="d-flex align-items-center">
                  <div style="width: 25px" class="d-flex">
                    <CircleTemplate size="18" opacity="0.3" class="m-auto" />
                  </div>
                  <span class="ml-1">Never observed</span>
                  <b-checkbox v-model="display_never_observed" class="ml-1" switch></b-checkbox>
                </div>
              </div>
            </div>
          </l-control>
          <l-geo-json
            :geojson="grid_geojson"
            :visible="grid_geojson_visible"
            :options-style="{ color: '#555555', weight: 2, opacity: 0.65, fill: 0 }"
            layer-type="overlay"
            name="Grid square"
          />
          <l-geo-json
            ref="countyGeojson"
            :geojson="county_geojson"
            :visible="county_geojson_visible"
            :options-style="{ color: '#555555', weight: 1.2, opacity: 0.65, fill: 0 }"
            layer-type="overlay"
            name="Counties"
            @update:visible="() => $refs.countyGeojson?.mapObject?.bringToBack()"
          />
          <l-circle
            v-for="c in map_data_filtered"
            :key="c.properties.Sq"
            :lat-lng="c.geometry.coordinates"
            :radius="c.style.radius"
            :color="c.style.color"
            :opacity="c.style.opacity"
            :fill-color="c.style.fillColor"
            :fill-opacity="c.style.fillOpacity"
            :weight="c.style.weight"
            :visible="c.style.visible"
            :options="{ Sq: c.properties.Sq }"
            @click="click_circle"
          />
          <v-geosearch :options="geosearchOptions"></v-geosearch>
        </l-map>
      </b-col>
    </b-row>
    <b-modal id="modal-settings" title="Settings" :hide-footer="true">
      <b-row>
        <b-col cols="12">
          <b-card class="bg-light mb-2" cols="12">
            Select your preferred taxonomy:
            <b-form-group label-size="sm">
              <b-form-select v-model="taxonomy_selected" :options="taxonomy_options" size="sm" />
            </b-form-group>
            <span class="small">
              <b>Note: </b>In order to match the taxonomies used in the old atlas with eBird and
              KBM, we had to align species name to the lowest taxonomical resolution (i.e. lump
              species), explaining some unusual species names.
            </span>
          </b-card>
        </b-col>
        <b-col cols="12">
          <b-card class="bg-light mb-2">
            <b-form-group>
              Customize the map background:
              <b-form-checkbox v-model="grid_geojson_visible">
                Show the grid squares</b-form-checkbox
              >
              <b-form-checkbox v-model="county_geojson_visible">
                Show the county boundary lines
              </b-form-checkbox>
            </b-form-group>
            <div class="d-flex">
              <div class="leaflet-control-layers leaflet-control d-inline">
                <span class="leaflet-control-layers-toggle"></span>
              </div>
              <span class="small ml-2">
                <b>Note: </b>You can also modify these values in the top-right menu of the map.
              </span>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </b-modal>
  </b-container>
</template>

<script>
import "leaflet/dist/leaflet.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import "leaflet-geosearch/assets/css/leaflet.css";
import "./app.scss";

import Multiselect from "vue-multiselect";
import {
  LMap,
  LTileLayer,
  LControlLayers,
  LControl,
  LCircle,
  LGeoJson,
} from "vue2-leaflet";
import { latLngBounds } from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import VGeosearch from "vue2-leaflet-geosearch";

//import 'leaflet.locatecontrol'
import { LocateControl } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.css";

import CircleTemplate from "./circle.vue";
import Intro from "./intro.vue";

import chroma from "chroma-js";
import map_data from "./assets/map_data.json";
import sp_base from "./assets/sp_base.json";
import grid_geojson from "./assets/grid.json";

import iucn_CR from "./assets/iucn_CR.png";
import iucn_VU from "./assets/iucn_VU.png";
import iucn_DD from "./assets/iucn_DD.png";
import iucn_EN from "./assets/iucn_EN.png";
import iucn_NT from "./assets/iucn_NT.png";
import iucn_LC from "./assets/iucn_LC.png";
import logo_png from "./assets/pwa-30x30.png";

const init_lkgd = sp_base.reduce(
  (acc, sp) => {
    acc[0] = acc[0] + sp.nb_lkgd[0];
    acc[1] = acc[1] + sp.nb_lkgd[1];
    acc[2] = acc[2] + sp.nb_lkgd[2];
    acc[3] = acc[3] + sp.nb_lkgd[3];
    return acc;
  },
  [0, 0, 0, 0]
);

const init_lkgd_gc = sp_base.reduce(
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

const empty_geojson = { type: "FeatureCollection", features: [] };

// Field names in sp_base.json for each selectable taxonomy.
const taxonomy_fields = {
  "Clements/eBird": {
    sn: "clements_scientific_name",
    cn: "clements_common_name",
    s: "clements_sort",
  },
  "Checklist of the Birds of Kenya (2019)": {
    sn: "checklist_scientific_name",
    cn: "checklist_common_name",
    s: "checklist_sort",
  },
  "A Bird Atlas of Kenya (1989)": {
    sn: "scientific_name",
    cn: "common_name",
    s: "SEQ",
  },
};
const default_taxonomy_fields = taxonomy_fields["Checklist of the Birds of Kenya (2019)"];

export default {
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LControl,
    LCircle,
    LGeoJson,
    CircleTemplate,
    Multiselect,
    Intro,
    VGeosearch,
  },
  data() {
    return {
      grid_geojson: grid_geojson,
      grid_geojson_visible: false,
      county_geojson: empty_geojson,
      county_geojson_visible: false,
      sidebar: true,
      legend: true,
      mode: "Intro",
      checkbox_lost: true,
      checkbox_kept: true,
      checkbox_gained: true,
      species_options: sp_base,
      species: null,
      filter_red_list_options: [
        "All",
        "Near Threatened",
        "Vulnerable",
        "Endangered",
        "Critically Endangered",
      ],
      filter_red_list_selected: "All",
      filter_checkbox_options: [
        "Endemic",
        "Afrotropical migrant",
        "Palearctic migrant",
        "Waterbird",
      ],
      filter_checkbox_selected: [],
      sort_options: [
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
      sort_selected: "Taxonomy",
      taxonomy_options: [
        "Clements/eBird",
        "Checklist of the Birds of Kenya (2019)",
        "A Bird Atlas of Kenya (1989)",
      ],
      taxonomy_selected: "Checklist of the Birds of Kenya (2019)",
      grid: [],
      bounds: latLngBounds([
        [5.615985, 43.50585],
        [-5.353521, 32.958984],
      ]),
      display_poor_coverage: true,
      display_never_observed: true,
      map_data: map_data.features,
      iucn: {
        "Critically Endangered": iucn_CR,
        "Endangered": iucn_EN,
        "Near Threatened": iucn_NT,
        "Least Concern": iucn_LC,
        "Data Deficient": iucn_DD,
        "Vulnerable": iucn_VU,
      },
      tile_providers: [
        {
          name: "Streets",
          visible: true,
          url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
          attribution: "",
        },
        {
          name: "Satellite",
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
      locate: null,
      deferredPrompt: null, // Store the 'beforeinstallprompt' event
      showInstallButton: false,
      logo_png: logo_png,
    };
  },
  computed: {
    SEQ_grid() {
      let map_data_filtered = this.map_data.filter((y) => this.grid.includes(y.properties.Sq));
      return {
        SEQ_new: [...new Set(map_data_filtered.map((y) => y.properties.SEQ_new).flat(2))],
        SEQ_old: [...new Set(map_data_filtered.map((y) => y.properties.SEQ_old).flat(2))],
      };
    },
    nb_lkgd() {
      if ((this.mode == "Grid") & (this.grid.length > 0)) {
        let f = this.SEQ_grid;
        let SEQ_common = f.SEQ_old.filter((i) => f.SEQ_new.includes(i));
        let l = f.SEQ_old.length - SEQ_common.length;
        let g = f.SEQ_new.length - SEQ_common.length;
        let k = SEQ_common.length;
        let d = f.SEQ_new.length - f.SEQ_old.length;
        return [l, k, g, d];
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
      let f = this.SEQ_grid;
      let sp_base_returned = [...this.sp_taxo].sort((a, b) => a.sort - b.sort);
      sp_base_returned = sp_base_returned.map((y) => {
        const n = f.SEQ_new.includes(y.SEQ);
        const o = f.SEQ_old.includes(y.SEQ);
        return { ...y, trend: n && o ? "kept" : n ? "gained" : o ? "lost" : "" };
      });
      return sp_base_returned.filter((y) => {
        if (y.trend == "lost") {
          return this.checkbox_lost;
        } else if (y.trend == "kept") {
          return this.checkbox_kept;
        } else if (y.trend == "gained") {
          return this.checkbox_gained;
        } else {
          return false;
        }
      });
    },
    sp_taxo() {
      const { sn, cn, s } = taxonomy_fields[this.taxonomy_selected] ?? default_taxonomy_fields;
      return sp_base.map((sp) => {
        return {
          scientific_name: sp[sn],
          common_name: sp[cn],
          sort: sp[s],
          per_lkgd: sp.per_lkgd,
          nb_lkgd: sp.nb_lkgd,
          per_lkgd_gc: sp.per_lkgd_gc,
          nb_lkgd_gc: sp.nb_lkgd_gc,
          kbm: sp.kbm,
          ebird: sp.ebird,
          IUCN: sp.IUCN,
          IUCNID: sp.IUCNID,
          SEQ: sp.SEQ,
          endemic: sp.endemic,
          afrotropical: sp.afrotropical,
          palearctic: sp.palearctic,
          waterbird: sp.waterbird,
          flag: sp.flag,
        };
      });
    },
    sp_filter() {
      let spf = this.sp_taxo;
      if (this.filter_checkbox_selected.includes("Endemic")) {
        spf = spf.filter((sp) => sp.endemic);
      }
      if (this.filter_checkbox_selected.includes("Afrotropical migrant")) {
        spf = spf.filter((sp) => sp.afrotropical);
      }
      if (this.filter_checkbox_selected.includes("Palearctic migrant")) {
        spf = spf.filter((sp) => sp.palearctic);
      }
      if (this.filter_checkbox_selected.includes("Waterbird")) {
        spf = spf.filter((sp) => sp.waterbird);
      }
      if (this.filter_red_list_selected == "Near Threatened") {
        spf = spf.filter((sp) =>
          ["Critically Endangered", "Endangered", "Vulnerable", "Near Threatened"].includes(sp.IUCN)
        );
      } else if (this.filter_red_list_selected == "Vulnerable") {
        spf = spf.filter((sp) =>
          ["Critically Endangered", "Endangered", "Vulnerable"].includes(sp.IUCN)
        );
      } else if (this.filter_red_list_selected == "Endangered") {
        spf = spf.filter((sp) => ["Critically Endangered", "Endangered"].includes(sp.IUCN));
      } else if (this.filter_red_list_selected == "Critically Endangered") {
        spf = spf.filter((sp) => ["Critically Endangered"].includes(sp.IUCN));
      }
      return spf;
    },
    sp_sort() {
      // Copy before sorting: `sp_filter` may hand back the `sp_taxo` array
      // itself, and sorting in place would corrupt that cached computed.
      let disp_lkgd = this.sort_selected.includes("%") ? "per_lkgd" : "nb_lkgd";
      let spf = [...this.sp_filter];
      if (this.sort_selected == "Taxonomy") {
        return spf.sort((a, b) => a.sort - b.sort);
      } else if (this.sort_selected.includes("Lost")) {
        return spf.sort((a, b) => b[disp_lkgd][0] - a[disp_lkgd][0]);
      } else if (this.sort_selected.includes("Gained")) {
        return spf.sort((a, b) => b[disp_lkgd][2] - a[disp_lkgd][2]);
      } else if (this.sort_selected.includes("Kept")) {
        return spf.sort((a, b) => b[disp_lkgd][1] - a[disp_lkgd][1]);
      } else if (this.sort_selected.includes("Difference")) {
        return spf.sort((a, b) => b[disp_lkgd][3] - a[disp_lkgd][3]);
      } else {
        return spf;
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
            if (this.grid.length != 0) {
              if (this.grid.includes(x.properties.Sq)) {
                x.style.fillOpacity = 1;
              } else if (x.properties.mask) {
                x.style.visible = this.display_poor_coverage ? x.style.visible : false;
                x.style.fillOpacity = 0.4;
              } else {
                x.style.fillOpacity = 0.4;
              }
            }
          } else {
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
              sz_dir = -1;
            }
            if (x.properties.mask) {
              x.style.visible = this.display_poor_coverage ? x.style.visible : false;
              x.style.fillOpacity = 0.4;
            }
          }
          x.style.opacity = x.style.fillOpacity;
          let szmax = 30000; //max radius in ???
          let szmin = 10000; //min radius in ???
          let xs = 0.7; // correction value normalization
          let szn =
            sz_dir *
            Math.sign(x.properties.corr) *
            Math.min(Math.sqrt(Math.abs(x.properties.corr)) / Math.sqrt(Math.abs(xs)), 1);
          x.style.radius = ((szn + 1) / 2) * (szmax - szmin) + szmin; //(40000 / 2) * (1 + sz_dir * 3 * x.properties.corr);
          if (x.properties.mask) x.style.radius = 7000;
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
          if (!this.grid.includes(Sq)) {
            this.grid.push(Sq);
          } else {
            this.grid = this.grid.filter((i) => i != Sq);
          }
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
            layer.bindTooltip(
              "<b>Grid:</b> " + feature.properties.Sq + "<br>" + "<b>Status:</b> " + status,
              {
                permanent: false,
                sticky: true,
              }
            );
          }
        },
      };
    },
  },
  watch: {
    sidebar: function (val) {
      if (!val) {
        setTimeout(() => {
          const map = this.$refs.map?.mapObject;
          if (!map) return;
          map.invalidateSize();
          map.fitBounds(
            latLngBounds([
              [5.615985, 43.50585],
              [-5.353521, 32.958984],
            ])
          );
        }, 10);
      }
    },
    mode: function (val) {
      this.update_url();
      if (val == "Intro") return;
      // <l-map> is inside `v-if="mode != 'Intro'"`, so on the Intro -> Grid
      // transition it is not in the DOM yet when this watcher runs.
      this.$nextTick(() => {
        const map = this.$refs.map?.mapObject;
        if (!map || this.locate != null) return;

        // This does not work with this: https://github.com/vue-leaflet/Vue2Leaflet/issues/476
        map.on("locationfound", (e) => {
          const dist = this.map_data.map(
            (m) =>
              Math.pow(m.geometry.coordinates[0] - e.latitude, 2) +
              Math.pow(m.geometry.coordinates[1] - e.longitude, 2)
          );
          const min_id = dist.reduce((r, v, i, a) => (v >= a[r] ? r : i), -1);
          if (dist[min_id] < 1) {
            this.grid = [this.map_data[min_id].properties.Sq];
            this.grid_geojson_visible = true;
            this.checkbox_kept = false;
            this.checkbox_lost = true;
            this.checkbox_gained = false;
          } else {
            alert("Your location is too far from a square. No list will be shown");
          }
        });

        this.locate = new LocateControl({
          strings: {
            title: "Explore target species at my location!",
          },
          locateOptions: {
            maxZoom: 9,
          },
        });
        this.locate.addTo(map);
      });
    },
    // `update_url` used to be called from the `grid_list` computed, which meant
    // the URL only tracked state while that list happened to be re-evaluated.
    grid: {
      handler() {
        this.update_url();
      },
      deep: true,
    },
    species() {
      this.update_url();
    },
    taxonomy_selected() {
      this.$cookie.set("taxonomy_selected", JSON.stringify(this.taxonomy_selected), 365);
    },
    async county_geojson_visible(val) {
      if (!val || this.county_geojson.features.length > 0) return;
      const { default: county_geojson } = await import("./assets/county.json");
      this.county_geojson = county_geojson;
    },
  },
  mounted() {
    try {
      const saved = JSON.parse(this.$cookie.get("taxonomy_selected"));
      if (this.taxonomy_options.includes(saved)) this.taxonomy_selected = saved;
    } catch {
      // Malformed cookie: keep the default taxonomy.
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Update UI to show the install button
      this.showInstallButton = true;
    });
  },
  created() {
    let qp = new URLSearchParams(window.location.search);
    let species = qp.get("species");
    if (species && species != "null" && species != "NaN" && !isNaN(Number(species))) {
      this.species = sp_base.find((x) => x.SEQ == Number(species)) ?? null;
    }
    let mode = qp.get("mode");
    if (mode) this.mode = mode;
    let grid = qp.get("grid");
    if (grid) this.grid = grid.split(",");
  },
  methods: {
    number_with_commas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    update_url() {
      let qp = new URLSearchParams();
      if (this.mode) qp.set("mode", this.mode);
      if (this.grid && this.grid.length > 0) qp.set("grid", this.grid.join(","));
      if (this.species != null) qp.set("species", this.species.SEQ);
      history.replaceState(null, "", "?" + qp.toString());
    },
    selectLabel({ common_name, scientific_name }) {
      return `${common_name} — [${scientific_name}]`;
    },
    export_csv() {
      let l = this.grid_list.map(
        ({ IUCNID, per_lkgd, per_lkgd_gc, nb_lkgd, nb_lkgd_gc, sort, kbm, ebird, SEQ, ...item }) =>
          item
      );
      if (l.length == 0) return;
      let keys = Object.keys(l[0]);

      // 26 species carry a comma inside `flag`, which shifts every later
      // column unless the value is quoted.
      const escape = (v) => {
        const str = v == null ? "" : String(v);
        return /[",\n\r]/.test(str) ? '"' + str.replaceAll('"', '""') + '"' : str;
      };

      let csv = keys.map(escape).join(",") + "\n";
      l.forEach((obj) => {
        csv += keys.map((k) => escape(obj[k])).join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kenyabirdtrend_export_" + this.grid.join("_") + ".csv";
      a.click();
      window.URL.revokeObjectURL(url);
    },
    async promptInstall() {
      if (this.deferredPrompt) {
        // Show the install prompt
        this.deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and it can't be used again, so clear it
        this.deferredPrompt = null;
        // Hide the install button
        this.showInstallButton = false;
      }
    },
  },
};
</script>
