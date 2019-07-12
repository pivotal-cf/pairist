import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import Person from '@/components/team/Person'

Vue.use(Vuetify)
const localVue = createLocalVue()
localVue.use(Vuex)

jest.mock('@/assets/no-picture.svg', () => {
  return 'no-picture.svg'
})

jest.mock('@/assets/error-image.svg', () => {
  return 'error-image.svg'
})

describe('Person', () => {
  let store
  let getters

  beforeEach(() => {
    getters = {
      canWrite: jest.fn().mockReturnValue(true),
      dragging: jest.fn().mockReturnValue(false),
    }
    store = new Vuex.Store({
      state: {},
      getters,
      modules: {
        entities: {
          namespaced: true,
        },
      },
    })
  })

  it('renders with no exceptions', () => {
    shallowMount(Person, { store,
      localVue,
      propsData: {
        person: { '.key': 'p1', 'name': 'Bart' },
      },
    })
  })

  it('shows a persons name and picture', () => {
    const wrapper = shallowMount(Person, { store,
      localVue,
      propsData: {
        person: { '.key': 'p1', 'name': 'Lisa', 'picture': 'lisas-picture.png' },
      },
    })

    expect(wrapper.find('.name').html()).toContain('Lisa')
    expect(wrapper.find('img').attributes().src).toEqual('lisas-picture.png')
  })

  it('defaults to generated avatar', () => {
    const wrapper = shallowMount(Person, { store,
      localVue,
      propsData: {
        person: { '.key': 'p2', 'name': 'Bob' },
      },
    })

    expect(wrapper.find('.name').html()).toContain('Bob')
    expect(wrapper.find('svg').attributes()['data-jdenticon-value']).toEqual('Bob')
  })

  it("shows an error image if avatar can't be loaded", async () => {
    const wrapper = shallowMount(Person, { store,
      localVue,
      propsData: {
        person: { '.key': 'p2', 'name': 'Error', 'picture': 'nope' },
      },
    })

    expect(wrapper.find('.name').html()).toContain('Error')

    const avatar = wrapper.find('img')
    avatar.trigger('error')
    await flushPromises()
    expect(avatar.attributes().src).toEqual('error-image.svg')
  })

  it("updates name's font size based on length", async () => {
    const person = { '.key': 'p3' }
    const wrapper = shallowMount(Person, { store,
      localVue,
      propsData: {
        person: person,
      },
    })

    const name = wrapper.find('.name span')
    expect(name.text()).toEqual('')
    expect(name.element.style.fontSize).toEqual('18px')

    person.name = 'N'
    wrapper.setProps({ person: { ...person } })
    await flushPromises()
    expect(name.element.style.fontSize).toEqual('18px')

    person.name = '12345678'
    wrapper.setProps({ person: { ...person } })
    await flushPromises()
    expect(name.element.style.fontSize).toEqual('16px')

    person.name = '123456789'
    wrapper.setProps({ person: { ...person } })
    await flushPromises()
    expect(name.element.style.fontSize).toEqual('15px')

    person.name = '1234567890'
    wrapper.setProps({ person: { ...person } })
    await flushPromises()
    expect(name.element.style.fontSize).toEqual('12px')
  })

  it('shows person edit when clicking edit', () => {
    const wrapper = shallowMount(Person, { store,
      localVue,
      propsData: {
        person: { '.key': 'p', 'name': 'Person' },
      },
    })

    const open = wrapper.vm.$refs.personDialog.open = jest.fn()
    wrapper.vm.edit()
    expect(open).toHaveBeenCalled()
  })
})
