import { firebaseMutations, firebaseAction } from "vuexfire"

import constants from "@/lib/constants"

export default {
  namespaced: true,

  state: {
    people: [],
  },

  mutations: {
    setRef(state, ref) { state.ref = ref },
    ...firebaseMutations,
  },

  getters: {
    all(state) {
      return state.people
    },
    unassigned(_, getters) {
      return getters.inLocation(constants.LOCATION.UNASSIGNED)
    },
    out(_, getters) {
      return getters.inLocation(constants.LOCATION.OUT)
    },
    inLocation(state, getters) {
      return location => (
        getters.all.filter(person => person.location === location)
      )
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef("people", ref)
      commit("setRef",  ref.ref)
    }),

    save({ state }, person) {
      if (person.name === "") { return }

      if (person[".key"]) {
        const key = person[".key"]
        delete person[".key"]

        state.ref.child(key).update(person)
      } else {
        state.ref.push({
          name: person.name,
          picture: person.picture || "",
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: Date.now(),
        })
      }
    },

    remove({ dispatch, state }, key ) {
      state.ref.child(key).remove()
      dispatch("lanes/clearEmpty", null, { root: true })
    },

    move({ dispatch, state }, { key, location }) {
      const payload = {
        location,
        updatedAt: Date.now(),
      }

      state.ref.child(key).update(payload)
      dispatch("lanes/clearEmpty", null, { root: true })
    },
  },
}
