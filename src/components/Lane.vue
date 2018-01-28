<template>
  <div
    class="level box lane"
    :data-key="lane['.key']"
  >
    <div class="level-left">
      <Person
        class="level-item"
        v-for="person in lane.people"
        :person="person"
        :key="person['.key']"
      />
    </div>

    <div class="level-right">
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

      <button
        class="button is-small"
        :class="{ 'is-danger': lane.locked }"
        v-if="toggleLockLane"
        @click="toggleLock"
      >
        <b-icon :icon="lane.locked ? 'lock' : 'lock-open'"/>
      </button>
    </div>
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
  height: 100px;
  margin-bottom: 1.0rem;
}
</style>
