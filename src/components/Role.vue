<template>
  <transition name="highlight">
    <v-chip class="role" outline color="accent" :data-key="role['.key']" @contextmenu="openMenu">
      <span>{{ role.name }}</span>
      <ContextMenu @remove="remove" ref="menu" />
    </v-chip>
  </transition>
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

    remove() {
      this.$store.dispatch("removeRole", this.role[".key"])
    },
  },
}
</script>
