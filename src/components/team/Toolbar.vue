<template>
  <v-toolbar class="primary logo" fixed dark flat app>
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
        <v-switch
          slot="activator"
          :hide-details="true"
          :disabled="!canWrite"
          :label="publicRO ? 'Public' : 'Private'"
          v-model="publicRO"
        />
        <span>Make team publicly read-only</span>
      </v-tooltip>
    </v-flex>

    <v-btn
      v-if="!user"
      flat
      class="warning"
      @click="$router.push('/')"
    >
      You are not logged in. Viewing in read-only mode.
    </v-btn>

    <v-spacer class="ml-3">
      <v-progress-linear v-if="loading" indeterminate class="d-inline-flex" color="accent"/>
    </v-spacer>

    <v-toolbar-items>
      <v-tooltip bottom open-delay="200" content-class="accent">
        <v-btn
          slot="activator"
          tag="a" flat
          href="https://medium.com/pairist"
          target="_blank"
        >
          <v-icon dark>help</v-icon>
        </v-btn>
        <span>Pair.ist blog. Leave us feedback and catch up on the latest updates</span>
      </v-tooltip>

      <v-tooltip bottom open-delay="200" content-class="accent">
        <v-btn
          v-if="canWrite"
          slot="activator"
          :disabled="loading || showingDate !== null"
          flat
          @click="recommendPairs"
        >
          <v-icon dark>mdi-shuffle-variant</v-icon>
        </v-btn>
        <span>Recommend pairs (optimizing for more variability in individual pairings)</span>
      </v-tooltip>
      <v-menu v-if="user" bottom left>
        <v-btn slot="activator" pa-0 flat dark>
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
      <v-btn
        v-else
        flat
        @click="$router.push('/')"
      >
        <v-icon dark>mdi-login</v-icon>
        Login
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>

import {
  mapGetters,
  mapActions,
} from 'vuex'

export default {
  props: {
    teamName: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapGetters(['canWrite', 'loading', 'user', 'showingDate']),
    publicRO: {
      get () { return this.$store.getters.publicRO },
      set (value) { this.$store.dispatch('setPublic', value) },
    },
  },

  methods: {
    ...mapActions(['recommendPairs', 'logout']),

    saveHistory () {
      this.$store.dispatch('history/save')
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

  .v-input--switch__thumb
    box-shadow: none
</style>
