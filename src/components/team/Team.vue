<template>
  <v-content>
    <router-view/>

    <Notification/>
    <DraggingController :draggables="['person', 'track', 'role']"
                        v-if="canWrite" />


    <v-snackbar class="history-notification" :timeout="0" color="info" bottom
                vertical auto-height :value="showingDate !== null" v-if="showingDate">
      <h3>Browsing history from {{ showingDate | moment("calendar") }}</h3>
      <p>
        Editing may affect recommendations for the present state.
      </p>

      <v-btn flat
             :to="{ name: 'TeamCurrent', params: { team: $route.params.team } }">
        <v-icon>refresh</v-icon>
        Go back
      </v-btn>
    </v-snackbar>

    <v-system-bar class="history-bar" color="secondary" lights-out status fixed height="32">
      <div class="history-viewport">
        <div class="history-entries">
          <router-link active-class="accent"
                       :to="{ name: 'TeamCurrent', params: { team: $route.params.team } }">
            current
          </router-link>
          <router-link v-for="h in history" :key="h['.key']" active-class="accent"
                       :to="{ name: 'TeamHistory', params: { team: $route.params.team, date: h['.key'] } }">
            {{ toDate(h['.key']) | moment("calendar") }}
          </router-link>
        </div>
      </div>
    </v-system-bar>
  </v-content>
</template>

<script>
import Notification from "@/components/Notification"

import DraggingController from "./DraggingController"

import { mapGetters } from "vuex"

export default {
  components: { Notification, DraggingController },

  computed: {
    history() {
      const history = this.$store.getters["history/all"]
      return history
        .slice(Math.max(history.length - 10, 1))
        .reverse()
    },

    ...mapGetters(["canWrite", "user", "showingDate"]),
  },

  async beforeRouteEnter(to, from, next) {
    next(async vm => (await vm.loadTeam(to.params.team, to.params.date)))
  },

  async beforeRouteUpdate(to, from, next) {
    await this.loadTeam(to.params.team, to.params.date)
    next()
  },

  methods: {
    async loadTeam(name, date) {
      await this.$store.dispatch("loadTeam", name)
      await this.$store.dispatch("loadState", date || "current")
    },

    toDate(value) {
      const date = this.$store.getters.toDate(value)
      return date
    },
  },
}
</script>

<style lang="stylus">
#app
  overflow-x: hidden

.history-bar
  z-index: 999
  top: unset
  bottom: 0
  direction: rtl
  overflow: hidden
  white-space: nowrap

  .history-viewport
    position: relative
    height: 100%
    width: 100%

    .history-entries
      overflow: auto
      overflow-x: auto
      overflow-y: hidden
      position: absolute
      top: 0
      left: 0
      right: 0
      bottom: -100px

      a
        direction: ltr
        height: 100%
        padding: 9px 12px
        justify-content: center
        text-decoration: none
        display: inline-flex
        flex: 0 1 auto
        font-size: 14px
        font-weight: 500
        line-height: normal
        text-align: center
        text-transform: uppercase
        vertical-align: middle

        &.accent
          color: white

.history-notification
  z-index: 998

  .btn
    margin-top: -12px !important
    margin-bottom: 24px !important

.history-slider
  padding: 0;

  .slider
    margin: 0 !important;
</style>
