<template>
  <v-menu class="context-menu" offset-y v-model="showMenu" absolute :position-x="x" :position-y="y">
    <v-list v-if="showMenu">
      <v-list-tile @click="$emit('edit')" v-if="showEdit">
        <v-list-tile-title>
          <v-icon>mdi-pencil</v-icon>
          Edit
        </v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="dialog = true">
        <v-list-tile-title>
          <v-icon>mdi-delete</v-icon>
          Remove
        </v-list-tile-title>
      </v-list-tile>
    </v-list>

    <v-dialog v-if="dialog" v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="secondary darken-1" flat="flat" @click.native="dialog = false">No</v-btn>
          <v-btn color="secondary darken-1" flat="flat" @click.native="confirmRemove">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-menu>
</template>

<script>
export default {
  props: {
    showEdit: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showMenu: false,
      x: 0,
      y: 0,
      dialog: false,
    }
  },

  watch: {
    dialog(value) {
      if (value) {
        window.addEventListener("keyup", this.handleKeyPress)
      } else {
        window.removeEventListener("keyup", this.handleKeyPress)
      }
    },
  },

  methods: {
    handleKeyPress(event) {
      if (event.keyCode == 13 && this.dialog === true) {
        this.confirmRemove()
      } else if (event.keyCode === 27) {
        this.dialog = false
      }
    },

    open(event) {
      event.preventDefault()
      this.showMenu = false
      this.x = event.clientX
      this.y = event.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },

    confirmRemove() {
      this.dialog = false
      this.$emit("remove")
    },
  },
}
</script>

<style lang="scss">
.context-menu.menu {
  display: none !important;
}
</style>
