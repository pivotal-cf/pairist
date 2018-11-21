<template>
  <div
    :class="{
      'phase-out': dragging && dropTarget !== lane['.key'],
      'phase-in': dragging && dropTarget === lane['.key'],
    }"
    class="lane"
  >
    <v-list-tile class="inner-lane" ripple background>
      <v-flex order-xs2 xs12 order-lg1 lg6>
        <v-list-tile-title v-if="last && dragging" class="grey--text add-lane display-1 pa-4">
          <v-icon x-large>mdi-playlist-plus</v-icon> Add Lane
        </v-list-tile-title>
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
          :key="role['.key']"
          :entity="role"
          chip-class="role"
        />
        <Chip
          v-for="track in lane.tracks"
          :key="track['.key']"
          :entity="track"
          chip-class="track"
        />
      </v-flex>
      <v-tooltip
        v-if="canWrite && lane['.key'] !== 'new-lane'"
        class="lock-button" right>
        <v-btn
          slot="activator"
          :class="{'is-locked': lane.locked}"
          :color="lane.locked? 'pink' : 'accent'"
          dark fab small
          @click="setLocked({ key: lane['.key'], locked: !lane.locked })"
        >
          <v-icon v-if="lane.locked">mdi-lock</v-icon>
          <v-icon v-else>mdi-lock-open</v-icon>
        </v-btn>
        <span v-if="lane.locked">Unlock lane</span>
        <span v-else>Lock lane</span>
      </v-tooltip>
      <v-tooltip
        v-if="canWrite && lane['.key'] !== 'new-lane'"
        class="sweep-button" right>
        <v-btn
          slot="activator"
          dark fab small
          @click="sweepLane({ key: lane['.key']})"
        >
          <v-icon>mdi-broom</v-icon>
        </v-btn>
        <span>Empty lane</span>
      </v-tooltip>
    </v-list-tile>
    <v-divider v-if="!last" />
  </div>
</template>

<script>
import Person from './Person'
import Chip from './Chip'

import {
  mapActions,
  mapGetters,
} from 'vuex'

export default {
  components: {
    Person, Chip,
  },
  props: {
    lane: {
      type: Object,
      required: true,
    },
    last: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    ...mapGetters(['canWrite', 'dragging', 'dropTarget']),
  },

  methods: {
    ...mapActions('lanes', ['setLocked']),
    sweepLane ({ key }) {
      this.$store.dispatch('entities/resetLocation', key)
    },
  },
}
</script>

<style lang="stylus">
.lane
  .add-lane
    height: auto

  @media (min-width: 960px)
    .inner-lane
      padding: 5px
      > div:first-child
        min-height: 145px !important

  .v-list__tile
    height: auto
    padding: 0 5px 5px 10px
    line-height: 0

    .v-list__tile__content
      overflow: visible !important

  &:hover .sweep-button
    opacity: 1

  .sweep-button
    transition: opacity .1s linear
    position: absolute
    bottom: 55px
    right: 10px

    @media (min-width: 960px)
      opacity: 0
      top: 50%
      right: -30px

  &:hover .lock-button button
      opacity: 1

  .lock-button button
    @media (min-width: 960px)
      opacity: 0
    &.is-locked
      opacity: 1

  .lock-button
    transition: opacity .1s linear
    position: absolute
    bottom: 10px
    right: 10px

    @media (min-width: 960px)
      top: 10%
      right: -30px

</style>
