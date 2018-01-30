<template>
  <v-chip class="track" color="accent" text-color="white" :data-key="track['.key']" @contextmenu="openMenu">
    {{ track.name }}

    <ContextMenu @remove="$emit('remove')" ref="menu" />
  </v-chip>
</template>

<script>
import ContextMenu from "@/components/ContextMenu"

export default {
  name: "Track",
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
  },
}
</script>
