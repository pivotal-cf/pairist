<template>
  <transition name="highlight">
    <v-chip
      color="accent"
      :class="chipClass"
      :outline="outline"
      :text-color="textColor"
      :data-key="chip['.key']"
      @contextmenu="openMenu">
      <span>{{ chip.name }}</span>
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
    chip: {
      type: Object,
      required: true,
    },
    chipClass: {
      type: String,
      required: true,
    },
    outline: {
      type: Boolean,
      default: false,
    },
    textColor: {
      type: String,
      default: "",
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
      this.$emit("remove", this.chip[".key"])
    },
  },
}
</script>
