import { gridGeojson, mapData } from "../store";

const COLORS = { lost: "#d73027", kept: "#fee08b", gained: "#45aa59", absent: "#777777" };
const MAP = { x: 38, y: 38, width: 940, height: 1018, west: 32.94, east: 42.46, north: 5.05, south: -4.95 };
const TILE_TOKEN = "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g";

export function speciesMapMark(properties, id) {
  const old = properties.taxa_old.includes(id);
  const modern = properties.taxa_new.includes(id);
  if (!old && !modern && properties.mask) return null;
  const category = old && modern ? "kept" : old ? "lost" : modern ? "gained" : "absent";
  const direction = category === "lost" || category === "absent" ? -1 : 1;
  const scaled = direction * Math.sign(properties.corr) * Math.min(Math.sqrt(Math.abs(properties.corr)) / Math.sqrt(0.7), 1);
  return {
    category,
    radius: properties.mask ? 7000 : ((scaled + 1) / 2) * 20000 + 10000,
    opacity: properties.mask ? 0.4 : category === "absent" ? 0.2 : 0.9,
  };
}

function drawPolygon(ctx, rings, project) {
  ctx.beginPath();
  for (const ring of rings) {
    ring.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  }
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    const timeout = setTimeout(() => resolve(null), 8000);
    image.onload = () => { clearTimeout(timeout); resolve(image); };
    image.onerror = () => { clearTimeout(timeout); resolve(null); };
    image.src = src;
  });
}

function mercator(lon, lat, zoom) {
  const size = 256 * 2 ** zoom;
  const sin = Math.sin(lat * Math.PI / 180);
  return [(lon + 180) / 360 * size, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size];
}

