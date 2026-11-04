<script setup>
import { computed, ref } from "vue";

import AppIcon from "./AppIcon.vue";
import BaseModal from "./BaseModal.vue";
import {
  FOUND_CATEGORIES,
  FOUND_CATEGORY,
  foundLists,
  foundTotals,
  foundYears,
  isUnnamed,
  leaderboard,
  personLabel,
  sourceLabel,
} from "../composables/useFound";
import { clearSquares, spBase, state } from "../store";
import { formatNumber } from "../utils/format";

const emit = defineEmits(["locate"]);

const foundFrom = computed(() => state.found?.meta?.found_from?.slice(0, 4) ?? "2024");
const histBefore = computed(() => state.found?.meta?.historical_before?.slice(0, 4) ?? "2009");
const showInfo = ref(false);
const category = computed(() => FOUND_CATEGORY[state.foundView]);
const list = computed(() => foundLists.value[state.foundView]);

/** Species table: taxonomic order, or date (first record, or last seen for targets). */
const sort = ref({ key: "date", desc: true });
function sortBy(key) {
  sort.value =
    sort.value.key === key ? { key, desc: !sort.value.desc } : { key, desc: key === "date" }; // newest first; taxonomy from the top
}
const sortColumns = computed(() =>
  state.foundView === "t"
    ? [
        { key: "sp", label: "Species", sort: "taxonomy" },
        { key: "date", label: "Last seen", sort: "date", class: "text-end" },
      ]
    : [
        { key: "sp", label: "Species", sort: "taxonomy" },
        { key: "date", label: "First record", sort: "date" },
        { key: "who", label: "Birder" },
      ]
);
/** Old-atlas-only targets have no date: they sort as the oldest. */
const dateOf = (item) => item.date ?? item.lastSeen?.date ?? "";
const sortedList = computed(() => {
  const { key, desc } = sort.value;
  const byTaxonomy = (a, b) => a.unit.sort - b.unit.sort;
  const byDate = (a, b) => (dateOf(a) < dateOf(b) ? -1 : dateOf(a) > dateOf(b) ? 1 : 0);
  const compare = key === "taxonomy" ? byTaxonomy : byDate;
  return [...list.value].sort((a, b) => (desc ? -1 : 1) * compare(a, b) || byTaxonomy(a, b));
});

const TABS = ["Birders", "Species"];
const LEADERBOARD_SIZE = 100;
const MEDALS = ["gold", "silver", "bronze"];

/** Standard competition ranking: equal totals share a rank (1, 2, 2, 4). */
/** Birders ranked by total points, re-found or new (always highest first). */
const birderSort = ref("points");
const BIRDER_COLUMNS = [
  { key: "r", label: "Re-found", color: FOUND_CATEGORY.r.color },
  { key: "n", label: "New", color: FOUND_CATEGORY.n.color },
  { key: "points", label: "Total" },
];
const ranked = computed(() => {
  const key = birderSort.value;
  const sorted = [...leaderboard.value].sort(
    (a, b) => b[key] - a[key] || b.points - a.points || a.name.localeCompare(b.name)
  );
  let rank = 0;
  return sorted
    .filter((p) => p[key] > 0)
    .slice(0, LEADERBOARD_SIZE)
    .map((p, i, all) => {
      if (i === 0 || p[key] !== all[i - 1][key]) rank = i + 1;
      return { ...p, rank, medal: MEDALS[rank - 1] };
    });
});

/**
 * The Species page for a unit: its map of lost, kept and gained squares.
 * eBird species without a comparison concept have no such page.
 */
const seqOf = new Map(spBase.map((s) => [s.avibase_id, s.SEQ]));
function speciesHref(unit) {
  const seq = !unit.standalone && seqOf.get(unit.avibase_id);
  return seq ? `?mode=Species&species=${seq}` : null;
}
/** Switch page in place, keeping the map where it is; modified clicks open a new tab. */
function openSpecies(event, unit) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
  event.preventDefault();
  state.speciesId = unit.avibase_id;
  state.mode = "Species";
}

