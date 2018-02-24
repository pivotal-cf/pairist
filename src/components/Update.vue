<template>
  <v-snackbar :timeout="0" :value="true" bottom left>
    A new version of Pair.ist is available!
    <v-btn flat color="info" @click="refresh">
      <v-icon>update</v-icon>
      UPDATE!
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  methods: {
    refresh () {
      location.reload(true)
    },
  },
}
</script>
