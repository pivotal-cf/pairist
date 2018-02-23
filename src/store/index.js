import Vue from 'vue'
import Vuex from 'vuex'
import shared from './shared'
import team from './team/index'
import user from './user'

import { db } from '@/firebase'
import { firebaseMutations, firebaseAction } from 'vuexfire'

import version from '@/version'

Vue.use(Vuex)

const schemaRef = db.ref('/schema')
const configRef = db.ref('/config')

export const store = new Vuex.Store({
  modules: {
    shared,
    team,
    user,
  },

  state: {
    schema: null,
    config: null,
  },

  mutations: {
    ...firebaseMutations,
  },

  getters: {
    localVersion () {
      return version
    },

    remoteVersion ({ config }) {
      if (config) {
        return config.version
      }
      return null
    },

    migrating ({ schema }) {
      if (schema) {
        return schema.migrating
      }
      return true
    },

    dbSchemaVersion ({ schema }) {
      if (schema) {
        return schema.version
      }
      return 0
    },

    dbSchema ({ schema }) {
      return schema
    },

    appSchemaVersion () { return 2 },
  },

  actions: {
    bindGlobalRefs: firebaseAction(async ({ bindFirebaseRef }) => {
      bindFirebaseRef('config', configRef)
      bindFirebaseRef('schema', schemaRef)
    }),
  },
})
