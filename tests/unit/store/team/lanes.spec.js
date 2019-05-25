import store from '@/store/team/lanes'

describe('Lanes Store', () => {
  describe('mutations', () => {
    describe('setRef', () => {
      it('sets the ref', () => {
        const ref = { ref: 'ref' }
        const state = {}

        store.mutations.setRef(state, ref)
        expect(state.ref).toBe(ref)
      })
    })

    describe('laneAdded', () => {
      it('sets lastAddedKey state', () => {
        const lastAddedKey = { lastAddedKey: 'lastAddedKey' }
        const state = {}

        store.mutations.laneAdded(state, lastAddedKey)
        expect(state.lastAddedKey).toBe(lastAddedKey)
      })
    })
  })

  describe('getters', () => {
    describe('all', () => {
      it('returns full lanes from state', () => {
        const lanes = [
          { '.key': 1 },
          { '.key': 2 },
          { '.key': 3 },
        ]
        const rootGetters = {
          'entities/inLocation': jest.fn().mockImplementation((key) =>
            (type) => ({ [type]: key })),
        }
        const getters = {
          fullLane: store.getters.fullLane(null, null, null, rootGetters),
        }

        const result = store.getters.all({ lanes }, getters)
        expect(result).toEqual([
          { '.key': 1, 'people': { person: 1 }, 'tracks': { track: 1 }, 'roles': { role: 1 } },
          { '.key': 2, 'people': { person: 2 }, 'tracks': { track: 2 }, 'roles': { role: 2 } },
          { '.key': 3, 'people': { person: 3 }, 'tracks': { track: 3 }, 'roles': { role: 3 } },
        ])
      })
    })

    describe('fullLane', () => {
      it('returns the lane  with entities from root', () => {
        const lane = { '.key': 1 }
        const rootGetters = {
          'entities/inLocation': jest.fn().mockImplementation((key) =>
            (type) => ({ [type]: key })),
        }

        const result = store.getters.fullLane(null, null, null, rootGetters)(lane)
        expect(result).toEqual(
          { '.key': 1, 'people': { person: 1 }, 'tracks': { track: 1 }, 'roles': { role: 1 } }
        )
      })
    })

    describe('lastAddedKey', () => {
      it('returns the last added key', () => {
        const lastAddedKey = { lastAddedKey: 'lastAddedKey' }

        expect(store.getters.lastAddedKey({ lastAddedKey })).toBe(lastAddedKey)
      })
    })
  })

  describe('actions', () => {
    describe('add', () => {
      it('pushes the lane into the ref', () => {
        const push = jest.fn().mockReturnValue({ key: 'the-key' })
        const commit = jest.fn()
        const state = { ref: { push } }

        store.actions.add({ commit, state })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({ sortOrder: 0 })
      })

      it('commits the lane back to added', () => {
        const push = jest.fn().mockReturnValue({ key: 'the-key' })
        const commit = jest.fn()
        const state = { ref: { push } }

        store.actions.add({ commit, state }, { name: '' })
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('laneAdded', 'the-key')
      })
    })

    describe('remove', () => {
      it('removes lane from ref', () => {
        const dispatch = jest.fn()
        const remove = jest.fn()
        const child = jest.fn().mockReturnValue({ remove })
        const state = { ref: { child } }

        store.actions.remove({ dispatch, state }, 'key')
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('key')
        expect(remove).toHaveBeenCalledTimes(1)
        expect(remove).toHaveBeenCalledWith()
      })
    })

    describe('setLocked', () => {
      it('sets the locked value (false)', () => {
        const dispatch = jest.fn()
        const update = jest.fn()
        const child = jest.fn().mockReturnValue({ update })
        const state = { ref: { child } }

        store.actions.setLocked({ dispatch, state }, { key: 'key', locked: false })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('key')
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({ locked: false })
      })

      it('sets the locked value (true)', () => {
        const dispatch = jest.fn()
        const update = jest.fn()
        const child = jest.fn().mockReturnValue({ update })
        const state = { ref: { child } }

        store.actions.setLocked({ dispatch, state }, { key: 'other-key', locked: true })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('other-key')
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({ locked: true })
      })
    })

    describe('clearEmpty', () => {
      it('dispatches remove for any lanes with no entites', () => {
        const lanes = [
          { '.key': 1, 'people': [], 'tracks': [], 'roles': [] },
          { '.key': 2, 'people': [2], 'tracks': [], 'roles': [] },
          { '.key': 3, 'people': [], 'tracks': [3], 'roles': [] },
          { '.key': 4, 'people': [], 'tracks': [], 'roles': [4] },
          { '.key': 5, 'people': [5], 'tracks': [5], 'roles': [5] },
        ]
        const state = { lanes }
        const dispatch = jest.fn()
        const getters = { fullLane: (lane) => lane }

        store.actions.clearEmpty({ state, dispatch, getters })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith('remove', 1)
      })
    })
  })
})
