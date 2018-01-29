<template>
  <div>
    <v-list-tile
      ripple
      class="lane"
    >
      <v-layout row justify-space-between>
        <v-flex >
          <Person
            v-for="person in lane.people"
            :person="person"
            :key="person['.key']"
          />
        </v-flex>
        <v-flex class="text-xs-right">
          <Role
            v-for="role in lane.roles"
            :role="role"
            :key="role['.key']"
          />
          <TrackComponent
            v-for="track in lane.tracks"
            :track="track"
            :key="track['.key']"
          />
        </v-flex>
        <v-btn
          class="lock-button"
          :class="{'is-locked': lane.locked}"
          dark
          fab
          small
          :color="lane.locked? 'pink' : 'secondary'"
          @click="toggleLock"
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
import Person from "@/components/Person"
import Role from "@/components/Role"
import TrackComponent from "@/components/Track"

export default {
  name: "Lane",
  components: {
    Person, Role, TrackComponent,
  },
  props: {
    lane: {
      type: Object,
      required: true,
    },
    toggleLockLane: {
      type: Function,
      required: false,
      default: undefined,
    },
    divider: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  methods: {
    toggleLock() {
      this.toggleLockLane(this.lane)
    },
  },
}
</script>

<style lang="scss">
.lane.drop-target {
  background-color: hsl(0, 0%, 97%);
}

.lane {
  height: 140px !important;

  .list__tile {
  height: auto;
  padding: 10px;

  .list__tile__content {
    overflow: visible !important;
  }
}

  &:hover .lock-button {
    opacity: 1,
  }

  .lock-button {
    transition: opacity .1s linear;
    opacity: 0;
    position: absolute;
    top: 35%;
    right: -30px;

    &.is-locked {
      opacity: 1;
    }
  }
}
</style>
