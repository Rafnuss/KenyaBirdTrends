<template>
  <div>
    <b-container class="py-3">
      <h1 class="pb-3">
        Welcome to Kenya Bird Trends!
        <b-img src="logo_test_large.png" class="pl-4 bg-white" height="139" align="right" />
      </h1>
      <p>
        Kenya has seen significant changes in its landscape over the past 50 years: exponential
        population increase has been accompanied by growing urbanisation, intensified agriculture,
        deforestation, and increased pollution, among others.
        <b>How have these changes impacted bird abundance and distribution on a large scale?</b>
        Answering this question is key to better protecting birds today.
      </p>
      <p>
        Thanks to the contributions of thousands of citizen scientists across the country, we can
        now offer initial answers to this question. To do so, we compare citizen science data with
        one of Africa's oldest and most comprehensive bird atlases to map changes in
        <b>bird distribution patterns across the past 50 years</b>.
      </p>

      <p>
        On this platform, you can
        <b>visualize the change in the spatial range of each bird species in Kenya</b>
        between the historical and recent time period. We compare bird presence information within
        each square to define whether the species has gained, lost, or kept this square between the
        two periods considered. Changes are displayed on a grid of 55x55 km squares spanning the
        entire country.
      </p>

      <h2>How to navigate this platform</h2>
      <p>
        You can explore the changes in bird distribution using two views
        <span class="small">(accessible from the menu in the header above)</span>:
      </p>

      <b-card-group deck class="mb-2">
        <b-card class="bg-light">
          <p class="text-muted mb-0">Grid</p>
          <span class="small">
            Select one or multiple grid squares (27x27km) on the map to view and export the list of
            species lost, kept, and gained in this area.
          </span>
          <template #footer>
            <div class="d-flex justify-content-center">
              <b-button @click="$emit('changeModeGrid')" align-self="center"
                >Go to Grid view</b-button
              >
            </div>
          </template>
        </b-card>
        <b-card class="bg-light">
          <p class="text-muted mb-0">Species</p>
          <span class="small">
            Visualize which squares were lost, kept, and gained for a specific species.
          </span>
          <template #footer>
            <div class="d-flex justify-content-center">
              <b-button @click="$emit('changeModeSpecies')">Go to Species view</b-button>
            </div>
          </template>
        </b-card>
      </b-card-group>

      <h2>Data sources</h2>
      <p>
        Presence data was extracted from the sources below to draw out changes in a species'
        distribution. For the recent period, data from two sources was combined to create a single
        species map that was compared with the corresponding species map from the historical atlas.
      </p>
      <b-row>
        <b-col md="6">
          <h5 style="text-align: center">HISTORICAL ATLAS</h5>
          <b-card no-body class="overflow-hidden">
            <b-row no-gutters>
              <b-col cols="4">
                <a href="https://doi.org/10.1201/9781315136264" target="_blank">
                  <b-card-img src="bird_atlas_of_kenya.png" alt="Image" class="rounded-0" />
                </a>
              </b-col>
              <b-col cols="8">
                <b-card-body title="A Bird Atlas of Kenya" sub-title="1970-1984">
                  <b-card-text>
                    <p class="small">
                      <em>A Bird Atlas of Kenya</em> (Lewis & Pomeroy, 1989) is the reference book
                      describing the status and distribution of 1 065 species at the scale of
                      quarter square degree (QSD, 27 x 27 km).
                    </p>
                    <a href="https://doi.org/10.15468/2ga3wk">
                      <img src="https://zenodo.org/badge/DOI/10.15468/2ga3wk.svg" alt="DOI" />
                    </a>
                  </b-card-text>
                </b-card-body>
              </b-col>
            </b-row>
          </b-card>
        </b-col>

        <b-col md="6">
          <h5 style="text-align: center">RECENT ATLAS</h5>
          <b-row>
            <b-col cols="12">
              <b-card no-body class="overflow-hidden">
                <b-row no-gutters>
                  <b-col cols="4" class="align-self-center">
                    <a href="https://ebird.org/region/KE" target="_blank">
                      <b-card-img src="logo_ebird.svg" alt="Image" class="rounded-0 p-2" />
                    </a>
                  </b-col>
                  <b-col cols="8">
                    <b-card-body title="eBird" sub-title="2009-2023">
                      <b-card-text>
                        <p class="small">
                          eBird is the largest online bird database. We used all data entered in
                          Kenya since 2009 to produce species maps of presence at the QSD
                          resolution.
                        </p>
                      </b-card-text>
                    </b-card-body>
                  </b-col>
                </b-row>
              </b-card>
            </b-col>
            <b-col cols="12 mt-2">
              <b-card no-body class="overflow-hidden">
                <b-row no-gutters>
                  <b-col cols="4" class="align-self-center">
                    <a href="https://kenya.birdmap.africa/" target="_blank">
                      <b-card-img src="logo_kbm.png" alt="Image" class="rounded-0 p-2" />
                    </a>
                  </b-col>
                  <b-col cols="8">
                    <b-card-body title="KBM" sub-title="2012-2023">
                      <b-card-text>
                        <p class="small">
                          Kenya Bird Map leads current efforts to establish a new bird atlas from
                          citizen scientists. We used presence information (from full or ad-hoc
                          protocols) for each species at the pentad level and upscaled each map to
                          match the spatial resolution of the historical atlas.
                        </p>
                      </b-card-text>
                    </b-card-body>
                  </b-col>
                </b-row>
              </b-card>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <h2>Export products</h2>
      <p>You can export two products from this website:</p>
      <ol>
        <li>A map of distribution change for each species (.jpg), from the species view</li>
        <li>
          A list of species and their corresponding trend for a given area (.csv), from the grid
          view
        </li>
      </ol>
      <h2>Resources</h2>
      <b-row>
        <b-col lg="4" sm="12" class="align-self-center">
          <b-card-body title="Banner" sub-title="View the banner describing the project">
            <a
              href="https://www.canva.com/design/DAGJVNqdmGw/kqibyQ0Ly71C0xtWXUNmDw/edit?utm_content=DAGJVNqdmGw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
              target="_blank"
            >
              <b-card-img src="banner.png" alt="Image" class="rounded-0 p-2" />
            </a>
          </b-card-body>
        </b-col>
        <b-col lg="4" sm="12" class="align-self-center">
          <b-card-body
            title="Video presentation"
            sub-title="View the banner describing the project"
          >
            <a
              href="https://www.canva.com/design/DAGJVNqdmGw/kqibyQ0Ly71C0xtWXUNmDw/edit?utm_content=DAGJVNqdmGw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
              target="_blank"
            >
              <b-card-img src="banner.png" alt="Image" class="rounded-0 p-2" />
            </a>
          </b-card-body>
        </b-col>
        <b-col lg="4" sm="12" class="align-self-center">
          <b-card-body title="Publication" sub-title="View the banner describing the project">
            <a
              href="https://www.canva.com/design/DAGJVNqdmGw/kqibyQ0Ly71C0xtWXUNmDw/edit?utm_content=DAGJVNqdmGw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
              target="_blank"
            >
              <b-card-img src="banner.png" alt="Image" class="rounded-0 p-2" />
            </a>
          </b-card-body>
        </b-col>
      </b-row>
      <p>
        This work and key results are described in detail in: <br /><em
          ><span
            >Nussbaumer et al. (in prep), Historical bird atlas and contemporary citizen science
            data reveal long-term changes in geographic range of Kenyan birds</span
          ></em
        >.
      </p>
    </b-container>
    <b-container fluid class="bg-light p-5">
      <!--<h6 class="text-muted text-uppercase">Implementing organisations</h6>-->
      <b-row class="pb-2 justify-content-center">
        <b-col
          lg="3"
          sm="6"
          v-for="o in organisations"
          :key="o.href"
          class="mb-2"
          style="height: 9rem"
        >
          <a :href="o.href" target="_blank" class="logo-link px-2 bg-white rounded h-100">
            <b-img fluid :src="o.src" alt="Image" class="img-organisations" />
          </a>
        </b-col>
      </b-row>
      <!--<h6 class="text-muted text-uppercase">Partner organisations</h6>-->
      <b-row class="justify-content-center">
        <b-col
          cols="6"
          md="4"
          lg="2"
          v-for="p in partners"
          :key="p.href"
          class="mb-2"
          style="height: 7rem"
        >
          <a class="logo-link px-2 bg-white rounded h-100" :href="p.href" target="_blank">
            <b-img fluid :src="p.src" alt="Image" class="img-partners" />
          </a>
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid class="bg-dark p-3 small text-white">
      For any questions or suggestions, please reach out to
      <a href="mailto:rafnuss@gmail.com" target="_blank" class="text-white">Raphaël Nussbaumer</a>.
      <a href="https://github.com/Rafnuss/KenyaBirdTrends" target="_blank">
        <b-icon-github variant="white" />
      </a>
    </b-container>
  </div>
</template>

<script>
import CircleTemplate from "./circle.vue";

export default {
  components: {
    CircleTemplate,
  },
  data() {
    return {
      organisations: [
        { href: "https://tropical-biology.org/", src: "logo_tba.png" },
        { href: "https://www.arocha.or.ke/", src: "logo_ark.png" },
        { href: "https://museums.or.ke/", src: "logo_museums.png" },
      ],
      partners: [
        { href: "https://www.darwininitiative.org.uk/", src: "logo_darwin.png" },
        { href: "https://naturekenya.org/", src: "logo_nature_kenya.png" },
        { href: "https://www.kws.go.ke/", src: "logo_kws.png" },
        { href: "https://wrti.go.ke/", src: "logo_wrti.png" },
        { href: "https://nigeria.birdmap.africa/", src: "logo_nba.png" },
        { href: "https://www.kenyabirdofpreytrust.org/", src: "logo_kbop.png" },
      ],
    };
  },
};
</script>
