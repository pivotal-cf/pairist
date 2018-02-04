// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue"
import Vuetify from "vuetify"

Vue.use(Vuetify, {
  theme: {
    primary: "#243640",
    secondary: "#00a79d",
    background: "#f4fffe",
    accent: "#1b78b3",
    error: "#b71c1c",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FFC107",
  },
})

import App from "./App"
import router from "./router"
import { store } from "./store"

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: "#app",
  store,
  router,
  components: { App },
  template: "<App/>",
})
