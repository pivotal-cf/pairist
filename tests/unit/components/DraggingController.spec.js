import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DraggingController from '@/components/team/DraggingController'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('DraggingController', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      move: jest.fn(),
    }
    store = new Vuex.Store({
      state: {},
      actions,
    })
  })

  it('renders with no exceptions', () => {
    shallowMount(DraggingController, { propsData: { draggables: ['a', 'b'] } })
  })

  it('maps the move action', () => {
    const wrapper = shallowMount(DraggingController, {
      store,
      localVue,
      propsData: { draggables: ['a', 'b'] },
    })

    const args = [1, 2, 3]
    wrapper.vm.move(args)
    expect(actions.move).toHaveBeenCalledTimes(1)
    expect(actions.move.mock.calls[0][1]).toBe(args)
  })
})
