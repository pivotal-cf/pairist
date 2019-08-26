export default {
  state: {
    loading: false,
    snackbarColor: null,
    snackbarText: null,
    now: null,
  },

  mutations: {
    updateNow (state) { state.now = Date.now() },

    loading (state, value) { state.loading = value },

    notify (state, { message, color }) {
      state.snackbarText = message
      state.snackbarColor = color
    },
  },

  getters: {
    snackbarText (state) {
      return state.snackbarText
    },
    snackbarColor (state) {
      return state.snackbarColor
    },
    loading (state) {
      return state.loading
    },
  },

  actions: {
    watchNow ({ commit }) {
      commit('updateNow')
      setInterval(() => {
        commit('updateNow')
      }, (process.env.NODE_ENV === 'production' ? 60 : 5) * 1000)
    },

    clearNotification ({ commit }) {
      commit('notify', { message: null, color: null })
    },
  },
}
