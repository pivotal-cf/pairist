<template>
  <v-snackbar
    :timeout="3000"
    :color="snackbarColor"
    v-model="snackbarText"
    top
  >
    {{ snackbarText }}
    <v-btn
      dark
      flat
      @click.native="clearNotification"
    >
      <v-icon dark>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
import {
  mapGetters,
  mapActions,
} from "vuex"

export default {
  computed: {
    snackbarText: {
      get() { return this.$store.getters.snackbarText },
      set(value) {
        if (value === false) {
          this.clearNotification()
        }
      },
    },

    ...mapGetters(["snackbarColor"]),
  },

  methods: {
    ...mapActions(["clearNotification"]),
  },
}
</script>
