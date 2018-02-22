import { firebaseMutations, firebaseAction } from "vuexfire"
import recommendation from "./recommendation"

export default {
  namespaced: true,

  state: {
    history: [],
  },

  mutations: {
    setRef(state, ref) { state.ref = ref },
    ...firebaseMutations,
  },

  getters: {
    all(state, getters) {
      // disregard history entries created > 3 timeslots ago
      return state.history.filter(history =>
        parseInt(history[".key"]) <= (getters.currentScaledDate - 3)
      )
    },

    people(state, getters) {
      return getters.all.map(history => {
        return {
          ".key": history[".key"],
          "people": Object.keys(history.entities || {}).map(key =>
            Object.assign({".key": key}, history.entities[key])
          ).filter(person => person.type === "person"),
        }
      })
    },

    currentScaledDate(_state, _getters, rootState) {
      return recommendation.scaleDate(rootState.shared.now)
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef("history", ref)
      commit("setRef",  ref.ref)
    }),
  },
}
