<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card v-if="show">
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
                @keyup.native.enter="save"
                autofocus
                required/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-text-field
                v-model="person.picture"
                @keyup.native.enter="save"
                type="url"
                label="Picture URL"/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="secondary darken-2" flat @click.native="show = false">Close</v-btn>
        <v-btn color="secondary darken-2" flat @click.native="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    actionType: {
      type: String,
      default: "Edit",
    },
    person: {
      type: Object,
      default() { return {} },
    },
  },

  data() {
    return {
      show: false,
    }
  },

  methods: {
    async save() {
      await this.$store.dispatch("entities/save", Object.assign({ type: "person" }, this.person))

      this.show = false
      this.person.name = ""
      this.person.picture = ""
    },

    open() {
      this.show = true
    },
  },
}
</script>
