import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)

new Vue({
    render: (h) => h(App),
}).$mount("#app");