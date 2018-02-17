import Vue from "vue"
import Vuex from "vuex"
import shared from "./shared"
import team from "./team/index"
import user from "./user"

import { db } from "@/firebase"
import { firebaseMutations, firebaseAction } from "vuexfire"

Vue.use(Vuex)

const schemaRef = db.ref("/schema")

export const store = new Vuex.Store({
  modules: {
    shared,
    team,
    user,
  },

  state: {
    schema: null,
  },

  mutations: {
    ...firebaseMutations,
  },

  getters: {
    migrating(state) {
      if (state.schema) {
        return state.schema.migrating
      }
      return true
    },

    dbSchemaVersion(state) {
      if (state.schema) {
        return state.schema.version
      }
      return 0
    },

    dbSchema(state) {
      return state.schema
    },

    appSchemaVersion() { return 1 },
  },

  actions: {
    bindSchemaRef: firebaseAction(async ({ bindFirebaseRef }) => {
      bindFirebaseRef("schema" , schemaRef)
    }),
  },
})
