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
      </v-list-tile-content>
      <v-progress-circular v-if="loading" indeterminate color="primary"/>
      <v-list-tile-action v-if="canWrite">
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
import { mapGetters } from 'vuex'

export default {
  components: { editable },

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
</style>
