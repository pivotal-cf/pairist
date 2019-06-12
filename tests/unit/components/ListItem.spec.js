import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import editable from '@/components/editable'
import ListItem from '@/components/team/ListItem'

Vue.use(Vuetify)
const localVue = createLocalVue()
localVue.use(Vuex)

describe('ListItem', () => {
  let getters
  let store
  let propsData

  beforeEach(() => {
    getters = {
      canWrite: jest.fn().mockReturnValue(false),
    }
    store = new Vuex.Store({
      state: {},
      getters,
    })
    propsData = {
      item: {
        checked: false,
        title: '',
      },
    }
  })

  it('renders with no exceptions', () => {
    shallowMount(ListItem, { propsData, store, localVue })
  })

  it('doesn\'t have an editable title', () => {
    let wrapper = shallowMount(ListItem, { propsData, store, localVue })
    expect(wrapper.find(editable).exists()).toBe(false)
  })

  describe('canWrite is true', () => {
    let wrapper

    beforeEach(() => {
      getters.canWrite.mockReturnValue(true)
      wrapper = shallowMount(ListItem, { propsData, store, localVue })
    })

    it('has an editable title', () => {
      expect(wrapper.find(editable).exists()).toBe(true)
    })
  })
})
