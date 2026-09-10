<script setup>
import { onBeforeUnmount, onMounted, watchEffect } from "vue";

/**
 * A Bootstrap 5 modal driven by Vue rather than Bootstrap's imperative JS.
 *
 * Bootstrap's Modal class manages classes, the backdrop and body scroll by
 * hand, which fights Vue over the same DOM. Rendering it declaratively is both
 * smaller and predictable, and it needs no global orchestrator.
 */
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  title: { type: String, default: "" },
  /** Bootstrap dialog size: "sm" | "lg" | "xl" | "" */
  size: { type: String, default: "" },
  /** Extra classes on .modal-dialog, e.g. for a fullscreen video. */
  dialogClass: { type: String, default: "" },
  noCloseOnEsc: { type: Boolean, default: false },
  noCloseOnBackdrop: { type: Boolean, default: false },
});

function close() {
  open.value = false;
}

function onBackdrop() {
  if (!props.noCloseOnBackdrop) close();
}

function onKeydown(event) {
  if (event.key === "Escape" && open.value && !props.noCloseOnEsc) close();
}

// Listen unconditionally and no-op while closed: attaching and detaching in a
// watcher leaves the listener and the open state able to drift apart.
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.classList.remove("modal-open");
});

// Match Bootstrap's own behaviour: the page behind must not scroll.
watchEffect(() => document.body.classList.toggle("modal-open", open.value));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop show"></div>
    <div
      v-if="open"
      class="modal show d-block"
      tabindex="-1"
      role="dialog"
      :aria-label="title"
      @click.self="onBackdrop"
    >
      <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        :class="[size ? `modal-${size}` : '', dialogClass]"
        @click.stop
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="close"></button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
