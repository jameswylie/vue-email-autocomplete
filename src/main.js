import Vue from 'vue'
import EmailAutocomplete from './components/vue-email-autocomplete.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(EmailAutocomplete),
}).$mount('#app')
