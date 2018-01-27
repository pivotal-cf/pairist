<template>
  <b-tag
    class="track"
    type="is-primary"
    size="is-large"
    :data-key="track['.key']"
  >
    {{ track.name }}
  </b-tag>
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

<style scoped lang="scss">
.track {
  margin-right: 0.50rem !important;
}
</style>
