<template>
  <v-toolbar
    class="primary logo"
    fixed
    dark
    app
  >
    <v-toolbar-title>
      <span>
        Pairist
      </span>
      <span v-if="teamName !== ''">
        - {{ teamName }}
      </span>
    </v-toolbar-title>
    <v-flex xs2 ml-3>
      <v-tooltip bottom open-delay="200" content-class="accent">
        <v-switch :hide-details="true" :disabled="!canWrite"
                  :label="publicRO ? 'Public' : 'Private'"
                  v-model="publicRO" slot="activator" />
        <span>Make team publicly read-only</span>
      </v-tooltip>
    </v-flex>

    <v-spacer class="ml-3">
      <v-progress-linear indeterminate v-if="loading" class="d-inline-flex" color="accent"/>
    </v-spacer>

    <v-toolbar-items>
      <v-btn
        :disabled="loading"
        @click="recommendPairs"
        flat
        v-if="canWrite"
      >
        <v-tooltip bottom open-delay="200" content-class="accent">
          <v-icon dark slot="activator">mdi-shuffle-variant</v-icon>
          <span>Recommend pairs (optimizing for more variability in individual pairings</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        :disabled="loading"
        @click="saveHistory"
        flat
        v-if="canWrite"
      >
        <v-tooltip bottom open-delay="200" content-class="accent">
          <v-icon dark slot="activator">mdi-content-save</v-icon>
          <span>Save history. This required to ensure future accuracy in recommendations</span>
        </v-tooltip>
      </v-btn>
      <v-menu bottom left v-if="user">
        <v-btn pa-0 flat slot="activator" dark>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="logout">
            <v-list-tile-title>
              Logout <v-icon>mdi-logout</v-icon>
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>

import {
  mapGetters,
  mapActions,
} from "vuex"

export default {
  props: {
    teamName: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapGetters(["canWrite", "loading", "user"]),
    publicRO: {
      get() { return this.$store.getters.publicRO },
      set(value) { this.$store.dispatch("setPublic", value) },
    },
  },

  methods: {
    ...mapActions(["recommendPairs", "logout"]),

    saveHistory() {
      this.$store.dispatch("history/save")
    },
  },
}
</script>

<style lang="scss">
#app .logo {
  background-image: url("~@/assets/pairist.svg");
  background-size: 45px;
  background-repeat: no-repeat;
  background-position: 10px 50%;
  padding-left: 40px !important;
}
</style>
