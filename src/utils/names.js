/**
 * Display name of a birder from the free text observers enter on eBird and
 * Kenya Bird Map: drops web addresses, business taglines and guide titles,
 * and fixes ALL-CAPS or all-lowercase names. The raw name stays in the data.
 */

/** Where a tagline starts: "~", "|", " _ ", "(", " - " and web addresses. */
const TAGLINE = /\s*(?:~|\||\s_\s|\(|\s-\s|https?:\/\/|www\.).*$/i;
/** A domain glued to or after the name: " acme.com", "-acmebirding.co.za". */
const DOMAIN = /(?:\s|-)[a-z0-9]+(?:\.[a-z]{2,})+\S*/gi;
/** Trailing titles: "Tour Guide", "Freelance Birding Guide", "Guide". */
const TITLE = /\s+(?:freelance\s+)?(?:(?:tour|birding|bird|safari)\s+)?guide$/i;
/** Honorifics that are words, not initials, when written in capitals. */
const HONORIFIC = new Set(["MR", "MRS", "MS", "DR", "MNR", "PROF"]);

const capitalise = (word) =>
  word.replace(
    /(^|[-'])(\p{L})(\p{L}*)/gu,
    (_, sep, a, rest) => sep + a.toUpperCase() + rest.toLowerCase()
  );

function fixCase(name) {
  const letters = name.replace(/[^\p{L}]/gu, "");
  if (letters === letters.toLowerCase()) return name.split(" ").map(capitalise).join(" ");
  if (letters === letters.toUpperCase() && letters.length > 3) {
    // Keep initials ("AFJ", "CW", "KZN") in capitals; the rest become words.
    return name
      .split(" ")
      .map((w) => (w.length <= 3 && !HONORIFIC.has(w) ? w : capitalise(w)))
      .join(" ");
  }
  return name;
}

export function cleanName(raw) {
  const original = (raw ?? "").replace(/\s+/g, " ").trim();
  if (/^obsr\d+$/.test(original)) return original; // an eBird ID with no resolved name
  const name = original.replace(TAGLINE, "").replace(DOMAIN, "").replace(TITLE, "").trim();
  return fixCase(name || original);
}
