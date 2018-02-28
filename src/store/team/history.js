import { firebaseMutations, firebaseAction } from 'vuexfire'
import recommendation from './recommendation'
import _ from 'lodash'
import { plural } from 'pluralize'

export default {
  namespaced: true,

  state: {
    history: [],
  },

  mutations: {
    setRef (state, ref) { state.ref = ref },
    ...firebaseMutations,
  },

  getters: {
    all (state, getters) {
      // disregard history entries created > 3 timeslots ago
      return state.history.filter(history =>
        parseInt(history['.key']) <= (getters.currentScaledDate - 3)
      )
    },

    withGroupedEntities (state, getters) {
      return getters.all.map(history => {
        const entities = Object.keys(history.entities || {}).map(key =>
          Object.assign({ '.key': key }, history.entities[key])
        )
        return {
          '.key': history['.key'],
          ..._.groupBy(entities, e => plural(e.type)),
        }
      })
    },

    currentScaledDate (_state, _getters, rootState) {
      return recommendation.scaleDate(rootState.shared.now)
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef('history', ref)
      commit('setRef', ref.ref)
    }),
  },
}
