<template>
  <v-flex class="lanes">
    <v-list
      class="py-0 dropzone"
      data-key="new-lane">
      <Lane
        v-for="lane in lanes"
        :lane="lane"
        :key="lane['.key']"
        :data-key="lane['.key']"
        class="dropzone"
      />
      <Lane
        :lane="{'.key': 'new-lane'}"
        :last="true"
        data-key="new-lane"
        class="dropzone last-lane"
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
  z-index: 1

  .v-list
    border-right: 1px solid
    border-left: 1px solid
    border-color: rgba(0, 0, 0, 0.12)
    height: 100%

  .v-divider
    max-width: calc(100% + 30px)

</style>
