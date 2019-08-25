import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import EmojiPicker from '@/components/team/EmojiPicker'
import EmojiButton from '@/components/team/EmojiButton'

jest.mock('@/lib/emojis', () => ({
  emojiNames: ['fake_emoji_1', 'fake_emoji_2'],
  emojisByName: { fake_emoji_1: '👀', fake_emoji_2: '⛄' },
}))

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('EmojiPicker', () => {
  it('renders with no exceptions', () => {
    shallowMount(EmojiPicker, { localVue })
  })

  it('renders a button for every emoji', () => {
    const wrapper = shallowMount(EmojiPicker, { localVue })

    for (const name of ['fake_emoji_1', 'fake_emoji_2']) {
      const button = wrapper.find({ name })
      expect(button.is(EmojiButton)).toBeTruthy()
      expect(button.exists()).toBeTruthy()
    }
  })

  it('fires events when emoji buttons are clicked', () => {
    const wrapper = mount(EmojiPicker, { localVue })

    for (const name of ['fake_emoji_1', 'fake_emoji_2']) {
      const button = wrapper.find({ name })
      expect(button.is(EmojiButton)).toBeTruthy()
      button.trigger('click')
    }

    expect(wrapper.emitted('pick')).toEqual([
      ['fake_emoji_1'],
      ['fake_emoji_2'],
    ])
  })
})
