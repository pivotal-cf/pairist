<template>
  <v-flex xs12>
    <v-card
      class="lane"
      color="blue-grey lighten-4"
    >
      <v-card-text v-if="toggleLockLane">
        <v-layout row justify-space-between>
          <v-flex>
            <Person
              class="level-item"
              v-for="person in lane.people"
              :person="person"
              :key="person['.key']"
            />
          </v-flex>
          <v-flex class="text-xs-right">
            <Role
              class="level-item"
              v-for="role in lane.roles"
              :role="role"
              :key="role['.key']"
            />
            <TrackComponent
              class="level-item"
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
      </v-card-text>
    </v-card>
  </v-flex>
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
  height: 150px !important;

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
