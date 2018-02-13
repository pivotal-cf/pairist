<template>
  <v-content>
    <v-snackbar
      :timeout="0"
      color="error"
      :value="!user"
      bottom right>
      Viewing in read-only mode
    </v-snackbar>

    <Toolbar :team-name="$route.params.team.toUpperCase()" />

    <v-container class="dropzone" pt-0 pb-0 fluid fill-height>
      <v-layout row wrap>
        <Lists class="xs12 md4 order-xs3 order-md1" />
        <LaneList class="xs12 md4 order-xs1 order-md2" />
        <Sidebar class="xs12 md4 order-xs2 order-md2"/>
      </v-layout>
    </v-container>

    <Notification/>
    <DraggingController :draggables="['person', 'track', 'role']"
                        v-if="canWrite" />
  </v-content>
</template>

<script>
import Notification from "@/components/Notification"

import DraggingController from "./DraggingController"
import Lists from "./Lists"
import LaneList from "./LaneList"
import Sidebar from "./Sidebar"
import Toolbar from "./Toolbar"

import { mapGetters } from "vuex"

export default {
  components: {
    Notification,

    DraggingController, LaneList, Sidebar, Toolbar, Lists,
  },

  computed: {
    ...mapGetters(["canWrite", "user"]),
  },
}
</script>

<style lang="scss">
#app {
  overflow-x: hidden;
}
</style>
