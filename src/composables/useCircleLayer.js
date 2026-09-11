import chroma from "chroma-js";
import { circle as lCircle, layerGroup } from "leaflet";
import { computed, watch } from "vue";

import { mapData, state, toggleSquare } from "../store";

const GRID_COLOR_SCALE = chroma.scale("RdYlGn").domain([-200, 200]);

const TREND_COLORS = { kept: "#fee08b", lost: "#d73027", gained: "#45aa59", absent: "#000000" };

const RADIUS_MAX = 30000;
const RADIUS_MIN = 10000;
const RADIUS_MASKED = 7000;
/** Normalisation constant for the effort-change correction. */
const CORR_NORM = 0.7;

/**
 * Per-square circle styling for the current view.
 *
 * Pure by construction: it returns { Sq, style } rather than writing `style`
 * back onto `mapData`. The previous version mutated its own dependency, which
 * makes a Vue 3 computed invalidate itself.
 */
export const circleStyles = computed(() =>
  mapData
    .filter((f) => !(f.properties.cov_old == "0" && f.properties.cov_new == 0))
    .map((f) => {
      const p = f.properties;
      const style = { fillOpacity: 0.9, visible: true, color: "#2e2e2e", weight: 1 };
      let sizeDir = 1;

      if (state.mode === "Grid") {
        sizeDir = -1;
        style.fillColor = GRID_COLOR_SCALE(p.nb_lkgd[3]).hex();
        if (state.grid.length !== 0) {
          if (state.grid.includes(p.Sq)) {
            style.fillOpacity = 1;
          } else {
            style.fillOpacity = 0.4;
            if (p.mask && !state.displayPoorCoverage) style.visible = false;
          }
        }
      } else {
        const seq = state.speciesSeq;
        const isNew = p.SEQ_new.includes(seq);
        const isOld = p.SEQ_old.includes(seq);
        if (isOld && isNew) {
          style.fillColor = TREND_COLORS.kept;
        } else if (isOld) {
          style.fillColor = TREND_COLORS.lost;
          sizeDir = -1;
        } else if (isNew) {
          style.fillColor = TREND_COLORS.gained;
        } else {
          style.visible = state.displayNeverObserved ? !p.mask : false;
          style.fillColor = TREND_COLORS.absent;
          style.fillOpacity = 0.2;
          sizeDir = -1;
        }
        if (p.mask) {
          if (!state.displayPoorCoverage) style.visible = false;
          style.fillOpacity = 0.4;
        }
      }

      style.opacity = style.fillOpacity;

      const scaled =
        sizeDir *
        Math.sign(p.corr) *
        Math.min(Math.sqrt(Math.abs(p.corr)) / Math.sqrt(CORR_NORM), 1);
      style.radius = p.mask
        ? RADIUS_MASKED
        : ((scaled + 1) / 2) * (RADIUS_MAX - RADIUS_MIN) + RADIUS_MIN;

      return { Sq: p.Sq, style };
    })
);

/**
 * Renders the state.grid squares as plain Leaflet layers rather than ~215 Vue
 * components. The components cost ~19 ms per update against ~4 ms here, and
 * this also keeps the data layer independent of the @vue-leaflet wrapper.
 */
export function useCircleLayer() {
  /** @type {import("leaflet").LayerGroup | null} */
  let group = null;
  /** @type {Map<string, import("leaflet").Circle>} */
  const circles = new Map();

  function sync() {
    if (!group) return;
    const wanted = new Set();

    for (const { Sq, style } of circleStyles.value) {
      const layer = circles.get(Sq);
      if (!layer || !style.visible) continue;
      wanted.add(Sq);
      // Add before styling: Leaflet only computes a layer's _pxBounds once it
      // is projected onto the map, and setRadius/redraw needs them.
      if (!group.hasLayer(layer)) group.addLayer(layer);
      layer.setStyle({
        color: style.color,
        weight: style.weight,
        opacity: style.opacity,
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
      });
      layer.setRadius(style.radius);
    }

    for (const [Sq, layer] of circles) {
      if (!wanted.has(Sq) && group.hasLayer(layer)) group.removeLayer(layer);
    }
  }

  function attach(map) {
    group = layerGroup().addTo(map);
    circles.clear();
    for (const feature of mapData) {
      const layer = lCircle(feature.geometry.coordinates, {
        Sq: feature.properties.Sq,
        radius: 0,
      });
      layer.on("click", (e) => {
        if (state.mode === "Grid") toggleSquare(e.target.options.Sq);
      });
      circles.set(feature.properties.Sq, layer);
    }
    sync();
  }

  // Scoped to the calling component, so it is torn down with the map.
  watch(circleStyles, sync);

  return { attach };
}
