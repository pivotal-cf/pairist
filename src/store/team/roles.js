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
    inLocation(_, getters) {
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

    add({ state }, { name }) {
      if (name === "") { return }

      state.ref
        .push({
          name,
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: Date.now(),
        })
    },

    remove({ dispatch, state }, key ) {
      state.ref.child(key).remove()
      dispatch("lanes/clearEmpty", null, { root: true })
    },

    move({ dispatch, state }, { key, location }) {
      let role = state.roles.find(role => role[".key"] === key)
      if (!role) { return }
      role = {
        ...role,
        location,
        updatedAt: Date.now(),
      }
      delete role[".key"]

      state.ref.child(key).set(role)
      dispatch("lanes/clearEmpty", null, { root: true })
    },
  },
}
