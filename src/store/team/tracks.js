import { firebaseMutations, firebaseAction } from "vuexfire"

import constants from "@/lib/constants"

export default {
  namespaced: true,

  state: {
    tracks: [],
  },

  mutations: {
    setRef(state, ref) { state.ref = ref },
    ...firebaseMutations,
  },

  getters: {
    all(state) {
      return state.tracks
    },
    unassigned(_, getters) {
      return getters.inLocation(constants.LOCATION.UNASSIGNED)
    },
    inLocation(state, getters) {
      return location => (
        getters.all.filter(track => track.location === location)
      )
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef("tracks", ref)
      commit("setRef",  ref)
    }),

    async add({ commit, state }, { name }) {
      if (name === "") {
        return
      }

      commit("loading", true, { root: true })
      await state.ref
        .push({
          name,
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: new Date().getTime(),
        })
      commit("loading", false, { root: true })
    },

    remove({ dispatch, state }, key ) {
      state.ref.child(key).remove()
      dispatch("lanes/clearEmpty", null, { root: true })
    },

    move({ dispatch, state }, { key, location }) {
      const track = Object.assign(
        {},
        state.tracks.find(track => track[".key"] === key),
      )
      track.location = location
      track.updatedAt = new Date().getTime()
      delete track[".key"]

      state.ref.child(key).set(track)
      dispatch("lanes/clearEmpty", null, { root: true })
    },
  },
}
