<template>
  <v-content>
    <Toolbar :team-name="$route.params.team.toUpperCase()" />

    <v-container class="dropzone" pt-0 pb-0 fluid fill-height>
      <v-layout row wrap>
        <Lists class="xs12 md4" />
        <LaneList class="xs12 md4" />
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
import Lists from "./Lists"
import LaneList from "./LaneList"
import Sidebar from "./Sidebar"
import Toolbar from "./Toolbar"

export default {
  components: {
    Notification,

    DraggingController, LaneList, Sidebar, Toolbar, Lists,
  },
}
</script>

<style lang="scss">
#app {
  overflow-x: hidden;
}
</style>
