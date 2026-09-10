import { createApp } from "vue";
import App from "./App.vue";

// @vue-leaflet resolves Leaflet from `window.L` by default. Publishing our
// own copy there guarantees it and the layers we build imperatively share a
// single Leaflet instance; otherwise its dynamic import pulls in a second
// pre-bundled copy and the two prototype chains get mixed.
import * as L from "leaflet";
window.L = L;

import { createBootstrap } from "bootstrap-vue-next";

import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });

const app = createApp(App);
app.use(createBootstrap());
app.mount("#app");
