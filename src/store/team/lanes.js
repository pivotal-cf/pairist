import { vuexfireMutations, firebaseAction } from 'vuexfire'
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
    ...vuexfireMutations,
  },

  getters: {
    all (state, getters) {
      return _.map(getters.fullLane)(state.lanes)
    },

    fullLane (_state, _getters, _rootState, rootGetters) {
      return (lane) => (
        {
          'people': rootGetters['entities/inLocation'](lane['.key'])('person'),
          'tracks': rootGetters['entities/inLocation'](lane['.key'])('track'),
          'roles': rootGetters['entities/inLocation'](lane['.key'])('role'),
          '.key': lane['.key'],
          ...lane,
        }
      )
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

    clearEmpty ({ state, dispatch, getters }) {
      _.flow(
        _.map(lane => {
          const fullLane = getters.fullLane(lane)
          if (fullLane.people.length === 0 && fullLane.tracks.length === 0 && fullLane.roles.length === 0) {
            return lane['.key']
          }
          return null
        }),
        _.compact,
        _.forEach(key => dispatch('remove', key)),
      )(state.lanes)
    },
  },
}
