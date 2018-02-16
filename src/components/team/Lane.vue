<template>
  <div class="lane"
       :class="{
         'phase-out': dragging && dropTarget !== lane['.key'],
         'phase-in': dragging && dropTarget === lane['.key'],
  }">
    <v-list-tile ripple background>
      <v-layout row wrap>
        <v-flex order-xs2 xs12 order-lg1 lg6>
          <Person
            v-for="person in lane.people"
            :person="person"
            :key="person['.key']"
          />
        </v-flex>
        <v-flex text-xs-left
                text-lg-right
                order-xs1
                xs12 order-lg2
                lg6>
          <Chip
            v-for="role in lane.roles"
            :chip="role"
            chip-class="role"
            outline
            @remove="removeRole"
            :key="role['.key']"
          />
          <Chip
            v-for="track in lane.tracks"
            :chip="track"
            chip-class="track"
            text-color="white"
            @remove="removeTrack"
            :key="track['.key']"
          />
        </v-flex>
        <v-btn
          class="lock-button"
          :class="{'is-locked': lane.locked}"
          dark
          fab
          small
          :color="lane.locked? 'pink' : 'accent'"
          @click="setLocked({ key: lane['.key'], locked: !lane.locked })"
          v-if="canWrite && lane['.key'] !== 'new-lane'"
        >
          <v-icon v-if="lane.locked">mdi-lock</v-icon>
          <v-icon v-else>mdi-lock-open</v-icon>
        </v-btn>
      </v-layout>
    </v-list-tile>
    <v-divider v-if="divider" />
  </div>
</template>

<script>
import Person from "./Person"
import Chip from "./Chip"

import {
  mapActions,
  mapGetters,
} from "vuex"

export default {
  components: {
    Person, Chip,
  },
  props: {
    lane: {
      type: Object,
      required: true,
    },
    divider: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  computed: {
    ...mapGetters(["canWrite", "dragging", "dropTarget"]),
  },

  methods: {
    ...mapActions("lanes", ["setLocked"]),
    ...mapActions("tracks", { removeTrack: "remove" }),
    ...mapActions("roles", { removeRole: "remove" }),
  },
}
</script>

<style lang="scss">
.lane li {

  @media (min-width: 960px) {
    min-height: 121px !important;
  }

  .list__tile {
    height: auto;
    padding: 0 5px 5px 10px;

    .list__tile__content {
      overflow: visible !important;
    }
  }

  &:hover .lock-button {
    opacity: 1,
  }

  .lock-button {
    transition: opacity .1s linear;
    position: absolute;
    bottom: 10px;
    right: 10px;

    @media (min-width: 960px) {
      opacity: 0;
      top: 33px;
      right: -30px;
    }

    &.is-locked {
      opacity: 1;
    }
  }
}
</style>
