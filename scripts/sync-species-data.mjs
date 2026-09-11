/**
 * Copy the generated species data over from the analysis repository.
 *
 * `sp_base.json`, `map_data.json` and `grid.json` are written by
 * `E_export_website.m` in Rafnuss/KenyaAtlasComparison; this repository only
 * consumes them. Keeping the copy in a script rather than in someone's shell
 * history means the source path and the file list are written down, and the
 * schema is checked before anything lands in `src/assets/`.
 *
 * Run with: npm run sync:data
 *   KAC=/path/to/KenyaAtlasComparison npm run sync:data
 */
import fs from "node:fs";
import path from "node:path";

const SRC_REPO = process.env.KAC ?? "../KenyaAtlasComparison";
const SRC_DIR = path.join(SRC_REPO, "export/website");
const OUT_DIR = "src/assets";
const FILES = ["sp_base.json", "map_data.json", "grid.json"];

/**
 * Columns the app reads. Mirrors tests/dataSchema.test.js: catching a
 * mismatch here names the missing column, rather than letting every species
 * render `undefined` until someone notices.
 */
const REQUIRED = [
  "SEQ",
  "common_name",
  "scientific_name",
  "avilist_common_name",
  "avilist_scientific_name",
  "avilist_sort",
  "avibase_id",
  "birdlife_url",
  "IUCN",
  "ebird",
  "kbm",
  "flag",
  "endemic",
  "afrotropical",
  "palearctic",
  "waterbird",
  "nb_lkgd",
  "per_lkgd",
  "nb_lkgd_gc",
  "per_lkgd_gc",
];

if (!fs.existsSync(SRC_DIR)) {
  console.error(
    `Cannot find ${path.resolve(SRC_DIR)}\n` +
      `Set KAC to where Rafnuss/KenyaAtlasComparison is checked out, e.g.\n` +
      `  KAC=~/GitHub/KenyaAtlasComparison npm run sync:data`
  );
  process.exit(1);
}

const missingFiles = FILES.filter((f) => !fs.existsSync(path.join(SRC_DIR, f)));
if (missingFiles.length) {
  console.error(
    `Missing in ${SRC_DIR}: ${missingFiles.join(", ")}\n` +
      `Run A_import_old_atlas.m then E_export_website.m in that repository first.`
  );
  process.exit(1);
}

const spBase = JSON.parse(fs.readFileSync(path.join(SRC_DIR, "sp_base.json"), "utf8"));
const missingCols = REQUIRED.filter((c) => !(c in spBase[0]));
if (missingCols.length) {
  console.error(
    `sp_base.json is missing columns the app reads: ${missingCols.join(", ")}\n` +
      `Check the export in E_export_website.m against the contract in README.md.`
  );
  process.exit(1);
}

for (const f of FILES) {
  fs.copyFileSync(path.join(SRC_DIR, f), path.join(OUT_DIR, f));
  const kb = (fs.statSync(path.join(OUT_DIR, f)).size / 1024).toFixed(0);
  console.log(`${f} -> ${OUT_DIR}/${f} (${kb} kB)`);
}
console.log(`${spBase.length} species, ${REQUIRED.length} required columns present.`);
