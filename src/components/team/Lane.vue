<template>
  <div
    :class="{
      'phase-out': dragging && dropTarget !== lane['.key'],
      'phase-in': dragging && dropTarget === lane['.key'],
    }"
    class="lane"
  >
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
            :key="role['.key']"
            :chip="role"
            chip-class="role"
            outline
          />
          <Chip
            v-for="track in lane.tracks"
            :key="track['.key']"
            :chip="track"
            chip-class="track"
            text-color="white"
          />
        </v-flex>
        <v-btn
          v-if="canWrite && lane['.key'] !== 'new-lane'"
          class="close-button"
          dark fab small
          @click="closeLane({ key: lane['.key']})"
        >
          <v-icon>close</v-icon>
        </v-btn>
        <v-btn
          v-if="canWrite && lane['.key'] !== 'new-lane'"
          :class="{'is-locked': lane.locked}"
          :color="lane.locked? 'pink' : 'accent'"
          dark fab small
          class="lock-button"
          @click="setLocked({ key: lane['.key'], locked: !lane.locked })"
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
    divider: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  computed: {
    ...mapGetters(['canWrite', 'dragging', 'dropTarget']),
  },

  methods: {
    ...mapActions('lanes', ['setLocked']),
    closeLane ({ key }) {
      this.$store.dispatch('entities/resetLocation', key)
    },
  },
}
</script>

<style lang="stylus">
.lane li

  @media (min-width: 960px)
    min-height: 121px !important

  .list__tile
    height: auto
    padding: 0 5px 5px 10px

    .list__tile__content
      overflow: visible !important

  &:hover .close-button
    opacity: 1

  .close-button
    transition: opacity .1s linear
    position: absolute
    bottom: 55px
    right: 10px

    @media (min-width: 960px)
      opacity: 0
      top: 80px
      right: -30px

  &:hover .lock-button
    opacity: 1

  .lock-button
    transition: opacity .1s linear
    position: absolute
    bottom: 10px
    right: 10px

    @media (min-width: 960px)
      opacity: 0
      top: 33px
      right: -30px

    &.is-locked
      opacity: 1
</style>
