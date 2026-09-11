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
