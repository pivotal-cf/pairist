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
      commit("setRef",  ref)
    }),

    save({ state }, person) {
      if (person.name === "") { return }

      if (person[".key"]) {
        const key = person[".key"]
        delete person[".key"]

        state.ref.child(key).set(person)
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
      let person = state.people.find(person => person[".key"] === key)
      if (!person) { return }
      person = {
        ...person,
        location,
        updatedAt: Date.now(),
      }

      delete person[".key"]

      state.ref.child(key).set(person)
      dispatch("lanes/clearEmpty", null, { root: true })
    },
  },
}
