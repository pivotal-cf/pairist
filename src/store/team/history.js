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
      commit("setRef",  ref.ref)
    }),

    async save({ commit, state, rootGetters }) {
      commit("loading", true, { root: true })

      const key = recommendation.scaleDate(Date.now())
      const current = { ...rootGetters.current }
      delete current[".key"]

      await state.ref.child(key).set(current)
      commit("notify", {
        message: "History recorded!",
        color: "success",
      }, { root: true })

      commit("loading", false, { root: true })
    },
  },
}
