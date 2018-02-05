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
    all(state) { return state.history },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef("history", ref)
      commit("setRef",  ref)
    }),

    async save({ commit, state, rootGetters }) {
      commit("loading", true, { root: true })
      const key = recommendation.scaleDate(new Date())
      try {
        const current = Object.assign({}, rootGetters.current)
        delete current[".key"]

        await state.ref.child(key).set(current)
        commit("notify", {
          message: "History recorded!",
          color: "success",
        }, { root: true })
      } catch(error) {
        commit("notify", {
          message: "Error recording history.",
          color: "error",
        }, { root: true })
        console.error(error)
      }
      commit("loading", false, { root: true })
    },
  },
}
