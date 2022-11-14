<script>
export default {
  props: {
    size: { default: 0 },
    opacity: { default: 1 },
    color: { default: "#7d7d7d" },
  },
};
</script>

<template>
  <div
    class="legend-gradient-3"
    :style="
      `
      width: ` +
      size +
      `px;
      height: ` +
      size +
      `px;
      -webkit-border-radius: ` +
      size / 2 +
      `px;
      -moz-border-radius: ` +
      size / 2 +
      `px;
      border-radius: ` +
      size +
      `px;
      background: ` +
      color +
      `;
      border: 1px solid #212529;
      opacity: ` +
      opacity +
      `;
    `
    "
  ></div>
</template>
