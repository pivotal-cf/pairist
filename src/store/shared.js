export default {
  state: {
    loading: false,
    snackbarColor: null,
    snackbarText: null,
  },

  mutations: {
    loading(state, value) { state.loading = value },

    notify(state, { message, color }) {
      state.snackbarText = message
      state.snackbarColor = color
    },
  },
  getters: {
    snackbarText(state) {
      return state.snackbarText
    },
    snackbarColor(state) {
      return state.snackbarColor
    },
    loading(state) {
      return state.loading
    },
  },
  actions: {
    clearNotification({ commit }) {
      commit("notify", { message: null, color: null })
    },
  },
}
