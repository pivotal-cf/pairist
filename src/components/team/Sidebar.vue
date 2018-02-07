<template>
  <v-flex>
    <div class="elevation-8 background sidebar">
      <div class="tracks unassigned">
        <h2>
          Tracks
          <v-dialog v-model="newTrackDialog" max-width="300px">
            <v-btn color="secondary" small dark slot="activator" icon>
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
                        @keyup.native.enter="addTrack"
                        autofocus
                        required/>
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

        <TrackComponent
          v-for="track in unassignedTracks"
          :track="track"
          :key="track['.key']"
        />
      </div>

      <div class="roles unassigned">
        <h2>
          Roles
          <v-dialog v-model="newRoleDialog" max-width="300px">
            <v-btn color="secondary" small dark slot="activator" icon>
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
                        @keyup.native.enter="addRole"
                        autofocus
                        required/>
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

        <Role
          v-for="role in unassignedRoles"
          :role="role"
          :key="role['.key']"
        />
      </div>

      <div class="people unassigned">
        <h2>
          People
          <v-btn color="secondary" small dark @click="openPersonDialog" icon>
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        <PersonDialog ref="personDialog" :action-type="'New'"/></h2>
        <Person
          v-for="person in unassignedPeople"
          :person="person"
          :key="person['.key']"
        />
      </div>

      <div
        class="people out dropzone"
        :data-key="constants.LOCATION.OUT"
      >
        <h2>PM / Out</h2>

        <Person
          v-for="person in outPeople"
          :person="person"
          :key="person['.key']"
        />
      </div>
    </div>
  </v-flex>
</template>

<script>
import Person from "./Person"
import PersonDialog from "./PersonDialog"
import Role from "./Role"
import TrackComponent from "./Track"

import constants from "@/lib/constants"

import { mapGetters } from "vuex"

export default {
  name: "Sidebar",
  components: {
    Notification,
    Person,
    PersonDialog,
    Role,
    TrackComponent,
  },

  data() {
    return {
      newTrackDialog: false,
      newRoleDialog: false,
      newTrackName: "",
      newRoleName: "",
      constants: constants,
    }
  },

  computed: {
    ...mapGetters("people",{
      unassignedPeople: "unassigned",
      outPeople: "out",
    }),
    ...mapGetters("tracks",{ unassignedTracks: "unassigned" }),
    ...mapGetters("roles",{ unassignedRoles: "unassigned" }),
  },

  methods: {
    openPersonDialog() {
      this.$refs.personDialog.open()
    },

    addTrack() {
      this.$store.dispatch("tracks/add", { name: this.newTrackName })

      this.newTrackDialog = false
      this.newTrackName = ""
    },

    addRole() {
      this.$store.dispatch("roles/add", { name: this.newRoleName })

      this.newRoleDialog = false
      this.newRoleName = ""
    },
  },
}
</script>

<style lang="scss">
.people.unassigned {
  min-height: 221px;
}

.tracks.unassigned {
  min-height: 136px;
}

.roles.unassigned {
  min-height: 122px;
}

.out {
  flex: 1 1 auto;
  min-height: 221px;
}

#app .sidebar {
  display: flex;
  flex-flow: column;
  padding: 10px;

  @media (min-width: 960px) {
    position: relative;
    margin-left: 30px;
    height:100%;
    width: 100%;
  }
}
</style>
