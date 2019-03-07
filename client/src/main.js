import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Admin from './components/Admin'

Vue.config.productionTip = false

// Lägg till vue-komponent globalt
Vue.component("Admin", Admin);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
