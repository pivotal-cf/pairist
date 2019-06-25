<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card v-if="dialog">
      <v-card-title>
        <span class="headline">{{ actionType }} Person</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6>
              <v-text-field
                v-model="person.name"
                label="Name"
                autofocus
                required
                @keypress.enter="save"
              />
            </v-flex>
            <v-flex xs12 sm6>
              <v-text-field
                v-model="person.picture"
                type="url"
                label="Picture URL"
                @keypress.enter="save"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="error" depressed @click="confirmRemove = true">
          <v-icon>mdi-delete-forever</v-icon>
          Remove
        </v-btn>
        <v-spacer/>
        <v-btn color="secondary darken-2" flat @click="dialog = false">Close</v-btn>
        <v-btn color="secondary darken-2 dialog-save" flat @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-if="confirmRemove" v-model="confirmRemove" hide-overlay max-width="290">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="secondary darken-1" flat="flat" @click="confirmRemove = false">No</v-btn>
          <v-btn color="secondary darken-1" flat="flat" @click="remove">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
export default {
  props: {
    actionType: {
      type: String,
      default: 'Edit',
    },
    person: {
      type: Object,
      default: () => ({}),
    },
  },

  data () {
    return {
      dialog: false,
      confirmRemove: false,
    }
  },

  watch: {
    confirmRemove (value) {
      if (value) {
        window.addEventListener('keyup', this.handleKeyPress)
      } else {
        window.removeEventListener('keyup', this.handleKeyPress)
      }
    },
  },

  methods: {
    handleKeyPress (event) {
      if (event.keyCode === 13 && this.dialog === true) {
        this.remove()
      } else if (event.keyCode === 27) {
        this.dialog = false
      }
    },

    async save () {
      await this.$store.dispatch('entities/save', Object.assign({ type: 'person' }, this.person))

      this.dialog = false
      this.person.name = ''
      this.person.picture = ''
    },

    open () {
      this.dialog = true
    },

    remove () {
      this.$store.dispatch('entities/remove', this.person['.key'])
    },
  },
}
</script>
