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
      <v-tooltip bottom open-delay="200" content-class="accent">
        <v-btn
          tag="a" href="https://medium.com/pairist" target="_blank"
          flat slot="activator"
        >
          <v-icon dark>help</v-icon>
        </v-btn>
        <span>Pair.ist blog. Leave us feedback and catch up on the latest updates</span>
      </v-tooltip>

      <v-tooltip bottom open-delay="200" content-class="accent">
        <v-btn
          :disabled="loading || showingDate !== null"
          @click="recommendPairs"
          flat slot="activator"
          v-if="canWrite"
        >
          <v-icon dark>mdi-shuffle-variant</v-icon>
        </v-btn>
        <span>Recommend pairs (optimizing for more variability in individual pairings)</span>
      </v-tooltip>
      <v-tooltip bottom open-delay="200" content-class="accent">
        <v-btn
          :disabled="loading || showingDate !== null"
          @click="saveHistory"
          flat slot="activator"
          v-if="canWrite"
        >
          <v-icon dark>mdi-content-save</v-icon>
        </v-btn>
        <span>Save history. This is required to ensure future accuracy in recommendations</span>
      </v-tooltip>
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

      <v-tooltip v-else bottom content-class="accent">
        <v-btn flat slot="activator"
               @click="$router.push('/')">
          <v-icon dark>mdi-login</v-icon>
        </v-btn>
        <span>Login</span>
      </v-tooltip>
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
    ...mapGetters(["canWrite", "loading", "user", "showingDate"]),
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

<style lang="stylus">
#app .logo
  background-image: url("~@/assets/pairist.svg")
  background-size: 45px
  background-repeat: no-repeat
  background-position: 10px 50%
  padding-left: 40px !important
</style>
