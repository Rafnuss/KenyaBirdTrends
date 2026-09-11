import { createApp } from "vue";
import App from "./App.vue";

import { tooltip } from "./directives/tooltip";

import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });

createApp(App).directive("tooltip", tooltip).mount("#app");
