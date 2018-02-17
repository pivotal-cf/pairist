<template>
  <v-app id="app">
    <template v-if="dbSchema">
      <router-view :key="$route.fullPath"
                   v-if="!migrating && dbSchemaVersion === appSchemaVersion"
      />
      <Migrating v-else/>
    </template>
    <Loading v-else/>
  </v-app>
</template>

<script>
import Migrating from "@/components/Migrating"
import Loading from "@/components/Loading"
import { mapGetters } from "vuex"

export default {
  components: { Migrating, Loading },

  computed: {
    ...mapGetters(["migrating", "appSchemaVersion", "dbSchemaVersion", "dbSchema"]),
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
