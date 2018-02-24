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
          <v-dialog v-model="newTrackDialog" max-width="300px">
            <v-btn
              v-if="canWrite"
              slot="activator"
              color="secondary" small dark icon
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-card v-if="newTrackDialog">
              <v-card-title>
                <span class="headline">New Track</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field
                        v-model="newTrackName"
                        label="Name"
                        autofocus
                        required
                        @keyup.enter="addTrack"
                      />
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="secondary darken-2" flat @click.native="newTrackDialog = false">Close</v-btn>
                <v-btn color="secondary darken-2" flat @click.native="addTrack">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </h2>

        <Chip
          v-for="track in unassigned('track')"
          :key="track['.key']"
          :chip="track"
          chip-class="track"
          text-color="white"
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
          <v-dialog v-model="newRoleDialog" max-width="300px">
            <v-btn
              v-if="canWrite"
              slot="activator"
              color="secondary"
              small dark icon
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-card v-if="newRoleDialog">
              <v-card-title>
                <span class="headline">New Role</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field
                        v-model="newRoleName"
                        label="Name"
                        autofocus
                        required
                        @keyup.enter="addRole"
                      />
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="secondary darken-2" flat @click.native="newRoleDialog = false">Close</v-btn>
                <v-btn color="secondary darken-2" flat @click.native="addRole">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </h2>

        <Chip
          v-for="role in unassigned('role')"
          :key="role['.key']"
          :chip="role"
          chip-class="role"
          outline
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
        <PersonDialog ref="personDialog" :action-type="'New'"/></h2>
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
import Chip from './Chip'

import constants from '@/lib/constants'

import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    Person,
    PersonDialog,
    Chip,
  },

  data () {
    return {
      newTrackDialog: false,
      newRoleDialog: false,
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

    addTrack () {
      this.$store.dispatch('entities/save', { name: this.newTrackName, type: 'track' })

      this.newTrackDialog = false
      this.newTrackName = ''
    },

    addRole () {
      this.$store.dispatch('entities/save', { name: this.newRoleName, type: 'role' })

      this.newRoleDialog = false
      this.newRoleName = ''
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
