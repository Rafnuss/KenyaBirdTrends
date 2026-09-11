<script setup>
import { computed } from "vue";

const props = defineProps({
  size: { type: [Number, String], default: 0 },
  opacity: { type: [Number, String], default: 1 },
  color: { type: String, default: "#7d7d7d" },
});

const circleStyle = computed(() => {
  const size = Number(props.size);
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${size / 2}px`,
    background: props.color,
    border: "1px solid #212529",
    opacity: props.opacity,
  };
});
</script>

<template>
  <div :style="circleStyle"></div>
</template>
