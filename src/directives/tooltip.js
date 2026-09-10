import Tooltip from "bootstrap/js/dist/tooltip";

/**
 * v-tooltip="'text'" — Bootstrap's own tooltip, without a component wrapper.
 *
 *   v-tooltip="text"          default placement (top)
 *   v-tooltip:right="text"    explicit placement
 *   v-tooltip.html="markup"   allow markup in the body
 *
 * Passing an empty value renders nothing, so a tooltip can be bound
 * conditionally without a v-if around the element.
 */
function content(binding, el) {
  return binding.value ?? el.getAttribute("title") ?? "";
}

function options(binding, title) {
  return {
    title,
    placement: binding.arg || "top",
    html: Boolean(binding.modifiers.html),
    trigger: "hover focus",
    container: "body",
    // No fade: tooltips live on <body>, and rows in the virtual list unmount
    // as they scroll away. With a transition running, dispose() can race it
    // and leave the tip orphaned on the page.
    animation: false,
  };
}

export const tooltip = {
  mounted(el, binding) {
    const title = content(binding, el);
    if (!title) return;
    // Bootstrap reads `title` and would otherwise also show the native tooltip.
    el.removeAttribute("title");
    el._tooltip = new Tooltip(el, options(binding, title));
  },
  updated(el, binding) {
    const title = content(binding, el);
    if (el._tooltip) {
      el._tooltip.setContent({ ".tooltip-inner": title });
    } else if (title) {
      el._tooltip = new Tooltip(el, options(binding, title));
    }
  },
  beforeUnmount(el) {
    // Tooltips are appended to <body>, so they outlive the element otherwise.
    if (!el._tooltip) return;
    el._tooltip.hide();
    el._tooltip.dispose();
    el._tooltip = null;
  },
};
