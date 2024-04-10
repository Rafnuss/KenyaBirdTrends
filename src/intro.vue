<template>
  <b-container>
    <h1>Kenya Bird Trends</h1>
    <b-alert show variant="info" class="mt-3">
      <p>Welcome to !</p>
      <p>
        Visualize the change in the distribution of birds in Kenya between two time periods:
        1970-1984 and 2009-2023. Read below to learn how the maps are built and how to navigate
        them.
      </p>
    </b-alert>

    <p>You can explore distribution changes in two views:</p>
    <ol>
      <li>
        <b-button size="sm"> Grid </b-button>
        Click on the square(s) on the map to learn about specific areas you are interested in.
      </li>
      <li>
        <b-button size="sm"> Species </b-button>
        Select the species you are interested in to view their distribution map.
        <p>
          You can use filters to browse only endemic, Red-listed, migrant, or waterbird species. You
          can also use the “Sort by” button to sort species by most gained or lost squares.
        </p>
      </li>
    </ol>

    <h2>Data sources</h2>
    <p>We compare species presence between two distinct periods:</p>
    <b-row>
      <b-col cols="6">
        <b-card no-body class="overflow-hidden">
          <b-row no-gutters>
            <b-col md="4">
              <a href="https://doi.org/10.1201/9781315136264" target="_blank">
                <b-card-img src="bird_atlas_of_kenya.png" alt="Image" class="rounded-0" />
              </a>
            </b-col>
            <b-col md="8">
              <b-card-body title="A Bird Atlas of Kenya" sub-title="1970-1984">
                <b-card-text>
                  Presence data taken from
                  <p class="tiny-font">
                    <em>A Bird Atlas of Kenya</em> (Lewis & Pomeroy, 1989) is the reference book
                    describing the status and distribution of 1 065 species at the scale of quarter
                    square degree (QSD, 27 x 27 km).
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
      <b-col cols="6">
        <b-row>
          <b-col cols="12">
            <b-card no-body class="overflow-hidden">
              <b-row no-gutters>
                <b-col md="4" class="align-self-center">
                  <a href="https://ebird.org/region/KE" target="_blank"
                    ><b-card-img src="logo_ebird.svg" alt="Image" class="rounded-0 p-2"
                  /></a>
                </b-col>
                <b-col md="8">
                  <b-card-body title="eBird" sub-title="2009-2023">
                    <b-card-text>
                      <p class="tiny-font">
                        eBird is the largest online bird database. We used all data entered in Kenya
                        since 2009 to produce species maps of presence at the QSD resolution.
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
                <b-col md="4" class="align-self-center">
                  <a href="https://kenya.birdmap.africa/" target="_blank"
                    ><b-card-img src="logo_kbm.png" alt="Image" class="rounded-0 p-2"
                  /></a>
                </b-col>
                <b-col md="8">
                  <b-card-body title="KBM" sub-title="2009-2023">
                    <b-card-text>
                      <p class="tiny-font">
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

    <b-alert show variant="warning">
      <b>These maps show presence data only and do not provide information on abundance!</b>
      There is no difference between the square holding 1 or 10 000 invididuals, so it is not
      possible to directly draw conclusions on abundance trends.
    </b-alert>

    <h2>Export products</h2>
    <p>You can export two products from this website:</p>
    <ol>
      <li>A map of distribution change for each species (.jpg), from the species view</li>
      <li>
        A list of species and their corresponding trend for a given area (.csv), from the grid view
      </li>
    </ol>
    <p class="tiny-font">
      For any questions, please reach out to
      <a href="mailto:rafnuss@gmail.com" target="_blank">Raphaël Nussbaumer</a> |
    </p>
  </b-container>
</template>

<script>
import CircleTemplate from "./circle.vue";

export default {
  components: {
    CircleTemplate,
  },
};
</script>
