/**
 * Map the atlas squares (`Sq`, e.g. "51b") to standard extended QDGC codes.
 *
 * Every grid.json polygon is a 0.5° × 0.5° QDGC level-1 cell. The `Sq` letter
 * is that cell's quadrant letter in lower case (a NW, b NE, c SW, d SE); the
 * `Sq` number indexes the 1° cell, skipping cells outside the atlas, so it can
 * only be looked up, not computed. QDGC naming follows bird-atlas
 * (docs/spatial-grids.md): "E037N00B" is 37.5–38°E, 0.5–1°N.
 */

/** Level-1 QDGC code of the cell whose centre is (lat, lng). */
export function qdgcLevel1(lat, lng) {
  const x = Math.floor(lng);
  const y = Math.floor(lat);
  const ew = x >= 0 ? `E${String(x).padStart(3, "0")}` : `W${String(-x - 1).padStart(3, "0")}`;
  const ns = y >= 0 ? `N${String(y).padStart(2, "0")}` : `S${String(-y - 1).padStart(2, "0")}`;
  const north = lat - y >= 0.5;
  const east = lng - x >= 0.5;
  return ew + ns + (north ? (east ? "B" : "A") : east ? "D" : "C");
}

/** Bounds [west, south, east, north] of a polygon feature's outer ring. */
export function featureBounds(feature) {
  const ring = feature.geometry.coordinates[0];
  const lngs = ring.map((c) => c[0]);
  const lats = ring.map((c) => c[1]);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

/**
 * One row per square: { Sq, qdgc, feature_id, bounds }. Sq comes from
 * map_data.json, joined to the grid polygons by feature id.
 */
export function buildSquares(grid, mapData) {
  const sqById = new Map(mapData.features.map((f) => [f.id, f.properties.Sq]));
  return grid.features.map((feature) => {
    const bounds = featureBounds(feature);
    const [west, south, east, north] = bounds;
    return {
      Sq: sqById.get(feature.id),
      qdgc: qdgcLevel1((south + north) / 2, (west + east) / 2),
      feature_id: feature.id,
      bounds,
    };
  });
}
