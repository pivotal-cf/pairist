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