/** Year of the last record before the recent period; the link says where it is from. */
function lastSeenLabel(lastSeen) {
  return lastSeen ? lastSeen.date.slice(0, 4) : "old atlas";
}
function lastSeenTitle(lastSeen) {
  return lastSeen
    ? `${sourceLabel(lastSeen.source)} record, ${lastSeen.date}`
    : "Only in the old atlas";
}
function othersLabel(others) {
  return others.map((o) => personLabel(o.name)).join(", ");
}
</script>

<template>
  <div class="d-flex flex-column h-100 px-2">
    <div v-if="!state.found" class="text-center text-muted my-5">Loading…</div>

    <template v-else>
      <!-- Area, period and help. -->
      <div class="d-flex align-items-center gap-1 mt-2 mb-2 small">
        <template v-if="state.grid.length">
          <span class="text-muted">Square</span>
          <span v-for="g in state.grid" :key="g" class="badge text-bg-primary">{{ g }}</span>
          <button
            type="button"
            class="badge text-bg-danger border-0"
            aria-label="Back to all of Kenya"
            title="Back to all of Kenya"
            @click="clearSquares()"
          >
            <AppIcon name="trash-fill" />
          </button>
        </template>
        <template v-else>
          <span class="fw-semibold">All of Kenya</span>
          <button
            type="button"
            class="btn btn-link btn-sm p-0"
            aria-label="Select the square at my location"
            title="Select the square at my location"
            @click="emit('locate')"
          >
            <AppIcon name="geo-alt-fill" />
          </button>
        </template>

        <label class="visually-hidden" for="found-year">Period</label>
        <select
          id="found-year"
          v-model="state.foundYear"
          class="form-select form-select-sm ms-auto found-year"
        >
          <option value="all">Since {{ foundFrom }}</option>
          <option v-for="y in foundYears" :key="y" :value="y">{{ y }}</option>
        </select>
        <button
          type="button"
          class="btn btn-link btn-sm p-0 info-btn"
          aria-label="How Lost & Found works"
          @click="showInfo = true"
        >
          <AppIcon name="info-circle-fill" size="1.1rem" />
        </button>
      </div>

      <!-- Categories: each sets what the map and the species list show. -->
      <div class="d-flex gap-1 mb-2" role="group" aria-label="Category shown on the map">
        <button
          v-for="c in FOUND_CATEGORIES"
          :key="c.key"
          type="button"
          class="found-cat flex-fill"
          :class="{ active: state.foundView === c.key }"
          :style="{ '--cat': c.color }"
          :aria-pressed="state.foundView === c.key"
          @click="state.foundView = c.key"
        >
          <span class="found-cat-count">{{ formatNumber(foundTotals[c.key]) }}</span>
          <span class="found-cat-label">{{ c.label }}</span>
        </button>
      </div>

      <ul class="nav nav-tabs mb-2">
        <li v-for="tab in TABS" :key="tab" class="nav-item">
          <a
            class="nav-link py-1"
            :class="{ active: state.foundTab === tab }"
            href="#"
            @click.prevent="state.foundTab = tab"
            >{{ tab }}</a
          >
        </li>
      </ul>

      <!-- Birders ------------------------------------------------------------ -->
      <div v-if="state.foundTab === 'Birders'" class="flex-grow-1 overflow-auto mb-2">
        <p v-if="ranked.length === 0" class="text-muted small">No finds in this period yet.</p>
        <table v-else class="table table-sm table-hover small align-middle mb-0 birders">
          <thead>
            <tr>
              <th class="text-end">#</th>
              <th>Birder</th>
              <th
                v-for="col in BIRDER_COLUMNS"
                :key="col.key"
                class="text-end"
                :class="col.key === 'points' ? 'col-total' : 'col-minor'"
                :aria-sort="birderSort === col.key ? 'descending' : 'none'"
              >
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 sort-btn"
                  :style="{ color: col.color }"
                  :title="`Rank by ${col.label.toLowerCase()}`"
                  @click="birderSort = col.key"
                >
                  {{ col.label }}
                  <AppIcon name="caret-down-fill" :class="{ invisible: birderSort !== col.key }" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in ranked" :key="p.person" :class="p.medal && `medal medal-${p.medal}`">
              <td class="text-end">
                <span v-if="p.medal" class="medal-badge">{{ p.rank }}</span>
                <span v-else class="text-muted">{{ p.rank }}</span>
              </td>
              <td class="text-truncate birder-name">
                <a
                  v-if="p.url"
                  :href="p.url"
                  target="_blank"
                  rel="noopener"
                  :class="{ 'text-muted': isUnnamed(p.name) }"
                  >{{ personLabel(p.name) }}</a
                >
                <span v-else>{{ personLabel(p.name) }}</span>
              </td>
              <td
                class="text-end col-minor"
                :class="{ 'fw-bold': birderSort === 'r' }"
                :style="{ color: FOUND_CATEGORY.r.color }"
              >
                {{ p.r }}
              </td>
              <td
                class="text-end col-minor"
                :class="{ 'fw-bold': birderSort === 'n' }"
                :style="{ color: FOUND_CATEGORY.n.color }"
              >
                {{ p.n }}
              </td>
              <td class="text-end col-total">{{ p.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Species ------------------------------------------------------------ -->
      <template v-else>
        <div class="small mb-1">
          <b :style="{ color: category.color }">{{ category.title }} ({{ list.length }})</b>
        </div>

        <div class="flex-grow-1 overflow-auto mb-2">
          <table class="table table-sm table-hover small align-middle mb-0 species-table">
            <thead>
              <tr>
                <th v-for="col in sortColumns" :key="col.key" :class="col.class">
                  <button
                    v-if="col.sort"
                    type="button"
                    class="btn btn-link btn-sm p-0 sort-btn"
                    :aria-sort="
                      sort.key === col.sort ? (sort.desc ? 'descending' : 'ascending') : 'none'
                    "
                    @click="sortBy(col.sort)"
                  >
                    {{ col.label }}
                    <AppIcon
                      :name="
                        sort.key === col.sort && sort.desc ? 'caret-down-fill' : 'caret-up-fill'
                      "
                      :class="{ invisible: sort.key !== col.sort }"
                    />
                  </button>
                  <template v-else>{{ col.label }}</template>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sortedList.length === 0">
                <td :colspan="sortColumns.length" class="text-muted">None.</td>
              </tr>
              <tr v-for="item in sortedList" :key="item.sq + item.unit.avibase_id">
                <td
                  class="text-truncate fw-semibold species-name"
                  :title="
                    [
                      item.unit.scientific_name,
                      state.foundView === 'r' && `last seen ${lastSeenLabel(item.lastSeen)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  "
                >
                  <a
                    v-if="speciesHref(item.unit)"
                    :href="speciesHref(item.unit)"
                    class="link-body-emphasis"
                    @click="openSpecies($event, item.unit)"
                    >{{ item.unit.common_name }}</a
                  >
                  <template v-else>{{ item.unit.common_name }}</template>
                </td>

                <td v-if="state.foundView === 't'" class="text-end text-nowrap">
                  <a
                    v-if="item.lastSeen?.url"
                    :href="item.lastSeen.url"
                    :title="lastSeenTitle(item.lastSeen)"
                    target="_blank"
                    rel="noopener"
                    >{{ lastSeenLabel(item.lastSeen) }}</a
                  >
                  <span v-else class="text-muted" :title="lastSeenTitle(item.lastSeen)">{{
                    lastSeenLabel(item.lastSeen)
                  }}</span>
                </td>

                <template v-else>
                  <td class="text-nowrap">
                    <a
                      v-if="item.observer?.checklist"
                      :href="item.observer.checklist"
                      target="_blank"
                      rel="noopener"
                      >{{ item.date }}</a
                    >
                    <span v-else :title="`KBM card ${item.observer?.id}`">{{ item.date }}</span>
                  </td>
                  <td class="text-truncate text-muted birder-cell">
                    <a
                      v-if="item.observer?.url"
                      :href="item.observer.url"
                      target="_blank"
                      rel="noopener"
                      class="link-secondary"
                      >{{ personLabel(item.observer.name) }}</a
                    >
                    <template v-else>{{ personLabel(item.observer?.name) }}</template>
                    <span
                      v-if="item.others.length"
                      v-tooltip="`Also: ${othersLabel(item.others)}`"
                      class="ms-1"
                      >+{{ item.others.length }}</span
                    >
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <BaseModal v-model="showInfo" title="How Lost & Found works">
        <p>
          Lost &amp; Found compares what was recorded before {{ histBefore }} with what birders find
          now, in each atlas square and in Kenya as a whole. Records come from the old Kenya bird
          atlas (all periods), eBird and Kenya Bird Map.
        </p>
        <dl class="mb-3">
          <dt :style="{ color: FOUND_CATEGORY.r.color }">Re-found</dt>
          <dd>
            Recorded in the area before {{ histBefore }}, not recorded at all in {{ histBefore }}–{{
              foundFrom - 1
            }}, and found again since {{ foundFrom }}.
          </dd>
          <dt :style="{ color: FOUND_CATEGORY.n.color }">New</dt>
          <dd>
            Never recorded in the area before {{ foundFrom }}, in any source, and found since
            {{ foundFrom }}.
          </dd>
          <dt :style="{ color: FOUND_CATEGORY.t.color }">Still to find</dt>
          <dd class="mb-0">Recorded in the area before {{ histBefore }} but not since.</dd>
        </dl>
        <p>
          <b>Area.</b> With no square selected, the numbers and the species list are for Kenya as
          one area: a species re-found in ten squares is one re-found species, and "new" means new
          to Kenya. Click a square on the map for its own lists; the map then also shows where each
          find was made (dots for eBird checklists, dashed squares for Kenya Bird Map pentads).
        </p>
        <p>
          <b>Birders.</b> One point for each species re-found or new in a square, to everyone who
          recorded it on the first date since {{ foundFrom }}. With a square selected, only its own
          finds count.
        </p>
        <p class="mb-0">
          <b>Period.</b> A year shows only the finds first made that year. "Still to find" is always
          today's list. Records need a precise location: eBird checklists longer than 10 km are not
          used to place a species in a square.
        </p>
      </BaseModal>
    </template>
  </div>
</template>

<style scoped>
.found-cat {
  --cat: #6a6a6a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.25rem 0.25rem 0.2rem;
  border: 1px solid #e5e9ef;
  border-top: 3px solid var(--cat);
  border-radius: 0.375rem;
  background: #fff;
  line-height: 1.15;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}
.found-cat:hover {
  background: color-mix(in srgb, var(--cat) 6%, #fff);
}
.found-cat.active {
  border-color: var(--cat);
  background: color-mix(in srgb, var(--cat) 12%, #fff);
  box-shadow: 0 0 0 1px var(--cat);
}
.found-cat-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cat);
}
.found-cat-label {
  font-size: 0.8rem;
  color: #3a3a3a;
  white-space: nowrap;
}
.found-year {
  width: auto;
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
  font-size: 0.8rem;
}
.info-btn {
  color: #204e4a;
}

.birders th {
  white-space: nowrap;
  font-weight: 600;
}
/* Total is the number that matters; re-found and new are its breakdown. */
.birders .col-minor {
  font-size: 0.72rem;
  width: 3.6rem;
}
.birders td.col-minor {
  opacity: 0.85;
}
.birders .col-total {
  width: 3.4rem;
}
.birders td.col-total {
  font-size: 1rem;
  font-weight: 700;
  color: #204e4a;
}
.birder-name {
  max-width: 0;
  width: 60%;
}
/* Top three: taller rows tinted with their medal colour. */
.medal-gold {
  --medal: #c9a227;
  --medal-bg: #fbf3d5;
}
.medal-silver {
  --medal: #8f9aa6;
  --medal-bg: #eef1f4;
}
.medal-bronze {
  --medal: #b07142;
  --medal-bg: #f6e9df;
}
.medal > td {
  background: var(--medal-bg);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 0.95rem;
}
.medal > td:first-child {
  box-shadow: inset 3px 0 0 var(--medal);
}
.medal .birder-name {
  font-weight: 600;
}
.medal-badge {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--medal);
  color: #fff;
  font-weight: 700;
  line-height: 1.5rem;
  text-align: center;
}

.species-table {
  table-layout: fixed;
}
.species-table th {
  white-space: nowrap;
  font-weight: 600;
}
.species-table th:nth-child(1) {
  width: 50%;
}
.sort-btn {
  font-size: inherit;
  font-weight: 600;
  color: inherit;
  text-decoration: none;
}
.species-name,
.birder-cell {
  overflow: hidden;
}
a {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>
