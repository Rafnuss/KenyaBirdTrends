const numberFormat = new Intl.NumberFormat("en-GB");

/** 13530 -> "13,530" */
export function formatNumber(value) {
  return numberFormat.format(value ?? 0);
}