/** Render a fresh PNG from the same atlas and recent records used by the map. */
export async function downloadSpeciesMap(species) {
  const zoom = 7;
  const [west, north] = mercator(MAP.west, MAP.north, zoom);
  const [east, south] = mercator(MAP.east, MAP.south, zoom);
  const tiles = [];
  for (let x = Math.floor(west / 256); x <= Math.floor(east / 256); x++) {
    for (let y = Math.floor(north / 256); y <= Math.floor(south / 256); y++) {
      tiles.push({ x, y, url: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/${zoom}/${x}/${y}?access_token=${TILE_TOKEN}` });
    }
  }
  const [countyModule, ...images] = await Promise.all([
    import("../assets/county.json"),
    ...tiles.map((tile) => loadImage(tile.url)),
    ...["logo_tba.png", "logo_ark.png", "logo_museums.png", "logo_kbm.png", "logo_ebird.svg"].map((name) => loadImage(`${import.meta.env.BASE_URL}${name}`)),
  ]);
  const tileImages = images.slice(0, tiles.length);
  const logos = images.slice(tiles.length);
  const hasTerrain = tileImages.every(Boolean);
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 1120;
  const ctx = canvas.getContext("2d");
  const project = (lon, lat) => {
    const [x, y] = mercator(lon, lat, zoom);
    return [MAP.x + (x - west) * MAP.width / (east - west), MAP.y + (y - north) * MAP.height / (south - north)];
  };

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e7f1f5";
  ctx.fillRect(MAP.x, MAP.y, MAP.width, MAP.height);
  ctx.save();
  ctx.beginPath();
  ctx.rect(MAP.x, MAP.y, MAP.width, MAP.height);
  ctx.clip();
  const sx = MAP.width / (east - west);
  const sy = MAP.height / (south - north);
  tileImages.forEach((image, i) => {
    if (hasTerrain) ctx.drawImage(image, MAP.x + (tiles[i].x * 256 - west) * sx, MAP.y + (tiles[i].y * 256 - north) * sy, 256 * sx + 1, 256 * sy + 1);
  });
  ctx.fillStyle = hasTerrain ? "rgba(255,255,255,0.10)" : "#eef1df";
  ctx.strokeStyle = hasTerrain ? "rgba(70,85,75,0.20)" : "#c2cdbd";
  ctx.lineWidth = 0.8;
  for (const feature of countyModule.default.features) {
    const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const polygon of polygons) {
      drawPolygon(ctx, polygon, project);
      ctx.fill("evenodd");
      ctx.stroke();
    }
  }
  ctx.strokeStyle = "rgba(70,85,80,0.20)";
  ctx.lineWidth = 0.7;
  for (const feature of gridGeojson.features) {
    drawPolygon(ctx, feature.geometry.coordinates, project);
    ctx.stroke();
  }
  for (const { geometry, properties } of mapData) {
    if (properties.cov_old === "0" && properties.cov_new === 0) continue;
    const mark = speciesMapMark(properties, species.avibase_id);
    if (!mark) continue;
    const [x, y] = project(geometry.coordinates[1], geometry.coordinates[0]);
    const radius = mark.radius * MAP.width / ((MAP.east - MAP.west) * 111000);
    ctx.globalAlpha = mark.opacity;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[mark.category];
    ctx.fill();
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "#324346";
  ctx.lineWidth = 2;
  ctx.strokeRect(MAP.x, MAP.y, MAP.width, MAP.height);
  if (hasTerrain) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(MAP.x + 4, MAP.y + 4, 298, 23);
    ctx.fillStyle = "#425455";
    ctx.font = "13px sans-serif";
    ctx.fillText("© Mapbox  © OpenStreetMap", MAP.x + 10, MAP.y + 20);
  }

  // The atlas map sits beside a compact, self-contained interpretation guide.
  ctx.fillStyle = "#1d393d";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("KENYA BIRD TRENDS", 1015, 68);
  ctx.fillStyle = "#243b40";
  ctx.font = "bold 35px sans-serif";
  ctx.fillText(species.common_name || "Species distribution", 1015, 126, 740);
  ctx.font = "italic 24px sans-serif";
  ctx.fillStyle = "#506367";
  ctx.fillText(species.scientific_name || "", 1015, 160, 740);
  ctx.fillStyle = "#344649";
  ctx.font = "21px sans-serif";
  ctx.fillText("Change in recorded distribution across Kenya", 1015, 220);
  ctx.fillText("Historical atlas 1970–1984  →  Recent records 2009–2023", 1015, 252, 740);
  ctx.font = "italic 19px sans-serif";
  ctx.fillText("Presence-only data; not a measure of abundance.", 1015, 286);

  ctx.fillStyle = "#f7f9f7";
  ctx.fillRect(1015, 330, 745, 380);
  ctx.strokeStyle = "#dce6df";
  ctx.lineWidth = 1;
  ctx.strokeRect(1015, 330, 745, 380);
  ctx.fillStyle = "#1d393d";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("How to read the map", 1045, 376);
  const legend = [
    ["gained", "Gained", "Recorded in the recent period only"],
    ["kept", "Kept", "Recorded in both periods"],
    ["lost", "Lost", "Recorded in the historical atlas only"],
    ["absent", "Not recorded", "No records in either period"],
  ];
  legend.forEach(([category, title, description], i) => {
    const x = 1070 + (i % 2) * 355;
    const y = 430 + Math.floor(i / 2) * 102;
    ctx.globalAlpha = category === "absent" ? 0.5 : 1;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[category];
    ctx.fill();
    ctx.strokeStyle = "#445455";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#233c40";
    ctx.font = "bold 21px sans-serif";
    ctx.fillText(title, x + 31, y - 5);
    ctx.fillStyle = "#536367";
    ctx.font = "17px sans-serif";
    ctx.fillText(description, x + 31, y + 19, 300);
  });
  ctx.fillStyle = "#536367";
  ctx.font = "18px sans-serif";
  ctx.fillText("Circle size reflects the effort correction. Faded circles indicate", 1045, 651);
  ctx.fillText("poor coverage; interpret them with care.", 1045, 678);

  ctx.fillStyle = "#1d393d";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("Data sources", 1015, 765);
  ctx.fillStyle = "#44575a";
  ctx.font = "19px sans-serif";
  ctx.fillText("1970–1984  ·  A Bird Atlas of Kenya (Lewis & Pomeroy, 1989)", 1015, 798);
  ctx.fillText("2009–2023  ·  Kenya Bird Map and eBird", 1015, 828);
  ctx.strokeStyle = "#dce6df";
  ctx.beginPath();
  ctx.moveTo(1015, 860);
  ctx.lineTo(1760, 860);
  ctx.stroke();
  const logoWidths = [115, 125, 105, 110, 120];
  let logoX = 1025;
  logos.forEach((logo, i) => {
    if (logo) {
      const scale = Math.min(logoWidths[i] / logo.width, 60 / logo.height);
      ctx.drawImage(logo, logoX, 888 + (60 - logo.height * scale) / 2, logo.width * scale, logo.height * scale);
    }
    logoX += logoWidths[i] + 24;
  });
  ctx.fillStyle = "#1d393d";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("kenyabirdtrends.co.ke", 1015, 1015);
  ctx.fillStyle = "#6b7b7d";
  ctx.font = "15px sans-serif";
  ctx.fillText("Nussbaumer et al. (2024), Diversity and Distributions, doi:10.1111/ddi.13935", 1015, 1044, 745);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kenya-bird-trends-${species.SEQ}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
