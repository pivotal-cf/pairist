import { firebaseAction } from 'vuexfire'
import _ from 'lodash/fp'

import { db } from '@/firebase'

import constants from '@/lib/constants'
import entities from './entities'
import lanes from './lanes'
import history from './history'
import lists from './lists'

import history_ from '@/history'
import { calculateMovesToBestPairing } from '@/lib/recommendation'

export default {
  modules: {
    entities,
    lanes,
    history,

    lists,
  },

  state: {
    current: null,
    public: null,
    publicRef: null,
    canRead: false,
    canWrite: false,

    dragging: false,
    dropTarget: null,

    loadedKey: null,
  },

  mutations: {
    authorize (state, { read, write }) {
      state.canRead = read
      state.canWrite = write
    },

    setDragging (state, value) {
      state.dragging = value
    },

    setDropTarget (state, value) {
      state.dropTarget = value
    },
  },

  getters: {
    showingDate ({ loadedKey }, getters) {
      if (!loadedKey || isNaN(loadedKey)) { return null }

      return getters.toDate(loadedKey)
    },

    toDate () {
      return (key) => history_.toDate(key)
    },

    dragging (state) { return state.dragging },
    dropTarget (state) { return state.dropTarget },

    publicRO (state) {
      return state.public && state.public['.value']
    },
    current (state) {
      return state.current
    },
    canRead (state) {
      return state.canRead
    },
    canWrite (state) {
      return state.canWrite
    },
  },

  actions: {
    loadTeamRefs: firebaseAction(({ bindFirebaseRef, dispatch }, currentRef) => {
      bindFirebaseRef('current', currentRef)

      dispatch('entities/setRef',
        currentRef.child('entities').orderByChild('updatedAt'))

      dispatch('lanes/setRef',
        currentRef.child('lanes'))
    }),

    loadTeam: firebaseAction(async ({ bindFirebaseRef, commit, dispatch, state }, teamName) => {
      commit('loading', true)
      const historyRef = db.ref(`/teams/${teamName}/history`)
      const publicRef = db.ref(`/teams/${teamName}/public`)

      await bindFirebaseRef('public', publicRef)
      state.publicRef = publicRef.ref

      await dispatch('history/setRef',
        historyRef.orderByKey().limitToLast(100))

      await dispatch('lists/setRef',
        db.ref(`/teams/${teamName}/lists`))

      state.teamName = teamName
      commit('loading', false)
    }),

    async loadState ({ commit, state, dispatch }, key) {
      commit('loading', true)
      if (key === 'current') {
        const currentRef = db.ref(`/teams/${state.teamName}/current`)
        dispatch('loadTeamRefs', currentRef)
      } else {
        dispatch('loadTeamRefs', db.ref(`/teams/${state.teamName}/history/${key}`))
      }

      state.loadedKey = key
      commit('loading', false)
    },

    async authorize ({ commit }, teamName) {
      try {
        await db.ref(`/teams/${teamName}/writecheck`).set(0)
        commit('authorize', { read: true, write: true })
        return
      } catch (error) {
        try {
          await db.ref(`/teams/${teamName}/public`).once('value')
          commit('authorize', { read: true, write: false })
        } catch (error) {
          commit('authorize', { read: false, write: false })
          commit('notify', {
            message: "You don't have permissions to view this team.",
            color: 'error',
          })
        }
      }
    },

    async setPublic ({ commit, state }, value) {
      commit('loading', true)
      await state.publicRef.set(value)
      commit('loading', false)
    },

    async move ({ getters, dispatch }, { key, targetKey }) {
      let location

      if (targetKey === 'new-lane') {
        await dispatch('lanes/add')
        location = getters['lanes/lastAddedKey']
      } else if (targetKey) {
        location = targetKey
      } else {
        location = constants.LOCATION.UNASSIGNED
      }

      dispatch('entities/move', { key, location })
      dispatch('lanes/clearEmpty')
    },

    applyMoves ({ commit, getters, dispatch }, pairsAndLanes) {
      _.forEach(({ entities, lane }) => {
        if (lane === 'new-lane') {
          Promise.resolve(dispatch('lanes/add'))
          lane = getters['lanes/lastAddedKey']
        }

        _.forEach(key => {
          dispatch('move', {
            key: key,
            targetKey: lane,
          })
        }, entities)
      }, pairsAndLanes)
    },

    recommendPairs ({ commit, dispatch, getters }) {
      const moves = calculateMovesToBestPairing({
        history: getters['history/all'].slice(),
        current: {
          entities: getters['entities/all'].slice(),
          lanes: getters['lanes/all'].slice(),
        },
      })

      if (moves) {
        if (moves.length === 0) {
          commit('notify', {
            message: 'Pairing setting is already the optimal one. No actions taken',
            color: 'accent',
          })
        } else {
          dispatch('applyMoves', moves)
        }
      } else {
        commit('notify', {
          message: 'Cannot make a valid pairing assignment. Do you have too many lanes?',
          color: 'warning',
        })
      }
    },
  },
}
