import Vue from "vue"
import Vuex from "vuex"
import shared from "./shared"
import team from "./team/index"
import user from "./user"

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    shared,
    team,
    user,
  },
})
