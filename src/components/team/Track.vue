<template>
  <transition name="highlight">
    <v-chip class="track" color="accent" text-color="white" :data-key="track['.key']" @contextmenu="openMenu">
      <span>{{ track.name }}</span>
      <ContextMenu @remove="remove" ref="menu" />
    </v-chip>
  </transition>
</template>

<script>
import ContextMenu from "@/components/ContextMenu"

export default {
  components: { ContextMenu },

  props: {
    track: {
      type: Object,
      required: true,
    },
  },

  methods: {
    openMenu(event) {
      this.$refs.menu.open(event)
    },

    remove() {
      this.$store.dispatch("tracks/remove", this.track[".key"])
    },
  },
}
</script>
