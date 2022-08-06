import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)

//Vue.config.productionTip = false

import { library } from '@fortawesome/fontawesome-svg-core'
import { faDirections, faClone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faDirections, faClone)
Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
    el: '#app',
    template: '<App/>',
    components: { App },
})
