import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import Person from '@/components/team/Person'
import Chip from '@/components/team/Chip'
import Lane from '@/components/team/Lane'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuetify)

const addElemWithDataAppToBody = () => {
  const app = document.createElement('div')
  app.setAttribute('data-app', true)
  document.body.append(app)
}

describe('Lane', () => {
  let actions
  let entityActions
  let store
  let getters

  addElemWithDataAppToBody()

  beforeEach(() => {
    actions = {
      setLocked: jest.fn(),
    }
    entityActions = {
      resetLocation: jest.fn(),
    }
    getters = {
      canWrite: jest.fn().mockReturnValue(true),
      dragging: jest.fn().mockReturnValue(false),
      dropTarget: jest.fn().mockReturnValue(null),
    }
    store = new Vuex.Store({
      state: {},
      getters,
      modules: {
        lanes: {
          namespaced: true,
          actions,
        },
        entities: {
          namespaced: true,
          actions: {
            ...entityActions,
          },
        },
      },
    })
  })

  it('renders with no exceptions', () => {
    shallowMount(Lane, { localVue, store, propsData: { lane: {} } })
  })

  it('can be locked and unlocked', async () => {
    const lane = { '.key': 'a-key', 'locked': false }
    const wrapper = mount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    expect(wrapper.find('.lock-button button').classes()).not.toContain('is-locked')
    expect(wrapper.find('.lock-button button').classes()).toContain('accent')

    wrapper.find('.lock-button button').trigger('click')
    expect(actions.setLocked).toHaveBeenCalled()
    expect(actions.setLocked).toHaveBeenLastCalledWith(expect.anything(), {
      key: 'a-key',
      locked: true,
    }, undefined)

    lane.locked = true
    wrapper.setProps({ lane: { ...lane } })
    await flushPromises()

    expect(wrapper.find('.lock-button button').classes()).toContain('is-locked')
    expect(wrapper.find('.lock-button button').classes()).toContain('pink')

    wrapper.find('.lock-button button').trigger('click')
    expect(actions.setLocked).toHaveBeenCalled()
    expect(actions.setLocked).toHaveBeenLastCalledWith(expect.anything(), {
      key: 'a-key',
      locked: false,
    }, undefined)
  })

  it('cannot be locked and unlocked if cannot write', () => {
    getters.canWrite.mockReturnValue(false)

    const lane = { '.key': 'a-key', 'locked': false }
    const wrapper = shallowMount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    expect(wrapper.find('.lock-button').exists()).toBeFalsy()
  })

  it('shows a new lane without a lock button if new-lane is passed', async () => {
    const lane = { '.key': 'new-lane' }
    const wrapper = shallowMount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    expect(wrapper.find('.lock-button').exists()).toBeFalsy()
  })

  it('can be closed', async () => {
    const lane = { '.key': 'a-key' }
    const wrapper = mount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    wrapper.find('.sweep-button button').trigger('click')
    expect(entityActions.resetLocation).toHaveBeenCalled()
    expect(entityActions.resetLocation).toHaveBeenLastCalledWith(expect.anything(), 'a-key', undefined)
  })

  it('cannot be closed if cannot write', () => {
    getters.canWrite.mockReturnValue(false)

    const lane = { '.key': 'a-key' }
    const wrapper = shallowMount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    expect(wrapper.find('.sweep-button').exists()).toBeFalsy()
  })

  it('shows a new lane without a close button if new-lane is passed', async () => {
    const lane = { '.key': 'new-lane' }
    const wrapper = mount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    expect(wrapper.find('.sweep-button').exists()).toBeFalsy()
  })

  it('shows a divider if applicable', () => {
    const wrapper = mount(Lane, {
      store,
      localVue,
      propsData: { lane: {}, divider: true },
    })

    expect(wrapper.find('hr.divider').exists()).toBe(true)
  })

  it("hides the divider when it's not desired", () => {
    const wrapper = mount(Lane, {
      store,
      localVue,
      propsData: { lane: {}, divider: false },
    })

    expect(wrapper.find('hr.divider').exists()).toBe(false)
  })

  it('renders people', () => {
    const lane = {
      people: [{ '.key': 'p1' }, { '.key': 'p2' }],
    }
    const wrapper = shallowMount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    const people = wrapper.findAll(Person)
    expect(people.length).toEqual(2)
    expect(people.wrappers[0].vm.person).toEqual({ '.key': 'p1' })
    expect(people.wrappers[1].vm.person).toEqual({ '.key': 'p2' })
  })

  it('renders roles', () => {
    const lane = {
      roles: [{ '.key': 'r1' }, { '.key': 'r2' }],
    }
    const wrapper = shallowMount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    const roles = wrapper.findAll(Chip)
    expect(roles.length).toEqual(2)
    expect(roles.wrappers[0].vm.entity).toEqual({ '.key': 'r1' })
    expect(roles.wrappers[1].vm.entity).toEqual({ '.key': 'r2' })
  })

  it('renders tracks', () => {
    const lane = {
      tracks: [{ '.key': 't1' }, { '.key': 't2' }],
    }
    const wrapper = shallowMount(Lane, {
      store,
      localVue,
      propsData: { lane },
    })

    const tracks = wrapper.findAll(Chip)
    expect(tracks.length).toEqual(2)
    expect(tracks.wrappers[0].vm.entity).toEqual({ '.key': 't1' })
    expect(tracks.wrappers[1].vm.entity).toEqual({ '.key': 't2' })
  })
})
