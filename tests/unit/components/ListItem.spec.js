import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import VueShowdown from 'vue-showdown'
import editable from '@/components/editable'
import ListItem from '@/components/team/ListItem'

jest.mock('@/lib/emojis', () => ({
  emojiNames: ['fake_emoji_1', 'fake_emoji_2'],
  emojisByName: { fake_emoji_1: '👀', fake_emoji_2: '⛄' },
}))

Vue.use(Vuetify)
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueShowdown)

describe('ListItem', () => {
  let getters
  let store
  let propsData

  beforeEach(() => {
    document.body.setAttribute('data-app', true)
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
    const wrapper = mount(ListItem, { propsData, store, localVue })
    expect(wrapper.find('.v-list__tile__sub-title p').html())
      .toEqual('<p>some-title <strong>with bold</strong></p>')
  })

  it('cannot be edited', () => {
    const wrapper = shallowMount(ListItem, { propsData, store, localVue })
    wrapper.vm.setEditMode(true)
    expect(wrapper.find(editable).element.style.display).toEqual('none')
  })

  it('renders an empty emoji list', () => {
    const wrapper = shallowMount(ListItem, { propsData, store, localVue })
    expect(wrapper.find('.emoji-list').isEmpty()).toBeTruthy()
  })

  describe('canWrite is true', () => {
    let wrapper

    beforeEach(() => {
      getters.canWrite.mockReturnValue(true)
      wrapper = mount(ListItem, { propsData, store, localVue })
    })

    it('renders an emoji button', () => {
      expect(wrapper.find('.add-emoji').is('button')).toBeTruthy()
    })

    describe('in edit mode', () => {
      beforeEach(() => {
        wrapper.vm.setEditMode(true)
      })

      it('renders an editable title', () => {
        expect(wrapper.find(editable).element.style.display).toEqual('')
      })

      it('renders non-formatted markdown editable titles', () => {
        expect(wrapper.find(editable).props('content')).toEqual('some-title **with bold**')
      })
    })

    describe('when there are emojis for this item', () => {
      beforeEach(() => {
        propsData.item.emojis = {
          fake_emoji_1: { count: 1, timestamp: 10 },
          fake_emoji_2: { count: 3, timestamp: 5 },
        }

        wrapper = mount(ListItem, { propsData, store, localVue })
      })

      it('renders an emoji button with a count for each one', () => {
        const emojiButtons = wrapper.findAll('.emoji-list .emoji-button').wrappers

        expect(emojiButtons).toHaveLength(2)
        expect(emojiButtons[0].text()).toEqual('⛄ 3')
        expect(emojiButtons[1].text()).toEqual('👀 1')
      })

      it('updates emoji counts when an emoji button is clicked', () => {
        const emojiButtons = wrapper.findAll('.emoji-list .emoji-button').wrappers
        emojiButtons[1].trigger('click')

        expect(wrapper.emitted('update')).toEqual([
          [{
            ...propsData.item,
            emojis: {
              fake_emoji_1: { count: 2, timestamp: 10 },
              fake_emoji_2: { count: 3, timestamp: 5 },
            },
          }],
        ])
      })
    })
  })
})
