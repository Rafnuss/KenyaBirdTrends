/**
 * Columns dropped from the export: ratios, raw counts and per-source links.
 *
 * avibase_id is deliberately kept. It is the one stable identifier for the
 * concept a row refers to - names change between checklists and a lumped row
 * has no single binomial - so an exported list carrying it can be matched up
 * again unambiguously later.
 */
const OMIT = new Set([
  "birdlife_url",
  "per_lkgd",
  "per_lkgd_gc",
  "nb_lkgd",
  "nb_lkgd_gc",
  "sort",
  "kbm",
  "ebird",
  "SEQ",
]);

/**
 * 26 species carry a comma inside `flag`, which shifts every later column
 * unless the value is quoted.
 */
function escapeCell(value) {
  const str = value == null ? "" : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replaceAll('"', '""')}"` : str;
}

export function toCsv(rows) {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]).filter((k) => !OMIT.has(k));
  const lines = [keys.map(escapeCell).join(",")];
  for (const row of rows) lines.push(keys.map((k) => escapeCell(row[k])).join(","));
  return lines.join("\n") + "\n";
}

export function downloadCsv(filename, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportGridListCsv(rows, squares) {
  if (rows.length === 0) return;
  downloadCsv(`kenyabirdtrend_export_${squares.join("_")}.csv`, toCsv(rows));
}
