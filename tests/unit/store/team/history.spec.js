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
          { '.key': '999', 'before': null, 'entities': [] },
          { '.key': '1000', 'at': null, 'entities': [] },
        ])
      })

      it('adds .key to entities', () => {
        const history = [
          {
            '.key': '999',
            'entities': {
              e1: { name: 'name' },
              e2: { name: 'name' },
            },
          },
          {
            '.key': '1000',
            'entities': {
              e3: { name: 'name' },
              e4: { name: 'name' },
            },
          },
        ]
        const currentScaledDate = 1003

        expect(store.getters.all({ history }, { currentScaledDate })).toEqual([
          {
            '.key': '999',
            'entities': [
              { '.key': 'e1', 'name': 'name' },
              { '.key': 'e2', 'name': 'name' },
            ],
          },
          {
            '.key': '1000',
            'entities': [
              { '.key': 'e3', 'name': 'name' },
              { '.key': 'e4', 'name': 'name' },
            ],
          },
        ])
      })
    })
  })
})
