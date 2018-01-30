<template>
  <v-chip class="role" outline color="accent" :data-key="role['.key']" @contextmenu="openMenu">
    {{ role.name }}

    <ContextMenu @remove="$emit('remove')" ref="menu" />
  </v-chip>
</template>

<script>
import ContextMenu from "@/components/ContextMenu"

export default {
  name: "Role",
  components: { ContextMenu },

  props: {
    role: {
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
