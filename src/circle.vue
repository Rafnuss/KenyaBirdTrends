<script>
export default {
  props: {
    size: { type: [Number, String], default: 0 },
    opacity: { type: [Number, String], default: 1 },
    color: { type: String, default: "#7d7d7d" },
  },
  computed: {
    circleStyle() {
      const size = Number(this.size);
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${size / 2}px`,
        background: this.color,
        border: "1px solid #212529",
        opacity: this.opacity,
      };
    },
  },
};
</script>

<template>
  <div class="legend-gradient-3" :style="circleStyle"></div>
</template>
