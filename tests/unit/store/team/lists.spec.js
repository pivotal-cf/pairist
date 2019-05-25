import store from '@/store/team/lists'

describe('Lists Store', () => {
  describe('mutations', () => {
    describe('setRef', () => {
      it('sets the ref', () => {
        const ref = { ref: 'ref' }
        const state = {}

        store.mutations.setRef(state, ref)
        expect(state.ref).toBe(ref)
      })
    })
  })

  describe('getters', () => {
    describe('all', () => {
      it('returns the lists from the state', () => {
        const lists = { lists: 'lists' }

        expect(store.getters.all({ lists })).toBe(lists)
      })
    })
  })

  describe('actions', () => {
    describe('save', () => {
      it('pushes a new list into the ref', () => {
        const push = jest.fn()
        const state = { ref: { push } }

        store.actions.save({ state }, { title: 'list' })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          title: 'list',
          items: [],
        })
      })

      it('edits an existing list', () => {
        const existingList = {
          '.key': 'p1',
          'title': 'john',
        }
        const update = jest.fn()
        const child = jest.fn().mockReturnValue({ update })
        const state = { lists: [existingList], ref: { child } }

        store.actions.save({ state }, { '.key': 'p1', 'title': 'smith' })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('p1')
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({
          title: 'smith',
        })
      })

      it('only submints updated fields', () => {
        const existingList = {
          '.key': 'p2',
          'title': 'john',
        }
        const update = jest.fn()
        const child = jest.fn().mockReturnValue({ update })
        const state = { lists: [existingList], ref: { child } }

        store.actions.save({ state }, { '.key': 'p2', 'title': 'smith' })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('p2')
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({ title: 'smith' })
      })
    })

    describe('remove', () => {
      it('removes list from ref', () => {
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

    describe('saveItem', () => {
      it('pushes a new item into the list', () => {
        const push = jest.fn()
        const items = jest.fn().mockReturnValue({ push })
        const child = jest.fn().mockReturnValue({ child: items })
        const state = { ref: { child } }
        const listKey = 'list-key'

        store.actions.saveItem({ state }, { listKey, item: { title: 'item' } })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('list-key')
        expect(items).toHaveBeenCalledTimes(1)
        expect(items).toHaveBeenCalledWith('items')
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          title: 'item',
        })
      })

      it('edits an existing item', () => {
        const update = jest.fn()
        const item = jest.fn().mockReturnValue({ update })
        const items = jest.fn().mockReturnValue({ child: item })
        const child = jest.fn().mockReturnValue({ child: items })
        const state = { ref: { child } }
        const listKey = 'list-key'

        store.actions.saveItem({ state }, { listKey, item: { '.key': 'p1', 'title': 'smith' } })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('list-key')
        expect(items).toHaveBeenCalledTimes(1)
        expect(items).toHaveBeenCalledWith('items')
        expect(item).toHaveBeenCalledTimes(1)
        expect(item).toHaveBeenCalledWith('p1')
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({
          title: 'smith',
        })
      })
    })

    describe('removeItem', () => {
      it('removes an item from a list', () => {
        const dispatch = jest.fn()
        const remove = jest.fn()
        const item = jest.fn().mockReturnValue({ remove })
        const items = jest.fn().mockReturnValue({ child: item })
        const child = jest.fn().mockReturnValue({ child: items })
        const state = { ref: { child } }
        const listKey = 'list-key'

        store.actions.removeItem({ dispatch, state }, { listKey, key: 'key' })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith('list-key')
        expect(items).toHaveBeenCalledTimes(1)
        expect(items).toHaveBeenCalledWith('items')
        expect(item).toHaveBeenCalledTimes(1)
        expect(item).toHaveBeenCalledWith('key')
        expect(remove).toHaveBeenCalledTimes(1)
        expect(remove).toHaveBeenCalledWith()
      })
    })
  })
})
