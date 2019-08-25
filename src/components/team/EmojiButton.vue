<template>
  <v-btn icon ripple class="emoji-button" @click="handleClick">
    <span class="emoji-button__emoji">{{ emojisByName[this.$props.name] }}</span>
    <span v-if="showCount" class="emoji-button__count">{{ this.$props.count }}</span>
  </v-btn>
</template>

<script>
import { emojisByName } from '@/lib/emojis'

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    showCount: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 0,
    },
  },

  data () {
    return {
      emojisByName,
    }
  },

  methods: {
    handleClick (event) {
      if (event.shiftKey) this.$emit('shiftClick')
      else this.$emit('click')
    },
  },
}
</script>

<style lang="stylus">
.emoji-button
  margin: 0
  font-style: normal
  font-weight: normal

  .emoji-button__emoji
    font-size: 1.2em
    width: 1.1em

  .emoji-button__count
    font-size: 0.9em
</style>
