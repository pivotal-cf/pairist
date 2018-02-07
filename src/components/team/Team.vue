<template>
  <v-content>
    <Toolbar :team-name="teamName.toUpperCase()" />

    <v-container class="dropzone" pt-0 pb-0 fluid fill-height>
      <v-layout row wrap>
        <LaneList class="xs12 md8" />
        <Sidebar class="xs12 md4" />
      </v-layout>
    </v-container>

    <Notification/>
    <DraggingController :draggables="['person', 'track', 'role']"/>
  </v-content>
</template>

<script>
import Notification from "@/components/Notification"

import DraggingController from "./DraggingController"
import LaneList from "./LaneList"
import Sidebar from "./Sidebar"
import Toolbar from "./Toolbar"

export default {
  name: "Team",
  components: {
    Notification,

    DraggingController, LaneList, Sidebar, Toolbar,
  },

  data() {
    return {
      teamName: this.$route.params.team.toLowerCase(),
    }
  },
}
</script>

<style lang="scss">
#app {
  overflow-x: hidden;
}
</style>
