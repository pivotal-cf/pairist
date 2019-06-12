import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import VueShowdown from 'vue-showdown'
import editable from '@/components/editable'
import ListItem from '@/components/team/ListItem'

Vue.use(Vuetify)
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueShowdown)

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
        title: 'some-title **with bold**',
      },
    }
  })

  it('renders with no exceptions', () => {
    shallowMount(ListItem, { propsData, store, localVue })
  })

  it('renders markdown formatted titles', () => {
    let wrapper = mount(ListItem, { propsData, store, localVue })
    expect(wrapper.find('.v-list__tile__sub-title p').html())
      .toEqual('<p>some-title <strong>with bold</strong></p>')
  })

  it('cannot be edited', () => {
    let wrapper = shallowMount(ListItem, { propsData, store, localVue })
    wrapper.vm.setEditMode(true)
    expect(wrapper.find(editable).element.style.display).toEqual('none')
  })

  describe('canWrite is true', () => {
    let wrapper

    beforeEach(() => {
      getters.canWrite.mockReturnValue(true)
      wrapper = mount(ListItem, { propsData, store, localVue })
    })

    describe('in edit mode', () => {
      beforeEach(() => {
        getters.canWrite.mockReturnValue(true)
        wrapper = mount(ListItem, { propsData, store, localVue })
        wrapper.vm.setEditMode(true)
      })

      it('renders an editable title', () => {
        expect(wrapper.find(editable).element.style.display).toEqual('')
      })

      it('renders non-formatted markdown editable titles', () => {
        expect(wrapper.find(editable).props('content')).toEqual('some-title **with bold**')
      })
    })
  })
})
