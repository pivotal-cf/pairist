<template>
  <ul class="emoji-picker background">
    <li v-for="emojiName in emojiNames" :key="emojiName" class="emoji-picker__item">
      <EmojiButton :name="emojiName" @click="pick(emojiName)"/>
    </li>
  </ul>
</template>

<script>
import EmojiButton from '@/components/team/EmojiButton'
import { emojiNames } from '@/lib/emojis'

export default {
  components: {
    EmojiButton,
  },

  data () {
    return {
      emojiNames,
    }
  },

  methods: {
    pick (emojiName) {
      this.$emit('pick', emojiName)
    },
  },
}
</script>

<style lang="stylus">
.emoji-picker
  padding: 8px

  .emoji-picker__item
    list-style-type: none
    display: inline-block
</style>
