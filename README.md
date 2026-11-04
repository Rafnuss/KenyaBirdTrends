# Kenya Bird Trends

:sparkles: This repository contains the source code to generate the website [kenyabirdtrends.co.ke](https://kenyabirdtrends.co.ke/).

:metal: We're using the sweet combo [Vite](https://vitejs.dev/)+[Vue 3](https://vuejs.org/)+[Bootstrap 5](https://getbootstrap.com/)+[VueLeaflet](https://vue-leaflet.github.io/vue-leaflet/)!

## Species View

![image](https://github.com/user-attachments/assets/7ebb2728-29a3-4171-ad4a-60d4aa79ac33)
_Explore The change in distributation of any species in the species view and searching for you species of interest_

## Grid View

![image](https://github.com/user-attachments/assets/c0387d8a-c42d-4094-b809-fec3d8cb17d3)
_Selecting squares over Tsavo West allows you to then export a list of all species lost, kept and gained_

## Resources

- :clapper: See the [introductory video](https://youtu.be/_h1KA6D6EuM) of the website.
- :computer: You can find the MATLAB code use to generate the maps and species list at [Rafnuss/KenyaAtlasComparison](https://github.com/Rafnuss/KenyaAtlasComparison).
- :page_facing_up: The [associated publication](https://doi.org/10.1111/ddi.13935) is freely available

## Lost & Found (in development)

The third page lists, for every square, the **target species**: recorded before 2009 (in the old atlas, any period, or on eBird or Kenya Bird Map) but not in 2009–2023. It shows which targets have been **re-found** since 2024 and which species are **new** to the square (no record of any kind before 2024). Each category can be mapped. A leaderboard, per year or for the whole period, gives one point for each re-found or new species–square to everyone who recorded it on the first date since 2024; names link to eBird profiles and dates to checklists. The page name is set by `FOUND_LABEL` in `src/store.js`.

The records come from [Rafnuss/bird-atlas](https://github.com/Rafnuss/bird-atlas) (`scripts/shared/latest_by_qdgc.py`; see [`docs/kenyabirdtrend-pipeline.md`](https://github.com/Rafnuss/bird-atlas/blob/main/docs/kenyabirdtrend-pipeline.md)). Its output is keyed by standard QDGC level-1 codes and eBird 2026 species, not by `Sq` or comparison concepts. This repository does the mapping:

- **Squares:** every `grid.json` square is a QDGC level-1 cell. `src/utils/squares.js` derives `Sq ↔ qdgc` from `grid.json` and `map_data.json` (checked by `tests/squares.test.js`).
- **Species:** eBird species are rolled up to comparison concepts through `sp_base.json` `ebird` codes. The 2026-11 review added 27 concepts and 15 members in KenyaAtlasComparison. A species without a concept would count as its own unit, and could only be "new".

The rules live in `src/utils/foundData.js` and are tested in `tests/foundData.test.js`. Import a run with:

```sh
npm run import:found -- ../bird-atlas/data/prepared/latest_by_qdgc/<run-id>
```

This writes `src/assets/found.json` (about 1 MB), which is loaded only when the page is opened.

## Species distribution maps

The download button generates a fresh PNG in the browser from the current comparison data. It uses Mapbox terrain tiles when available and falls back to a simplified map if they cannot be loaded. The historical `species_map/` PNGs are an archive and may contain outdated taxonomy or maps; they are not used by the site or included in its deployment artifact.

## Deployment

`.github/workflows/build_and_deploy.yml` lints, tests and builds on every push
and pull request, then publishes `dist/` to GitHub Pages **as a workflow
artifact** (`actions/upload-pages-artifact` + `actions/deploy-pages`). Pull
requests run everything except the final publish, so a PR exercises the deploy
path without touching the live site. `workflow_dispatch` republishes without a
code change, which is handy after `npm run sync:data`.

This replaced pushing the built site to a `gh-pages` branch. The build output
is no longer committed anywhere, so `dist` never enters the repository's
history, and the workflow no longer needs `contents: write`.

`public/CNAME` pins the custom domain into the build. The domain is also set
in the repository's Pages settings, which is what actually serves it; keeping
the file means the domain is visible in the source and survives if that
setting is ever lost.

## Regenerating the county outlines

`data/county.raw.json` is the survey-grade source. `npm run build:county`
simplifies it into `src/assets/county.json` (183k points -> 18k, 9.6 MB ->
352 kB), which is what the app bundles.

## Species data and the taxonomy contract

`src/assets/sp_base.json`, `map_data.json` and `grid.json` are **generated**,
not edited here: `E_export_website.m` in
[Rafnuss/KenyaAtlasComparison](https://github.com/Rafnuss/KenyaAtlasComparison)
writes them. Copy them across with:

```sh
npm run sync:data                      # defaults to ../KenyaAtlasComparison
KAC=/path/to/repo npm run sync:data
```

Each row of `sp_base.json` is one comparison taxon, uniquely keyed by `avibase_id`. `SEQ` remains a legacy reference for historical sorting and older links. A historical concept can cover several modern species, so both naming systems are retained:

| Columns | Naming |
| --- | --- |
| `common_name`, `scientific_name` | Original atlas name |
| `avilist_common_name`, `avilist_scientific_name`, `avilist_sort` | AviList 2026 or an explicitly labelled historical group |
| `avilist_members`, `name_source` | Modern member names and the name's provenance |

`TAXONOMY_FIELDS` in `src/store.js` controls the selected naming. Historical groups list their explicit modern member names; the species panel links to the original atlas concepts.

The remaining contract is checked by `tests/dataSchema.test.js`:

- `avibase_id`: unique comparison concept ID, retained in CSV exports and map memberships. Species URLs use the numeric `SEQ`; historical Avibase links and merged atlas SEQs still resolve.
- `atlas_concepts`: original atlas names and Avibase IDs for each comparison entry.
- `taxa_old` / `taxa_new` in map features: flat arrays of Avibase IDs for the two periods.
- `ebird` / `kbm`: flat arrays of associated species-page codes and KBM references, derived from the curated source mappings.
- `birdlife_url` / `IUCN`: available member assessment information. Groups use the most severe available status; a missing value is `null`.
- `endemic`, `afrotropical`, `palearctic`, `waterbird`: curated trait filters.
- `nb_lkgd` / `nb_lkgd_gc`: lost, kept, gained and gained-minus-lost counts, for all squares and the coverage-filtered view.

Run `npm run sync:data` after rebuilding KenyaAtlasComparison with `AA_wrapper_all.m`. eBird and Birds of Kenya 2019 naming systems are retired; eBird observations and KBM observations remain data sources. Download map renders a PNG from the current taxon's exported data and does not use the archived `species_map` PNGs.
