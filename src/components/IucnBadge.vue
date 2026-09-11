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
  iucnId: { type: [Number, String], default: null },
  /** When false, render the icon without the IUCN link. */
  link: { type: Boolean, default: true },
  /** When true, render any known category rather than only the badged ones. */
  always: { type: Boolean, default: false },
});

const src = ICONS[props.category];
const visible = props.always ? Boolean(src) : BADGED.includes(props.category);
const href = `https://apiv3.iucnredlist.org/api/v3/taxonredirect/${props.iucnId}`;
</script>

<template>
  <a v-if="visible && link" class="iucn-badge" :href="href" target="_blank" title="IUCN page">
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
