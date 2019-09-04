<template>
  <div>
    <v-list-tile>
      <v-list-tile-action v-if="canWrite" class="inner-handle">
        <v-btn icon ripple>
          <v-icon color="grey lighten-1">mdi-drag</v-icon>
        </v-btn>
      </v-list-tile-action>
      <v-list-tile-action>
        <v-checkbox
          v-model="item.checked"
          :disabled="!canWrite"
          @change="save"
        />
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-sub-title>
          <div @click="setEditMode(true)">
            <editable
              v-show="editing"
              ref="editable"
              :class="{ checked: item.checked }"
              :content="title"
              placeholder="Add title..."
              @blur="setEditMode(false)"
              @update="title = $event"
            />
            <VueShowdown
              v-show="!editing"
              :markdown="title"
              :class="{ checked: item.checked }"
              flavor="github"
            />
          </div>
        </v-list-tile-sub-title>

        <ul class="emoji-list">
          <li v-for="emoji in visibleEmojis" :key="emoji.name" class="emoji-list__item">
            <EmojiButton
              :count="emoji.count"
              :name="emoji.name"
              show-count
              @click="addEmoji(emoji.name)"
              @shiftClick="removeEmoji(emoji.name)"
            />
          </li>
        </ul>
      </v-list-tile-content>
      <v-list-tile-action v-if="canWrite">
        <v-menu>
          <v-btn slot="activator" icon ripple class="add-emoji">
            <v-icon color="grey lighten-1">insert_emoticon</v-icon>
          </v-btn>
          <EmojiPicker @pick="addEmoji($event)"/>
        </v-menu>
      </v-list-tile-action>
      <v-list-tile-action v-if="loading">
        <v-progress-circular indeterminate color="grey lighten-1" size="24"/>
      </v-list-tile-action>
      <v-list-tile-action v-else-if="canWrite">
        <v-btn icon ripple class="remove-item" @click="remove">
          <v-icon color="grey lighten-1">close</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
    <v-divider/>
  </div>
</template>

<script>
import editable from '@/components/editable'
import EmojiPicker from '@/components/team/EmojiPicker'
import EmojiButton from '@/components/team/EmojiButton'
import { mapGetters } from 'vuex'

export default {
  components: {
    editable,
    EmojiPicker,
    EmojiButton,
  },

  props: {
    item: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      editing: false,
    }
  },

  computed: {
    ...mapGetters(['canWrite']),

    title: {
      get () { return this.item.title },
      async set (value) {
        const item = { ...this.item, title: value }
        this.$emit('update', item)
      },
    },

    visibleEmojis () {
      const visibleEmojis = []

      for (const emojiName in (this.item.emojis || {})) {
        const emoji = this.item.emojis[emojiName]
        if (!emoji || !emoji.count) continue

        visibleEmojis.push({
          name: emojiName,
          count: emoji.count,
          timestamp: emoji.timestamp,
        })
      }

      return visibleEmojis.sort((a, b) => a.timestamp - b.timestamp)
    },
  },

  methods: {
    setEditMode (enabled) {
      if (!this.canWrite) return
      this.editing = enabled

      if (enabled) {
        this.$nextTick(() => {
          this.$refs.editable.focus()
        })
      }
    },

    updateEmoji (emojiName, adding) {
      this.item.emojis = this.item.emojis || {}
      const existingEmoji = this.item.emojis[emojiName]

      if (!adding && existingEmoji.count <= 1) {
        delete this.item.emojis[emojiName]
      } else if (existingEmoji && existingEmoji.count >= 1) {
        existingEmoji.count = adding ? existingEmoji.count + 1 : Math.max(existingEmoji.count - 1, 0)
      } else {
        this.item.emojis[emojiName] = { count: 1, timestamp: Date.now() }
      }

      this.$emit('update', this.item)
    },

    addEmoji (emojiName) {
      this.updateEmoji(emojiName, true)
    },

    removeEmoji (emojiName) {
      this.updateEmoji(emojiName, false)
    },

    save () {
      this.$emit('update', this.item)
    },

    remove () {
      this.$emit('remove', this.item['.key'])
    },
  },
}
</script>

<style lang="stylus">
.checked
  text-decoration: line-through

.inner-handle
  min-width: 30px

.list .v-list__tile__action .v-input--selection-controls .v-input__slot
    margin: 0 !important

.list .v-list__tile__sub-title p
    margin: 0

.emoji-list
  padding: 0

  .emoji-list__item
    list-style-type: none
    display: inline-block

</style>
