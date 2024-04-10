<template>
  <div>
    <b-container class="py-3">
      <h1 class="pb-3">
        Welcome to Kenya Bird Trends!
        <b-img src="logo_test_large.png" class="pl-4 bg-white" height="139" align="right" />
      </h1>
      <p>
        Kenya has seen drastic changes in the past 50 years in this landscape. ... But exactly how
        these changes have impacted the kenyan avifauna is still poorly documented.
      </p>
      <p>This work is based on... where we did that and that...</p>
      <p>
        Visualize the change in the distribution of birds in Kenya between two time periods:
        1970-1984 and 2009-2023. These changes are displayed on a grid of 27 x 27 km squares
        spanning the entire country. We compare bird presence information within each square to
        define whether the species has gained, lost, or kept this square between the two periods
        considered.
      </p>

      <h2>How to navigate</h2>
      <p>
        You can explore the changes in bird distribution in two views(<span class="small"
          >accessible from the menu in the header above</span
        >):
      </p>

      <b-card-group deck class="mb-2">
        <b-card class="bg-light">
          <p class="text-muted mb-0">Grid</p>
          <p class="small">
            Select one or mulitple grid square (27x27km) on the map to view and export the list of
            species lost, kept or gained.
          </p>
          <b-button>Grid</b-button>
        </b-card>
        <b-card class="bg-light">
          <p class="text-muted mb-0">Species</p>
          <p class="small">
            Visualize the map of the region lost kept or gained for a specific species.
          </p>
          <b-button>Species</b-button>
        </b-card>
      </b-card-group>

      <h2>Data sources</h2>
      <p>
        To draw out changes in species distribution, we extracted presence data from the sources
        below. For the recent period, we combined data from two sources to create a single species
        map that we compared with the corresponding species map from the historical atlas.
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
                    <a href="https://ebird.org/region/KE" target="_blank"
                      ><b-card-img src="logo_ebird.svg" alt="Image" class="rounded-0 p-2"
                    /></a>
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
                    <a href="https://kenya.birdmap.africa/" target="_blank"
                      ><b-card-img src="logo_kbm.png" alt="Image" class="rounded-0 p-2"
                    /></a>
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
    </b-container>
    <b-container fluid class="bg-light p-5">
      <h6 class="text-muted text-uppercase">Implementing organisations</h6>
      <b-row align-v="stretch" class="px-5 pb-2">
        <b-col md="4" v-for="o in organisations" :key="o.href">
          <a :href="o.href" target="_blank" class="logo-link p-4 bg-white rounded h-100">
            <b-img fluid :src="o.src" alt="Image" class="img-organisations" />
          </a>
        </b-col>
      </b-row>
      <h6 class="text-muted text-uppercase">Partner organisations</h6>
      <b-row align-v="stretch" class="px-5">
        <b-col md="2" v-for="p in partners" :key="p.href">
          <a :href="p.href" target="_blank" class="logo-link p-4 bg-white rounded h-100">
            <b-img fluid :src="p.src" alt="Image" class="img-partners" />
          </a>
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid class="bg-dark p-3 small text-white">
      For any questions, please reach out to
      <a href="mailto:rafnuss@gmail.com" target="_blank" class="text-white">Raphaël Nussbaumer</a>.
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
        { href: "https://tropical-biology.org/", src: "logo_birdlife.png" },
        { href: "https://tropical-biology.org/", src: "logo_kfs.png" },
        { href: "https://tropical-biology.org/", src: "logo_kws.png" },
        { href: "https://tropical-biology.org/", src: "logo_nature_kenya.png" },
        { href: "https://tropical-biology.org/", src: "logo_nema.png" },
        { href: "https://tropical-biology.org/", src: "logo_wrti.png" },
      ],
    };
  },
};
</script>
