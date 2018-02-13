<template>
  <transition name="highlight">
    <v-chip class="role" outline color="accent" :data-key="role['.key']" @contextmenu="openMenu">
      <span>{{ role.name }}</span>
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
    role: {
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
      this.$store.dispatch("roles/remove", this.role[".key"])
    },
  },
}
</script>
