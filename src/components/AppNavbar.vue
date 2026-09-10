<script setup>
import { ref } from "vue";

import logoPng from "../assets/pwa-30x30.png";
import { state } from "../store";
import { usePwaInstall } from "../composables/usePwaInstall";

const { canInstall, promptInstall } = usePwaInstall();

/** Bootstrap's navbar collapse, driven by Vue instead of its JS plugin. */
const navOpen = ref(false);
</script>

<template>
  <nav class="navbar navbar-expand-sm bg-light sticky-top app-navbar">
    <div class="container-fluid">
      <a class="navbar-brand" href="#" @click.prevent="state.mode = 'Intro'">
        <img :src="logoPng" width="30" height="30" class="d-inline-block align-top" />
        Kenya Bird Trends
      </a>

      <button
        v-if="state.mode !== 'Intro'"
        type="button"
        class="btn btn-primary btn-sm me-2 d-lg-none"
        :title="state.sidebar ? 'Show the map' : 'Show the list'"
        @click="state.sidebar = !state.sidebar"
      >
        <i :class="state.sidebar ? 'bi bi-map-fill' : 'bi bi-list'" />
      </button>

      <button
        class="navbar-toggler"
        type="button"
        aria-label="Toggle navigation"
        :aria-expanded="navOpen"
        @click="navOpen = !navOpen"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: navOpen }">
        <ul class="navbar-nav">
          <li v-for="m in ['Grid', 'Species']" :key="m" class="nav-item">
            <a
              class="nav-link"
              :class="{ active: state.mode === m }"
              href="#"
              @click.prevent="state.mode = m"
            >
              {{ m }}
            </a>
          </li>
        </ul>

        <div class="ms-auto d-flex">
          <button
            type="button"
            class="btn btn-light"
            title="Settings"
            @click="state.settingsOpen = true"
          >
            <i class="bi bi-gear" />
          </button>
          <button
            v-if="canInstall"
            type="button"
            class="btn btn-light"
            title="Install app"
            @click="promptInstall"
          >
            <i class="bi bi-file-arrow-down" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-navbar {
  border-bottom: 1px solid #e5e9ef;
}
</style>
