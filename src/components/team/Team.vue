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
        <LaneList class="xs12 md5 order-xs1 order-md2" />
        <Sidebar class="xs12 md3 order-xs2 order-md2"/>
      </v-layout>
    </v-container>

    <Notification/>
    <DraggingController :draggables="['person', 'track', 'role']"
                        v-if="canWrite" />


    <v-snackbar class="history-notification" :timeout="0" color="info" bottom
                vertical auto-height :value="showingDate !== null">
      <h3>Browsing history</h3>
      <p>
        You're viewing a snapshot from <strong>{{ showingDate }}</strong>.
        <br >
        Editing is allowed, but if you do it may affect recommendations for the
        present state.
      </p>

      <v-btn flat @click="resetDate">
        <v-icon>refresh</v-icon>
        Go back
      </v-btn>
    </v-snackbar>

    <v-system-bar class="history-bar" color="secondary" lights-out status fixed height="32">
      <v-icon>history</v-icon>
      <v-slider class="history-slider" v-model="stateToShow" thumb-label step="1" max="0" :min="-dateLength"
                prepend-icon="mdi-skip-previous" :prepend-icon-cb="previousDate"
                append-icon="mdi-skip-next" :append-icon-cb="nextDate"
                persistent-hint
                hide-details ticks color="accent" />
      <v-icon @click="resetDate">refresh</v-icon>
    </v-system-bar>
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
    ...mapGetters(["canWrite", "user", "offsetToShow", "showingDate"]),
    ...mapGetters("history", { history: "all" }),

    stateToShow: {
      get() { return this.offsetToShow },
      set(value) {
        this.$store.dispatch("loadState", value)
      },
    },

    dateLength() {
      return Math.min(this.history.length, 14)
    },
  },

  methods: {
    nextDate() {
      if (this.stateToShow < 0) {
        this.stateToShow += 1
      }
    },

    previousDate() {
      if (this.stateToShow > -this.dateLength) {
        this.stateToShow -= 1
      }
    },

    resetDate() {
      this.$store.dispatch("loadState", 0)
    },
  },
}
</script>

<style lang="scss">
#app {
  overflow-x: hidden;
}

.phase-out {
  position: relative;
}

.phase-out:after {
  content: '\A';
  position: absolute;
  width: 100%;
  height:100%;
  top:0;
  left:0;
  background:rgba(0,0,0,0.1);
  opacity: 1;
}

.phase-in {
}

.history-bar {
  z-index: 2000;
  top: unset;
  bottom: 0;

  .icon {
    font-size: 26px;
  }

}

.history-notification {
  .btn {
    margin-top: -24px !important;
    margin-bottom: 24px !important;
  }
}

.history-slider {
  padding: 0;

  .slider {
    margin: 0 !important;
  }
}
</style>
