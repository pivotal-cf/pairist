<template>
  <transition name="highlight">
    <v-chip class="track" color="accent" text-color="white" :data-key="track['.key']" @contextmenu="openMenu">
      <span>{{ track.name }}</span>
      <ContextMenu @remove="remove" ref="menu"
                   v-if="canWrite" />
    </v-chip>
  </transition>
</template>

<script>
import ContextMenu from "@/components/ContextMenu"

import { mapGetters } from "vuex"

export default {
  components: { ContextMenu },

  props: {
    track: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters(["canWrite"]),
  },

  methods: {
    openMenu(event) {
      if (this.canWrite) {
        this.$refs.menu.open(event)
      }
    },

    remove() {
      this.$store.dispatch("tracks/remove", this.track[".key"])
    },
  },
}
</script>
