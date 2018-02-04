import Vue from "vue"
import Vuex from "vuex"
import shared from "./shared"
import team from "./team"

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    shared: shared,
    team: team,
  },
})
