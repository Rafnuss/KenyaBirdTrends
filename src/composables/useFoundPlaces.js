import { circleMarker, layerGroup, rectangle } from "leaflet";
import { watch } from "vue";

import { state } from "../store";
import { FOUND_CATEGORY, foundPlaces, personLabel } from "./useFound";

/** Half a pentad (5′) in degrees. */
const HALF_PENTAD = 2.5 / 60;
const MAX_POPUP_ROWS = 25;
/** Own pane above the squares, so the places stay clickable on a selected square. */
const PANE = "foundPlaces";

const escape = (text) =>
  String(text ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
const link = (url, text) =>
  url
    ? `<a href="${escape(url)}" target="_blank" rel="noopener">${escape(text)}</a>`
    : escape(text);

function popupHtml(place) {
  const head = place.pentad
    ? `KBM pentad ${escape(place.pentad)}`
    : `eBird checklist location (${place.lat.toFixed(4)}, ${place.lng.toFixed(4)})`;
  const rows = place.items.slice(0, MAX_POPUP_ROWS).map(({ unit, date, observer }) => {
    const who = link(observer.url, personLabel(observer.name));
    return `<tr><td><b>${escape(unit.common_name)}</b></td><td class="text-nowrap">${link(observer.checklist, date)}</td><td>${who}</td></tr>`;
  });
  const more =
    place.items.length > MAX_POPUP_ROWS
      ? `<div class="text-muted">and ${place.items.length - MAX_POPUP_ROWS} more</div>`
      : "";
  return `<div class="small"><div class="text-muted mb-1">${head}</div><table class="table table-sm small mb-0">${rows.join("")}</table>${more}</div>`;
}

/**
 * Lost & Found: where the finds of the current category were made inside the
 * selected squares. An eBird checklist is a dot at its start point; a KBM
 * card is its pentad. Size grows with the number of species.
 */
export function useFoundPlaces() {
  /** @type {import("leaflet").LayerGroup | null} */
  let group = null;

  function sync() {
    if (!group) return;
    group.clearLayers();
    if (state.mode !== "Found") return;
    const color = FOUND_CATEGORY[state.foundView].color;
    for (const place of foundPlaces.value) {
      const n = place.items.length;
      const label = `${n} species ${FOUND_CATEGORY[state.foundView].label}`;
      const layer = place.pentad
        ? rectangle(
            [
              [place.lat - HALF_PENTAD, place.lng - HALF_PENTAD],
              [place.lat + HALF_PENTAD, place.lng + HALF_PENTAD],
            ],
            { pane: PANE, color, weight: 2, dashArray: "4 3", fillColor: color, fillOpacity: 0.25 }
          )
        : circleMarker([place.lat, place.lng], {
            pane: PANE,
            radius: Math.min(4 + 1.5 * Math.sqrt(n), 12),
            color: "#ffffff",
            weight: 1.5,
            fillColor: color,
            fillOpacity: 0.95,
          });
      layer.bindTooltip(`${label} · ${place.pentad ? "KBM pentad" : "eBird"}`);
      layer.bindPopup(() => popupHtml(place), { maxWidth: 360, maxHeight: 300 });
      group.addLayer(layer);
    }
  }

  function attach(map) {
    if (!map.getPane(PANE)) map.createPane(PANE).style.zIndex = 450;
    group = layerGroup().addTo(map);
    sync();
  }

  watch([foundPlaces, () => state.mode], sync);

  return { attach };
}
