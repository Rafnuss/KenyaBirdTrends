<script setup>
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch, watchEffect } from "vue";

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

const dialog = useTemplateRef("dialog");
/** Whatever had focus before we opened, so it can be handed back. */
let previouslyFocused = null;

function close() {
  open.value = false;
}

function onBackdrop() {
  if (!props.noCloseOnBackdrop) close();
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusable() {
  return [...(dialog.value?.querySelectorAll(FOCUSABLE) ?? [])].filter(
    (el) => el.offsetParent !== null
  );
}

/**
 * Keep Tab inside the dialog. Without this, focus walks out into the page
 * behind the backdrop, which is unreachable by mouse but not by keyboard.
 */
function onKeydown(event) {
  if (!open.value) return;

  if (event.key === "Escape" && !props.noCloseOnEsc) {
    close();
    return;
  }
  if (event.key !== "Tab") return;

  const items = focusable();
  if (items.length === 0) {
    event.preventDefault();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
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

watch(open, async (isOpen) => {
  if (isOpen) {
    previouslyFocused = document.activeElement;
    await nextTick();
    (focusable()[0] ?? dialog.value)?.focus();
  } else {
    // Hand focus back to whatever opened the dialog.
    previouslyFocused?.focus?.();
    previouslyFocused = null;
  }
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop show"></div>
    <div
      v-if="open"
      class="modal show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @click.self="onBackdrop"
    >
      <div
        ref="dialog"
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        :class="[size ? `modal-${size}` : '', dialogClass]"
        tabindex="-1"
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
