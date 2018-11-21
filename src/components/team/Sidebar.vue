<template>
  <v-flex>
    <div class="background sidebar">
      <div
        :class="{
          'phase-out': dragging && dropTarget,
          'phase-in': dragging && !dropTarget
        }"
        class="background tracks unassigned"
      >
        <h2>
          Tracks
          <v-btn
            v-if="canWrite"
            color="secondary" small dark icon
            @click="openTrackDialog"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <ChipDialog ref="trackDialog" :entity="{ type: 'track' }" action-type="New" />
        </h2>

        <Chip
          v-for="track in unassigned('track')"
          :key="track['.key']"
          :entity="track"
          chip-class="track"
          @remove="remove"
        />
      </div>

      <div
        :class="{
          'phase-out': dragging && dropTarget,
          'phase-in': dragging && !dropTarget
        }"
        class="background roles unassigned"
      >
        <h2>
          Roles
          <v-btn
            v-if="canWrite"
            color="secondary" small dark icon
            @click="openRoleDialog"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <ChipDialog ref="roleDialog" :entity="{ type: 'role' }" action-type="New" />
        </h2>

        <Chip
          v-for="role in unassigned('role')"
          :key="role['.key']"
          :entity="role"
          chip-class="role"
          @remove="remove"
        />
      </div>

      <div
        :class="{
          'phase-out': dragging && dropTarget,
          'phase-in': dragging && !dropTarget
        }"
        class="background people unassigned"
      >
        <h2>
          People
          <v-btn
            v-if="canWrite"
            color="secondary" small dark icon
            @click="openPersonDialog"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        <PersonDialog ref="personDialog" action-type="New"/></h2>
        <Person
          v-for="person in unassigned('person')"
          :person="person"
          :key="person['.key']"
        />
      </div>

      <div
        :class="{
          'phase-out': dragging && dropTarget !== constants.LOCATION.PM,
          'phase-in': dragging && dropTarget === constants.LOCATION.PM
        }"
        :data-key="constants.LOCATION.PM"
        class="background people pm dropzone"
      >
        <h2>PM</h2>

        <Person
          v-for="person in pm('person')"
          :person="person"
          :key="person['.key']"
        />
      </div>

      <div
        :class="{
          'phase-out': dragging && dropTarget !== constants.LOCATION.OUT,
          'phase-in': dragging && dropTarget === constants.LOCATION.OUT
        }"
        :data-key="constants.LOCATION.OUT"
        class="background people out dropzone"
      >
        <h2>Out</h2>

        <Person
          v-for="person in out('person')"
          :person="person"
          :key="person['.key']"
        />
      </div>
    </div>
  </v-flex>
</template>

<script>
import Person from './Person'
import PersonDialog from './PersonDialog'
import ChipDialog from './ChipDialog'
import Chip from './Chip'

import constants from '@/lib/constants'

import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    Person,
    PersonDialog,
    ChipDialog,
    Chip,
  },

  data () {
    return {
      newTrackName: '',
      newRoleName: '',
      constants: constants,
    }
  },

  computed: {
    ...mapGetters(['canWrite', 'dragging', 'dropTarget']),

    ...mapGetters('entities', ['pm', 'out', 'unassigned']),
  },

  methods: {
    openPersonDialog () {
      this.$refs.personDialog.open()
    },

    openTrackDialog () {
      this.$refs.trackDialog.open()
    },

    openRoleDialog () {
      this.$refs.roleDialog.open()
    },

    ...mapActions('entities', ['remove']),
  },
}
</script>

<style lang="stylus">

#app .sidebar
  display: flex
  flex-flow: column

  .people.pm
    min-height: 221px

  .people.unassigned
    min-height: 221px

  .tracks.unassigned
    min-height: 6rem

  .roles.unassigned
    min-height: 6rem

  .unassigned, .pm, .out
    padding: 15px
    padding-left: 30px

  .pm
    border-top: 1px dashed rgba(0, 0, 0, 0.15) !important

  .out
    background: rgba(150, 0, 0, 0.03) !important
    border-top: 1px dashed rgba(150, 0, 0, 0.5) !important
    flex: 1 1 auto
    min-height: 221px

  @media (min-width: 960px)
    position: relative
    height:100%
    width: 100%
</style>
