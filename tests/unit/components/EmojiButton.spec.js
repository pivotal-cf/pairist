import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import EmojiButton from '@/components/team/EmojiButton'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('EmojiButton', () => {
  it('renders with no exceptions', () => {
    shallowMount(EmojiButton, {
      localVue,
      propsData: { name: 'eyes' },
    })
  })

  it('does not show a count by default', () => {
    const wrapper = shallowMount(EmojiButton, {
      localVue,
      propsData: { name: 'eyes' },
    })

    expect(wrapper.find('.emoji-button__emoji').text()).toEqual('👀')
    expect(wrapper.find('.emoji-button__count').exists()).toBeFalsy()
  })

  it('can display a count', () => {
    const wrapper = shallowMount(EmojiButton, {
      localVue,
      propsData: {
        name: 'eyes',
        showCount: true,
        count: 10,
      },
    })

    expect(wrapper.find('.emoji-button__emoji').text()).toEqual('👀')
    expect(wrapper.find('.emoji-button__count').text()).toEqual('10')
  })

  it('fires an event when clicked', () => {
    const wrapper = mount(EmojiButton, {
      localVue,
      propsData: { name: 'eyes' },
    })

    wrapper.find('.emoji-button').trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('shiftClick')).toBeFalsy()
  })

  it('fires an event when shift-clicked', () => {
    const wrapper = mount(EmojiButton, {
      localVue,
      propsData: { name: 'eyes' },
    })

    wrapper.find('.emoji-button').trigger('click', { shiftKey: true })

    expect(wrapper.emitted('shiftClick')).toHaveLength(1)
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
