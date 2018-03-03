import { firebaseMutations, firebaseAction } from 'vuexfire'
import history from '@/history'
import _ from 'lodash/fp'

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
      const startDate = getters.currentScaledDate - 3
      const withKey = entities =>
        _.map(key =>
          _.assign({ '.key': key }, entities[key]),
        )(_.keys(entities))

      return _.flow(
        _.filter(_.flow(_.prop('.key'), parseInt, _.lte(_, startDate))),
        _.map(h => _.assoc('entities', withKey(h.entities), h)),
      )(state.history)
    },

    currentScaledDate (_state, _getters, rootState) {
      return history.scaleDate(rootState.shared.now)
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef('history', ref)
      commit('setRef', ref.ref)
    }),
  },
}
