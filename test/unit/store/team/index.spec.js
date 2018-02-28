import store from '@/store/team/index'
import constants from '@/lib/constants'

jest.mock('@/firebase', () => {
  const firebasemock = require('firebase-mock')

  const mockdatabase = new firebasemock.MockFirebase()
  const mockauth = new firebasemock.MockFirebase()
  const mocksdk = new firebasemock.MockFirebaseSdk(path => {
    return path ? mockdatabase.child(path) : mockdatabase
  }, () => {
    return mockauth
  })

  const firebaseApp = mocksdk.initializeApp() // can take a path arg to database url
  const db = firebaseApp.database()

  global.db = db

  return { firebaseApp, db }
})

jest.mock('vuexfire', () => {
  return {
    firebaseAction: (action) => {
      return (stuff, args) => {
        return action(stuff, args)
      }
    },
    firebaseMutations: {},
  }
})

jest.mock('@/store/team/recommendation', () => {
  global.calculateMovesToBestPairing = jest.fn()
  return {
    calculateMovesToBestPairing: global.calculateMovesToBestPairing,
    toDate (date) { return new Date(date) },
  }
})

describe('Team Store', () => {
  describe('mutations', () => {
    describe('authorize', () => {
      it('sets both read and write states', () => {
        const read = { read: null }
        const write = { write: null }
        const payload = { read, write }
        const state = {}

        store.mutations.authorize(state, payload)
        expect(state.canRead).toBe(read)
        expect(state.canWrite).toBe(write)
      })
    })
  })

  describe('getters', () => {
    describe('current', () => {
      it('returns the current state', () => {
        const current = { current: null }

        expect(store.getters.current({ current })).toBe(current)
      })
    })

    describe('canRead', () => {
      it('returns the canRead state', () => {
        const canRead = { canRead: null }

        expect(store.getters.canRead({ canRead })).toBe(canRead)
      })
    })

    describe('canWrite', () => {
      it('returns the canWrite state', () => {
        const canWrite = { canWrite: null }

        expect(store.getters.canWrite({ canWrite })).toBe(canWrite)
      })
    })
  })

  describe('actions', () => {
    describe('loadTeamRefs', () => {
      it('binds current ref', () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const bindFirebaseRef = jest.fn()

        store.actions.loadTeamRefs({ bindFirebaseRef, commit, dispatch, state: {} }, global.db.ref('/teams/my-team/current'))

        expect(bindFirebaseRef).toHaveBeenCalledTimes(1)
        expect(bindFirebaseRef)
          .toHaveBeenCalledWith('current', global.db.ref('/teams/my-team/current'))
      })

      it('dispatches ref for child stores', () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const bindFirebaseRef = jest.fn()
        const state = {}

        store.actions.loadTeamRefs({ bindFirebaseRef, commit, dispatch, state }, global.db.ref('/teams/my-team/current'))

        expect(dispatch)
          .toHaveBeenCalledWith(
            'entities/setRef',
            global.db.ref('/teams/my-team/current/entities').orderByChild('updatedAt'),
          )

        expect(dispatch)
          .toHaveBeenCalledWith(
            'lanes/setRef',
            global.db.ref('/teams/my-team/current/lanes'),
          )
      })
    })

    describe('loadTeam', () => {
      it('loads refs for team history and public', async () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const bindFirebaseRef = jest.fn()
        const state = {}

        await store.actions.loadTeam({ bindFirebaseRef, commit, dispatch, state }, 'my-team')
        expect(dispatch)
          .toHaveBeenCalledWith(
            'history/setRef',
            global.db.ref('/teams/my-team/history').orderByKey().limitToLast(100),
          )

        expect(bindFirebaseRef)
          .toHaveBeenCalledWith('public', global.db.ref('/teams/my-team/public'))
      })
    })

    describe('loadState', () => {
      it('loads current state back if offset is 0', () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const state = { teamName: 'my-team' }
        const getters = {
          'history/all': [{ '.key': '123' }],
        }

        store.actions.loadState({ commit, dispatch, state, getters }, 'current')
        expect(dispatch)
          .toHaveBeenCalledWith(
            'loadTeamRefs',
            global.db.ref('/teams/my-team/current'),
          )

        expect(state.loadedKey).toEqual('current')
      })

      it('loads in ref from history when offset is negative', () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const state = { teamName: 'my-team' }
        const getters = {
          'history/all': [{ '.key': '123' }],
        }

        store.actions.loadState({ commit, dispatch, state, getters }, '123')
        expect(dispatch)
          .toHaveBeenCalledWith(
            'loadTeamRefs',
            global.db.ref('/teams/my-team/history/123'),
          )

        expect(state.loadedKey).toEqual('123')
      })
    })

    describe('authorize', () => {
      it('authorizes users with read and write permissions', async () => {
        const commit = jest.fn()
        const prom = store.actions.authorize({ commit }, 'tubers')
        global.db.ref('/teams/tubers/writecheck').flush()
        await prom

        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('authorize', { read: true, write: true })
      })

      it('handles someone being unable to write but able to read', async () => {
        const commit = jest.fn()
        global.db.ref('/teams/pika/writecheck').failNext('set', new Error('foo'))
        global.db.ref('/teams/pika/public').autoFlush()
        global.db.ref('/teams/pika/writecheck').autoFlush()

        const prom = store.actions.authorize({ commit }, 'pika')
        await prom

        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('authorize', { read: true, write: false })
      })

      it('handles users who have neither read nor write permissions', async () => {
        const commit = jest.fn()
        global.db.ref('/teams/chu/writecheck').failNext('set', new Error('write'))
        global.db.ref('/teams/chu/public').failNext('once', new Error('read'))
        global.db.ref('/teams/chu/writecheck').autoFlush()
        global.db.ref('/teams/chu/public').autoFlush()

        const prom = store.actions.authorize({ commit }, 'chu')
        await prom

        expect(commit).toHaveBeenCalledTimes(2)
        expect(commit).toHaveBeenCalledWith('authorize', { read: false, write: false })
        expect(commit).toHaveBeenCalledWith('notify', {
          message: "You don't have permissions to view this team.",
          color: 'error',
        })
      })
    })
  })

  describe('move', () => {
    it('moves the entity to the passed location', () => {
      const key = 'entity-key'
      const targetKey = 'target-key'
      const getters = jest.fn()
      const dispatch = jest.fn()

      store.actions.move({ getters, dispatch }, { key, targetKey })

      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith('entities/move', { key, location: targetKey })
      expect(dispatch).toHaveBeenCalledWith('lanes/clearEmpty')
    })

    it('moves entity to unassigned if target is falsy', () => {
      const key = 'carrot'
      const targetKey = null
      const getters = jest.fn()
      const dispatch = jest.fn()

      store.actions.move({ getters, dispatch }, { key, targetKey })

      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith('entities/move', { key, location: constants.LOCATION.UNASSIGNED })
      expect(dispatch).toHaveBeenCalledWith('lanes/clearEmpty')
    })

    it('creates and moves entity to new-lane if requested', async () => {
      const key = 'chicken'
      const targetKey = 'new-lane'
      const newLaneKey = 'my-favorite-lane'
      const getters = { 'lanes/lastAddedKey': newLaneKey }
      const dispatch = jest.fn()

      const prom = store.actions.move({ getters, dispatch }, { key, targetKey })
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledWith('lanes/add')

      await prom

      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith('entities/move', { key, location: newLaneKey })
      expect(dispatch).toHaveBeenCalledWith('lanes/clearEmpty')
    })

    describe('applyPairing', () => {
      it('does nothing and notifies when no actions are needed', () => {
        const dispatch = jest.fn()
        const commit = jest.fn()
        const getters = {}
        const pairsAndLanes = []

        store.actions.applyPairing({ commit, dispatch, getters }, pairsAndLanes)
        expect(dispatch).toHaveBeenCalledTimes(0)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('notify', {
          message: 'Pairing setting is already the optimal one. No actions taken',
          color: 'accent',
        })
      })

      it('dispatches moves for each person to their assigned lanes', () => {
        const dispatch = jest.fn()
        const commit = jest.fn()
        const getters = {}
        const pairsAndLanes = [
          { pair: ['p1', 'p2'], lane: 'l1' },
          { pair: ['p3', 'p4'], lane: 'l2' },
          { pair: ['p5'], lane: 'l3' },
        ]

        store.actions.applyPairing({ commit, dispatch, getters }, pairsAndLanes)
        expect(dispatch).toHaveBeenCalledTimes(5)
        expect(dispatch).toHaveBeenCalledWith('move', {
          key: 'p1',
          targetKey: 'l1',
        })
        expect(dispatch).toHaveBeenCalledWith('move', {
          key: 'p2',
          targetKey: 'l1',
        })
        expect(dispatch).toHaveBeenCalledWith('move', {
          key: 'p3',
          targetKey: 'l2',
        })
        expect(dispatch).toHaveBeenCalledWith('move', {
          key: 'p4',
          targetKey: 'l2',
        })
        expect(dispatch).toHaveBeenCalledWith('move', {
          key: 'p5',
          targetKey: 'l3',
        })
      })

      it('creates a new lane and moves if necessary', async () => {
        const dispatch = jest.fn()
        const commit = jest.fn()
        const getters = { 'lanes/lastAddedKey': 'superlane' }
        const pairsAndLanes = [
          { pair: ['p1', 'p2'], lane: 'new-lane' },
        ]

        await store.actions.applyPairing({ commit, dispatch, getters }, pairsAndLanes)
        expect(dispatch).toHaveBeenCalledTimes(3)
        expect(dispatch).toHaveBeenCalledWith('lanes/add')
        expect(dispatch).toHaveBeenCalledWith('move', {
          key: 'p1',
          targetKey: 'superlane',
        })
        expect(dispatch).toHaveBeenCalledWith('move', {
          key: 'p2',
          targetKey: 'superlane',
        })
      })
    })

    describe('recommendPairs', () => {
      it('dispatches applyPairing with recommended moves', () => {
        const entityGetter = jest.fn().mockReturnValue([4, 5, 6])
        const dispatch = jest.fn()
        const commit = jest.fn()
        const getters = {
          'history/withGroupedEntities': [1, 2, 3],
          'entities/all': entityGetter,
          'lanes/all': [7, 8, 9],
        }
        const moves = { moves: null }

        global.calculateMovesToBestPairing.mockReturnValue(moves)

        store.actions.recommendPairs({ commit, dispatch, getters })
        expect(entityGetter).toHaveBeenCalledWith('person')

        expect(global.calculateMovesToBestPairing).toHaveBeenCalledTimes(1)
        expect(global.calculateMovesToBestPairing).toHaveBeenCalledWith({
          history: [1, 2, 3],
          current: {
            people: [4, 5, 6],
            lanes: [7, 8, 9],
          },
        })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledTimes(0)
      })

      it('notifies no pairing assignment can be made', () => {
        const dispatch = jest.fn()
        const commit = jest.fn()
        const getters = {
          'history/withGroupedEntities': [],
          'entities/all': jest.fn().mockReturnValue([]),
          'lanes/all': [],
        }
        const moves = null

        global.calculateMovesToBestPairing.mockReturnValue(moves)

        store.actions.recommendPairs({ commit, dispatch, getters })

        expect(global.calculateMovesToBestPairing)
          .toHaveBeenCalledWith({ history: [], current: { people: [], lanes: [] } })
        expect(dispatch).toHaveBeenCalledTimes(0)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('notify', {
          message: 'Cannot make a valid pairing assignment. Do you have too many lanes?',
          color: 'warning',
        })
      })
    })
  })
})
