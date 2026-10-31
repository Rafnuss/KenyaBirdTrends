<script setup>
import iucn_CR from "../assets/iucn_CR.png";
import iucn_VU from "../assets/iucn_VU.png";
import iucn_DD from "../assets/iucn_DD.png";
import iucn_EN from "../assets/iucn_EN.png";
import iucn_NT from "../assets/iucn_NT.png";
import iucn_LC from "../assets/iucn_LC.png";

const ICONS = {
  "Critically Endangered": iucn_CR,
  Endangered: iucn_EN,
  "Near Threatened": iucn_NT,
  "Least Concern": iucn_LC,
  "Data Deficient": iucn_DD,
  Vulnerable: iucn_VU,
};

/** Only these categories were ever badged in the lists. */
const BADGED = ["Critically Endangered", "Data Deficient", "Endangered", "Vulnerable"];

const props = defineProps({
  category: { type: String, default: null },
  /**
   * AviList's BirdLife DataZone factsheet URL for this species, or null.
   *
   * Replaced the numeric IUCNID this used to build an
   * apiv3.iucnredlist.org/taxonredirect link from (2026-09): that id was
   * frozen at whatever vintage it was last hand-entered, while this URL comes
   * from the same AviList pass that resolves the species' Red List category.
   * It is null for a lumped concept, which has no single factsheet to point
   * at - so the badge renders unlinked rather than pointing somewhere wrong.
   */
  birdlifeUrl: { type: String, default: null },
  /** When false, render the icon without the link. */
  link: { type: Boolean, default: true },
  /** When true, render any known category rather than only the badged ones. */
  always: { type: Boolean, default: false },
});

const src = ICONS[props.category];
const visible = props.always ? Boolean(src) : BADGED.includes(props.category);
</script>

<template>
  <a
    v-if="visible && link && birdlifeUrl"
    class="iucn-badge"
    :href="birdlifeUrl"
    target="_blank"
    title="BirdLife species factsheet"
  >
    <img :src="src" :alt="category" />
  </a>
  <span v-else-if="visible" class="iucn-badge">
    <img :src="src" :alt="category" />
  </span>
</template>

<style scoped>
.iucn-badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 1;
}
.iucn-badge img {
  width: 1rem;
  height: 1rem;
}
</style>
