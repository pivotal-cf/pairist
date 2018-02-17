import Vue from "vue"
import Vuetify from "vuetify"

Vue.use(Vuetify, {
  theme: {
    primary: "#243640",
    secondary: "#00a79d",
    background: "#f4fffe",
    lane: "#fefefe",
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
import { firebaseApp } from "./firebase"

store.dispatch("bindSchemaRef")

const auth = firebaseApp.auth()

Vue.config.devtools = process.env.NODE_ENV !== "production"
Vue.config.performance = process.env.NODE_ENV !== "production"
Vue.config.productionTip = false

/* eslint-disable no-new */
auth.onAuthStateChanged((user) => {
  if (user) {
    store.dispatch("autoLogin", user)
  }

  new Vue({
    el: "#app",
    store,
    router,
    components: { App },
    template: "<App/>",
  })
})
