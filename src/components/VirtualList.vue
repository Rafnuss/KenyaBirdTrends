<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";

/**
 * Fixed-height windowed list.
 *
 * The species list is ~1065 rows and every row re-rendered on each selection
 * change, which dominated interaction cost. Rendering only the visible window
 * makes that independent of list length.
 *
 * Rows must therefore be a known, uniform height: the row template is expected
 * to keep its content on one line (see `.virtual-row`).
 */
const props = defineProps({
  items: { type: Array, required: true },
  itemHeight: { type: Number, default: 31 },
  /** Rows rendered beyond each edge, to cover fast scrolling. */
  overscan: { type: Number, default: 8 },
});

const viewport = useTemplateRef("viewport");
const scrollTop = ref(0);
const viewportHeight = ref(0);

let frame = null;
function onScroll() {
  // Coalesce scroll events to one update per frame.
  if (frame != null) return;
  frame = requestAnimationFrame(() => {
    frame = null;
    scrollTop.value = viewport.value?.scrollTop ?? 0;
  });
}

// The viewport height decides how many rows are in the window, and it changes
// with the sidebar, the collapsible filters and device rotation.
let observer = null;
onMounted(() => {
  viewportHeight.value = viewport.value?.clientHeight ?? 0;
  if (!viewport.value || typeof ResizeObserver === "undefined") return;
  observer = new ResizeObserver(() => {
    viewportHeight.value = viewport.value?.clientHeight ?? 0;
  });
  observer.observe(viewport.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  if (frame != null) cancelAnimationFrame(frame);
});

const totalHeight = computed(() => props.items.length * props.itemHeight);

const range = computed(() => {
  const first = Math.floor(scrollTop.value / props.itemHeight);
  const visible = Math.ceil((viewportHeight.value || 400) / props.itemHeight);
  const start = Math.max(0, first - props.overscan);
  const end = Math.min(props.items.length, first + visible + props.overscan);
  return { start, end };
});

const windowed = computed(() =>
  props.items.slice(range.value.start, range.value.end).map((item, i) => ({
    item,
    index: range.value.start + i,
  }))
);

const offset = computed(() => range.value.start * props.itemHeight);

// A shorter list can leave the viewport scrolled past the new end.
watch(
  () => props.items.length,
  () => {
    if (viewport.value && viewport.value.scrollTop > totalHeight.value) {
      viewport.value.scrollTop = 0;
      scrollTop.value = 0;
    }
  }
);

defineExpose({
  /** Scroll a row into view; used to reveal the selection after a sort change. */
  scrollToIndex(index) {
    if (!viewport.value || index < 0) return;
    viewport.value.scrollTop = Math.max(0, index * props.itemHeight - viewportHeight.value / 2);
  },
});
</script>

<template>
  <div ref="viewport" class="virtual-viewport" @scroll.passive="onScroll">
    <!-- Spacer carries the full scroll height; only `windowed` rows exist. -->
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div :style="{ transform: `translateY(${offset}px)` }">
        <div
          v-for="entry in windowed"
          :key="entry.index"
          class="virtual-row"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="entry.item" :index="entry.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-viewport {
  overflow-y: auto;
  height: 100%;
  /* Keep momentum scrolling from painting outside the window on iOS. */
  -webkit-overflow-scrolling: touch;
}
.virtual-row {
  box-sizing: border-box;
}
</style>
