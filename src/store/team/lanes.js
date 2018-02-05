import { firebaseMutations, firebaseAction } from "vuexfire"

export default {
  namespaced: true,

  state: {
    lanes: [],

    lastAddedKey: null,
  },

  mutations: {
    setRef(state, ref) { state.ref = ref },
    laneAdded(state, key) { state.lastAddedKey = key },
    ...firebaseMutations,
  },

  getters: {
    all(state, getters, _, rootGetters) {
      return state.lanes.map(lane => (
        Object.assign({
          people: rootGetters["people/inLocation"](lane[".key"]),
          tracks: rootGetters["tracks/inLocation"](lane[".key"]),
          roles: rootGetters["roles/inLocation"](lane[".key"]),
        }, lane)
      ))
    },

    lastAddedKey(state) { return state.lastAddedKey },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef("lanes", ref)
      commit("setRef",  ref)
    }),

    add({ commit, state }) {
      const key = state.ref.push({ sortOrder: 0 }).key
      commit("laneAdded", key)
    },

    remove({ state }, key ) {
      state.ref.child(key).remove()
    },

    clearEmpty({ dispatch, getters }) {
      getters.all.forEach(lane => {
        if (lane.people.length === 0 && lane.tracks.length === 0 && lane.roles.length === 0) {
          dispatch("remove", lane[".key"])
        }
      })
    },

    toggleLock({ state }, lane) {
      return state.ref.child(lane[".key"]).child("locked").set(!lane.locked)
    },
  },
}
