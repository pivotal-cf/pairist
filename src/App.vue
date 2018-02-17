<template>
  <v-app id="app">
    <template v-if="dbSchema">
      <template v-if="!migrating && dbSchemaVersion === appSchemaVersion">
        <router-view :key="$route.fullPath" />
        <Update v-if="localVersion < remoteVersion" />
      </template>
      <Migrating v-else/>
    </template>
    <Loading v-else/>
  </v-app>
</template>

<script>
import Migrating from "@/components/Migrating"
import Loading from "@/components/Loading"
import Update from "@/components/Update"
import { mapGetters } from "vuex"

export default {
  components: { Migrating, Loading, Update },

  computed: {
    ...mapGetters([
      "migrating", "appSchemaVersion", "dbSchemaVersion", "dbSchema",
      "localVersion", "remoteVersion",
    ]),
  },

  watch: {
    dbSchemaVersion() {
      this.checkVersion()
    },

    migrating() {
      this.checkVersion()
    },
  },

  methods: {
    checkVersion() {
      if (this.dbSchemaVersion > this.appSchemaVersion && !this.migrating) {
        location.reload(true)
      }
    },
  },
}
</script>
