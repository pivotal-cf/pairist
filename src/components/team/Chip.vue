<template>
  <transition name="highlight">
    <ChipView
      :class="chipClass"
      :entity="entity"
      :data-key="entity['.key']"
      @contextmenu="openMenu">
      <ContextMenu
        v-if="canWrite"
        ref="menu"
        @edit="edit"
        @remove="remove"
      />
      <ChipDialog ref="chipDialog" :entity="Object.assign({}, entity)" />
    </ChipView>
  </transition>
</template>

<script>
import ContextMenu from '@/components/ContextMenu'
import ChipDialog from './ChipDialog'
import ChipView from './ChipView'

import { mapGetters } from 'vuex'

export default {
  components: { ContextMenu, ChipDialog, ChipView },

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

    remove () {
      this.$store.dispatch('entities/remove', this.entity['.key'])
    },
  },
}
</script>
