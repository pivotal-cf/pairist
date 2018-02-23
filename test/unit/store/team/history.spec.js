import store from '@/store/team/history'

describe('History Store', () => {
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
      it('filters history from after currentScaledDate-3', () => {
        const history = [
          { '.key': '999', 'before': null },
          { '.key': '1000', 'at': null },
          { '.key': '1001', 'after': null },
        ]
        const currentScaledDate = 1003

        expect(store.getters.all({ history }, { currentScaledDate })).toEqual([
          { '.key': '999', 'before': null },
          { '.key': '1000', 'at': null },
        ])
      })
    })
  })

  describe('actions', () => {
  })
})
