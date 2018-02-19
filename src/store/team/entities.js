import { firebaseMutations, firebaseAction } from "vuexfire"

import constants from "@/lib/constants"

export default () => ({
  namespaced: true,

  state: {
    entities: [],
  },

  mutations: {
    setRef(state, ref) { state.ref = ref },
    ...firebaseMutations,
  },

  getters: {
    all(state) {
      return state.entities
    },
    unassigned(_, getters) {
      return getters.inLocation(constants.LOCATION.UNASSIGNED)
    },
    out(_, getters) {
      return getters.inLocation(constants.LOCATION.OUT)
    },
    inLocation(state, getters) {
      return location => (
        getters.all.filter(entity => entity.location === location)
      )
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef("entities", ref)
      commit("setRef",  ref.ref)
    }),

    save({ state }, entity) {
      if (entity.name === "") { return }

      if (entity[".key"]) {
        const key = entity[".key"]
        delete entity[".key"]

        state.ref.child(key).update(entity)
      } else {
        const entityToCreate = {
          name: entity.name,
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: Date.now(),
        }

        if (entity.picture) {
          entityToCreate.picture = entity.picture
        }

        state.ref.push(entityToCreate)
      }
    },

    remove({ dispatch, state }, key ) {
      state.ref.child(key).remove()
      dispatch("lanes/clearEmpty", null, { root: true })
    },

    move({ state }, { key, location }) {
      const payload = {
        location,
        updatedAt: Date.now(),
      }

      state.ref.child(key).update(payload)
    },
  },
})
