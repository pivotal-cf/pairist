<template>
  <v-flex>
    <div class="elevation-8 background sidebar">
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
          'phase-out': dragging && dropTarget !== constants.LOCATION.OUT,
          'phase-in': dragging && dropTarget === constants.LOCATION.OUT
        }"
        :data-key="constants.LOCATION.OUT"
        class="background people out dropzone"
      >
        <h2>PM / Out</h2>

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

    ...mapGetters('entities', ['out', 'unassigned']),
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
.people.unassigned
  min-height: 221px

.tracks.unassigned
  min-height: 6rem

.roles.unassigned
  min-height: 6rem

.unassigned
  padding: 10px

.out
  flex: 1 1 auto
  min-height: 221px
  padding: 10px

#app .sidebar
  display: flex
  flex-flow: column

  @media (min-width: 960px)
    position: relative
    margin-left: 30px
    height:100%
    width: 100%
</style>
