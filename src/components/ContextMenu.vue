<template>
  <v-menu class="context-menu" offset-y v-model="showMenu" absolute :position-x="x" :position-y="y">
    <v-list>
      <v-list-tile @click="$emit('remove')">
        <v-list-tile-title>
          Remove
          <v-icon>mdi-delete</v-icon>
        </v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "ContextMenu",
  data() {
    return {
      showMenu: false,
      x: 0,
      y: 0,
    }
  },

  methods: {
    open(event) {
      event.preventDefault()
      this.showMenu = false
      this.x = event.clientX
      this.y = event.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
  },
}
</script>

<style lang="scss">
.context-menu.menu {
  display: none !important;
}
</style>
