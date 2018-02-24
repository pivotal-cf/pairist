<template>
  <v-flex class="lanes" elevation-2>
    <v-list class="pb-0">
      <Lane
        v-for="lane in lanes"
        :lane="lane"
        :key="lane['.key']"
        :data-key="lane['.key']"
        class="dropzone"
      />
      <Lane
        :lane="{'.key': 'new-lane'}"
        :divider="false"
        data-key="new-lane"
        class="dropzone"
      />
    </v-list>
  </v-flex>
</template>

<script>
import Lane from './Lane'

import { mapGetters } from 'vuex'

export default {
  components: { Lane },

  computed: {
    ...mapGetters('lanes', { lanes: 'all' }),
  },
}
</script>

<style lang="stylus">
#app .lanes
  height: fit-content
  padding: 0
  z-index: 1
</style>
