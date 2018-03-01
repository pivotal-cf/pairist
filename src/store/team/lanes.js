import { firebaseMutations, firebaseAction } from 'vuexfire'
import _ from 'lodash/fp'

export default {
  namespaced: true,

  state: {
    lanes: [],

    lastAddedKey: null,
  },

  mutations: {
    setRef (state, ref) { state.ref = ref },
    laneAdded (state, key) { state.lastAddedKey = key },
    ...firebaseMutations,
  },

  getters: {
    all (state, _getters, _rootState, rootGetters) {
      return _.map(lane => (
        {
          people: rootGetters['entities/inLocation'](lane['.key'])('person'),
          tracks: rootGetters['entities/inLocation'](lane['.key'])('track'),
          roles: rootGetters['entities/inLocation'](lane['.key'])('role'),
          ...lane,
        }
      ))(state.lanes)
    },

    lastAddedKey (state) { return state.lastAddedKey },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef('lanes', ref)
      commit('setRef', ref)
    }),

    add ({ commit, state }) {
      const key = state.ref.push({ sortOrder: 0 }).key
      commit('laneAdded', key)
    },

    remove ({ state }, key) {
      state.ref.child(key).remove()
    },

    setLocked ({ state }, { key, locked }) {
      state.ref.child(key).update({ locked })
    },

    clearEmpty ({ dispatch, getters }) {
      _.forEach(lane => {
        if (lane.people.length === 0 && lane.tracks.length === 0 && lane.roles.length === 0) {
          dispatch('remove', lane['.key'])
        }
      }, getters.all)
    },

  },
}
