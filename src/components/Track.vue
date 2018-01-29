<template>
  <v-chip class="track" color="primary" text-color="white" :data-key="track['.key']">
    {{ track.name }}
  </v-chip>
</template>

<script>
export default {
  name: "Track",
  props: {
    track: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss">
</style>
