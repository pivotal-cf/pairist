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

    async save({ commit, state }, person) {
      if (person.name === "") {
        return
      }

      commit("loading", true, { root: true })
      if (person[".key"]) {
        const key = person[".key"]
        delete person[".key"]

        await state.ref.child(key).set(person)
      } else {
        await state.ref.push({
          name: person.name,
          picture: person.picture || "",
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: new Date().getTime(),
        })
      }
      commit("loading", false, { root: true })
    },

    remove({ dispatch, state }, key ) {
      state.ref.child(key).remove()
      dispatch("clearEmptylanes", null, { root: true })
    },

    move({ dispatch, state }, { key, location }) {
      const person = Object.assign(
        {},
        state.people.find(person => person[".key"] === key),
      )
      person.location = location
      person.updatedAt = new Date().getTime()
      delete person[".key"]

      state.ref.child(key).set(person)
      dispatch("clearEmptylanes", null, { root: true })
    },
  },
}
