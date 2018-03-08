<template>
  <transition name="highlight">
    <ChipView
      :class="[chipClass, 'chip']"
      :entity="entity"
      :data-key="entity['.key']"
    >
      <v-btn v-if="canWrite" class="edit-hover" fab icon color="primary" depressed small @click="edit">
        <v-icon>edit</v-icon>
      </v-btn>
      <ChipDialog ref="chipDialog" :entity="Object.assign({}, entity)" />
    </ChipView>
  </transition>
</template>

<script>
import ChipDialog from './ChipDialog'
import ChipView from './ChipView'

import { mapGetters } from 'vuex'

export default {
  components: { ChipDialog, ChipView },

  props: {
    entity: {
      type: Object,
      required: true,
    },
    chipClass: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapGetters(['canWrite']),
  },

  methods: {
    openMenu (event) {
      if (this.canWrite) {
        this.$refs.menu.open(event)
      }
    },

    edit () {
      this.$refs.chipDialog.open()
    },
  },
}
</script>

<style lang="stylus" scoped>
.chip
  overflow: hidden

  .edit-hover
    height: 28px
    width: 28px
    top: 2px
    right: -60px
    margin: 0
    opacity: 0
    position: absolute
    transition: right linear .1s
    z-index: 100

  &:hover
    .edit-hover
      display: block
      right: 2px
      opacity: 0.9
</style>
