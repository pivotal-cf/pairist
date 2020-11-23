<template>
  <v-snackbar
    v-model="show"
    :timeout="0"
    color="info"
    multi-line
    top
  >
    <span>
      This hosted instance of Pairist will shut down on February 1, 2021. To continue using Pairist,
      <a style="color: inherit" href="https://github.com/pivotal-cf/pairist/wiki/Sunsetting-pair.ist" target="_blank">see here for more info</a>
      about deploying your own instance.
    </span>

    <v-btn
      dark
      flat
      @click.native="show = false"
    >
      <v-icon dark>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  data () {
    return {
      show: true,
    }
  },
}
</script>
