import { firebaseMutations, firebaseAction } from "vuexfire"

import constants from "@/lib/constants"

export default {
  namespaced: true,

  state: {
    roles: [],
  },

  mutations: {
    setRef(state, ref) { state.ref = ref },
    ...firebaseMutations,
  },

  getters: {
    all(state) {
      return state.roles
    },
    unassigned(_, getters) {
      return getters.inLocation(constants.LOCATION.UNASSIGNED)
    },
    inLocation(state, getters) {
      return location => (
        getters.all.filter(role => role.location === location)
      )
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef("roles", ref)
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
      const role = Object.assign(
        {},
        state.roles.find(role => role[".key"] === key),
      )
      role.location = location
      role.updatedAt = new Date().getTime()
      delete role[".key"]

      state.ref.child(key).set(role)
      dispatch("lanes/clearEmpty", null, { root: true })
    },
  },
}
