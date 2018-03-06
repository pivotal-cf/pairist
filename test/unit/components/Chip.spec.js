import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import Chip from '@/components/team/Chip'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuetify)

describe('Chip', () => {
  let actions
  let store
  let getters

  beforeEach(() => {
    getters = {
      canWrite: jest.fn().mockReturnValue(true),
    }
    actions = {
      remove: jest.fn(),
    }
    store = new Vuex.Store({
      state: {},
      modules: {
        entities: {
          namespaced: true,
          actions,
        },
      },
      getters,
    })
  })

  it('renders with no exceptions', () => {
    shallow(Chip, { store,
      localVue,
      propsData: {
        entity: { '.key': 'p1', 'name': 'Bart' },
        chipClass: 'chip',
      },
    })
  })

  it('emits a remove event when it is removed', () => {
    const wrapper = shallow(Chip, { store,
      localVue,
      propsData: {
        entity: { '.key': 'p', 'name': 'Chip' },
        chipClass: 'chip',
      },
    })

    wrapper.vm.remove()
    expect(actions.remove).toHaveBeenCalledWith(expect.anything(), 'p', undefined)
  })
})
