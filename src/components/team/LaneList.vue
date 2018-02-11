<template>
  <v-flex class="lanes" elevation-2>
    <v-list>
      <Lane
        class="dropzone"
        v-for="lane in lanes"
        :lane="lane"
        :key="lane['.key']"
        :data-key="lane['.key']"
      />
      <Lane
        class="dropzone"
        :lane="{'.key': 'new-lane'}"
        data-key="new-lane"
        :divider="false"
      />
    </v-list>
  </v-flex>
</template>

<script>
import Lane from "./Lane"

import { mapGetters } from "vuex"

export default {
  components: { Lane },

  computed: {
    ...mapGetters("lanes", { lanes: "all" }),
  },
}
</script>

<style lang="scss">
#app .lanes {
  height: fit-content;
  padding: 0;
  z-index: 1;
}
</style>
