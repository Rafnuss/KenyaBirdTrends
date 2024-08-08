import Vue from "vue";
import App from "./App.vue";

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

import VueCookie from "vue-cookie";
Vue.use(VueCookie);

import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });

new Vue({
  render: (h) => h(App),
}).$mount("#app");
