/**
 * Import a bird-atlas latest_by_qdgc run as the Lost & Found asset.
 *
 * bird-atlas (scripts/shared/latest_by_qdgc.py) writes, per QDGC level-1 cell
 * and eBird species, the last record before 2009, whether it was recorded in
 * 2009–2023, and the first record since 2024 with everyone who made it. This
 * script maps cells to atlas squares (src/utils/squares.js), species to the
 * site's comparison concepts (sp_base.json `ebird` codes) and writes
 * src/assets/found.json. See src/utils/foundData.js.
 *
 * Run with: npm run import:found -- ../bird-atlas/data/prepared/latest_by_qdgc/<run-id>
 */
import fs from "node:fs";
import path from "node:path";

import { buildFoundAsset } from "../src/utils/foundData.js";

const RUN_DIR = process.argv[2];
const OUT = "src/assets/found.json";

if (!RUN_DIR || !fs.existsSync(path.join(RUN_DIR, "finders.csv"))) {
  console.error("Usage: npm run import:found -- <bird-atlas latest_by_qdgc run directory>");
  process.exit(1);
}

/** Minimal RFC 4180 reader: quoted fields, doubled quotes, commas and newlines. */
function readCsv(file) {
  const text = fs.readFileSync(file, "utf8");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') field += text[i++];
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") (row.push(field), (field = ""));
    else if (c === "\n") (row.push(field), rows.push(row), (row = []), (field = ""));
    else if (c !== "\r") field += c;
  }
  if (field || row.length) (row.push(field), rows.push(row));
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = readJson(path.join(RUN_DIR, "manifest.json"));
if (manifest.qdgc_level !== 1) throw new Error(`Expected QDGC level 1, got ${manifest.qdgc_level}`);

const { asset, counts, outside } = buildFoundAsset({
  grid: readJson("src/assets/grid.json"),
  mapData: readJson("src/assets/map_data.json"),
  spBase: readJson("src/assets/sp_base.json"),
  latest: readCsv(path.join(RUN_DIR, "latest.csv")),
  finders: readCsv(path.join(RUN_DIR, "finders.csv")),
  species: readCsv(path.join(RUN_DIR, "species.csv")),
  manifest,
});
fs.writeFileSync(OUT, JSON.stringify(asset));

console.log(
  `Wrote ${OUT} (${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB): ` +
    `${counts.targets} targets still to find, ${counts.refound} re-found, ${counts.new} new; ` +
    `${asset.people.length} people, ${Object.keys(asset.standalone).length} species without a concept.`
);
console.log(
  `Kenya as one area: ${counts.country.r} species re-found, ${counts.country.n} new, ` +
    `${counts.country.t} still to find.`
);
if (outside.length)
  console.log(
    `${outside.length} cells outside the atlas squares count for Kenya only: ${outside.join(" ")}`
  );
