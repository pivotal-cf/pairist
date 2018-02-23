import { shallow, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'
import PersonDialog from '@/components/team/PersonDialog'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('PersonDialog', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      save: jest.fn(),
    }
    store = new Vuex.Store({
      state: {},
      modules: {
        entities: {
          namespaced: true,
          actions,
        },
      },
    })
  })

  it('renders with no exceptions', () => {
    shallow(PersonDialog, { store,
      localVue,
      propsData: {
        person: { '.key': 'p1', 'name': 'Bart' },
      },
    })
  })

  it('dispatches save with the edited person', async () => {
    const person = { '.key': 'p1', 'name': 'Bart', 'picture': 'bart.png' }
    const wrapper = shallow(PersonDialog, { store,
      localVue,
      propsData: {
        person: person,
      },
    })

    await wrapper.vm.save()

    expect(actions.save).toHaveBeenCalled()
    expect(actions.save).toHaveBeenCalledWith(expect.anything(), {
      '.key': 'p1',
      'type': 'person',
      'name': 'Bart',
      'picture': 'bart.png',
    }, undefined)

    expect(person.name).toEqual('')
    expect(person.picture).toEqual('')
    expect(wrapper.vm.show).toBe(false)
  })

  it('can be opened', () => {
    const wrapper = shallow(PersonDialog)
    expect(wrapper.vm.show).toBe(false)
    wrapper.vm.open()
    expect(wrapper.vm.show).toBe(true)
  })

  it('renders the action type in the title', async () => {
    const wrapper = shallow(PersonDialog)
    expect(wrapper.find('.headline').exists()).toBe(false)

    wrapper.vm.show = true
    await flushPromises()

    expect(wrapper.find('.headline').text()).toEqual('Edit Person')
  })

  it('renders the action type in the title', async () => {
    const wrapper = shallow(PersonDialog, { propsData: { actionType: 'New' } })
    expect(wrapper.find('.headline').exists()).toBe(false)

    wrapper.vm.show = true
    await flushPromises()

    expect(wrapper.find('.headline').text()).toEqual('New Person')
  })
})
