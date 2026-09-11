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

## Species distribution maps

The 1065 per-species PNGs in `species_map/` are deliberately **outside**
`public/`: at ~1 GB they would otherwise be copied into `dist/` and shipped in
every deploy. They are served from jsDelivr instead — see `SPECIES_MAP_BASE`
in `src/store.js`, overridable with `VITE_SPECIES_MAP_BASE`.

jsDelivr serves them from the `main` branch, so they are unaffected by how the
site itself is deployed. After changing that path, purge jsDelivr or pin a
release tag: it caches a branch ref for several hours.

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

Each row of `sp_base.json` is one **atlas concept**, keyed by `SEQ`. A concept
is not always one species: the 1970-84 atlas recorded 35 of them at a coarser
resolution than today's checklists — its "Ostrich" predates Somali Ostrich
being split off — so a row can stand for several modern species. That is why
the file carries two namings side by side rather than one:

| columns | naming |
| --- | --- |
| `common_name`, `scientific_name`, `SEQ` | A Bird Atlas of Kenya (1989) — historical |
| `avilist_common_name`, `avilist_scientific_name`, `avilist_sort` | AviList v2025b — current |

`TAXONOMY_FIELDS` in `src/store.js` maps the taxonomy toggle onto those two
triplets. A lump gets an eBird-style slash name (`European Pied/Collared/
Semicollared Flycatcher`) and a collapsed binomial (`Ficedula sp.`).

The rest of the contract, asserted by `tests/dataSchema.test.js`:

- `avibase_id` — the stable [Avibase](https://avibase.bsc-eoc.org) concept id,
  present for **every** row, lumps included. Names change between checklists
  and a lump has no single binomial, so this is the only field that says
  exactly which taxon a row means. Kept in the CSV export for that reason.
- `ebird` — flat array of current eBird species codes, one working
  `ebird.org/species/<code>/KE` link each. It used to include slash/spuh codes
  (`y00820`), which have no species page and rendered as dead links.
- `birdlife_url` — AviList's BirdLife DataZone factsheet, `null` for a lump
  (no single factsheet to point at, so the badge renders unlinked).
- `IUCN` — spelled-out category. A lump reports its most severe member, so a
  Critically Endangered species inside one is not hidden.
- `endemic`, `afrotropical`, `palearctic`, `waterbird` — the trait filters.
- A missing value is `null`. The pre-2026 export spelled it `"0"`, which
  rendered literally and exported as a bogus IUCN category.
