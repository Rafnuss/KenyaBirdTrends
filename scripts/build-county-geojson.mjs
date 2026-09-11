/**
 * Reduce the county outlines to something proportionate to how they are used.
 *
 * `data/county.raw.json` is the survey-grade source: 47 features, 183k points,
 * coordinates carried to 15 decimal places (nanometres). The app draws it as a
 * 1.2px outline over a whole-country map, so almost all of that is invisible.
 *
 * Run with: npm run build:county
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "data/county.raw.json";
const OUT = "src/assets/county.json";

/** ~110 m at the equator: well under one screen pixel at the zooms used. */
const TOLERANCE = 0.001;
/** 5 decimals is ~1 m; anything finer is noise for an outline. */
const PRECISION = 5;

const round = (n) => Number(n.toFixed(PRECISION));

/** Perpendicular distance from p to the line ab. */
function distance(p, a, b) {
  let [x, y] = [a[0], a[1]];
  let [dx, dy] = [b[0] - x, b[1] - y];
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = b;
    else if (t > 0) [x, y] = [x + dx * t, y + dy * t];
  }
  return Math.hypot(p[0] - x, p[1] - y);
}

/** Douglas-Peucker, iterative to stay clear of the call stack on long rings. */
function simplifyLine(points, tolerance) {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let index = -1;
    let maxDistance = tolerance;
    for (let i = first + 1; i < last; i++) {
      const d = distance(points[i], points[first], points[last]);
      if (d > maxDistance) {
        maxDistance = d;
        index = i;
      }
    }
    if (index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** A ring must stay closed and needs 4 points to remain a polygon. */
function simplifyRing(ring, tolerance) {
  let out = simplifyLine(ring, tolerance);
  if (out.length < 4) out = ring.length <= 4 ? ring : [ring[0], ring[1], ring[2], ring[0]];
  const [first, last] = [out[0], out[out.length - 1]];
  if (first[0] !== last[0] || first[1] !== last[1]) out = [...out, first];
  return out.map((p) => [round(p[0]), round(p[1])]);
}

function simplifyCoords(coords, depth) {
  // Recurse until we reach a ring (an array of [x, y] pairs).
  if (Array.isArray(coords[0]?.[0])) return coords.map((c) => simplifyCoords(c, depth + 1));
  return simplifyRing(coords, TOLERANCE);
}

const countPoints = (c) =>
  typeof c[0] === "number" ? 1 : c.reduce((total, x) => total + countPoints(x), 0);

const source = JSON.parse(fs.readFileSync(SRC, "utf8"));
const before = source.features.reduce((n, f) => n + countPoints(f.geometry.coordinates), 0);

const output = {
  type: "FeatureCollection",
  features: source.features.map((f) => ({
    type: "Feature",
    // The layer is outline-only; none of the survey attributes are read.
    properties: { county: f.properties.COUNTY ?? null },
    geometry: {
      type: f.geometry.type,
      coordinates: simplifyCoords(f.geometry.coordinates, 0),
    },
  })),
};

const after = output.features.reduce((n, f) => n + countPoints(f.geometry.coordinates), 0);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output));

const kb = (p) => (fs.statSync(p).size / 1024).toFixed(0);
console.log(`points  ${before.toLocaleString()} -> ${after.toLocaleString()}`);
console.log(`size    ${kb(SRC)} kB -> ${kb(OUT)} kB`);
