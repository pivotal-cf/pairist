<template>
  <v-content>
    <v-toolbar
      class="primary logo"
      fixed
      dark
      app
    >
      <v-toolbar-title>
        Pairist
        <span v-if="team">
          - {{ teamName.toUpperCase() }}
        </span>
      </v-toolbar-title>
      <v-spacer/>
      <v-toolbar-items>
        <v-btn
          :loading="recommending"
          :disabled="recommending"
          @click="recommendPairs"
          flat
        >
          <v-icon dark>mdi-shuffle-variant</v-icon>
        </v-btn>
        <v-btn
          :loading="savingHistory"
          :disabled="savingHistory"
          @click="saveHistory"
          flat
        >
          <v-icon dark>mdi-content-save</v-icon>
        </v-btn>
        <v-menu bottom left>
          <v-btn pa-0 flat slot="activator" dark>
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile @click="logout">
              <v-list-tile-title>
                Logout <v-icon>mdi-logout</v-icon>
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>

    <v-container class="dropzone" grid-list-md fluid>
      <v-layout row wrap>
        <v-flex class="lanes" xs12 md8 elevation-2>
          <v-list>
            <Lane
              class="dropzone"
              v-for="lane in lanes"
              :lane="lane"
              :key="lane['.key']"
              :data-key="lane['.key']"
            />
            <Lane
              class="dropzone"
              :lane="{'.key': 'new-lane'}"
              data-key="new-lane"
              :divider="false"
            />
          </v-list>
        </v-flex>

        <v-flex xs12 md4>
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
              data-key="out"
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
      </v-layout>
      <v-snackbar
        :timeout="3000"
        :color="snackbarColor"
        v-model="snackbar"
        top
      >
        {{ snackbarText }}
        <v-btn
          dark
          flat
          @click.native="snackbar = false"
        >
          <v-icon dark>mdi-close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-container>
  </v-content>
</template>

<script>
import Interact from "interact.js"
import {
  db,
  firebaseApp,
} from "@/firebase"

import Person from "@/components/Person"
import Role from "@/components/Role"
import TrackComponent from "@/components/Track"
import Lane from "@/components/Lane"
import PersonDialog from "@/components/PersonDialog"

import {
  mapGetters,
  mapState,
} from "vuex"

import {
  findBestPairing,
  scaleDate,
} from "@/lib/recommendation"

export default {
  name: "Team",
  components: {
    Person,
    Role,
    TrackComponent,
    Lane,
    PersonDialog,
  },

  firebase() {
    const teamRef = db.ref(`/teams/${this.teamName}`)

    return {
      team: {
        source: teamRef,
        asObject: true,
        cancelCallback: () => this.$router.push("/"),
      },
      history: teamRef.child("history").orderByKey().limitToLast(30),
    }
  },

  data() {
    return {
      newTrackDialog: false,
      newRoleDialog: false,

      newTrackName: "",
      newRoleName: "",
      savingHistory: false,
      recommending: false,
      teamName: this.$route.params.team.toLowerCase(),
    }
  },

  computed: {
    snackbar: {
      get() { return this.$store.state.snackbar },
      set(value) { return this.$store.commit("set-snackbar", value) },
    },
    ...mapState([
      "snackbarText", "snackbarColor",
    ]),
    ...mapGetters([
      "roles", "unassignedRoles",
      "tracks", "unassignedTracks",
      "people", "unassignedPeople", "outPeople", "availablePeople", "solos",
      "lanes",
    ]),
  },

  created() {
    const self = this

    Interact(".person, .track, .role").draggable({
      inertia: false,
      restrict: {
        restriction: "main",
        elementRect: {
          top: 0,
          left: 0,
          bottom: 1,
          right: 1,
        },
        endOnly: false,
      },
      autoScroll: true,

      onstart(event) {
        event.target.classList.add("dragging")
        event.target.classList.add("elevation-10")
      },

      onmove(event) {
        const target = event.target,
          x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
          y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy

        target.style.left = `${x}px`
        target.style.top = `${y}px`

        target.setAttribute("data-x", x)
        target.setAttribute("data-y", y)
      },

      onend(event) {
        const target = event.target

        target.classList.remove("dragging")
        target.classList.remove("elevation-10")
        target.style.left = ""
        target.style.top = ""

        target.removeAttribute("data-x")
        target.removeAttribute("data-y")
      },
    })

    Interact(".dropzone").dropzone({
      accept: ".person, .track, .role",
      overlap: 0.50,

      ondrop(event) {
        const key = event.relatedTarget.dataset.key,
          targetKey = event.target.dataset.key

        let type

        if (event.relatedTarget.classList.contains("person")) {
          type = "people"
        } else if (event.relatedTarget.classList.contains("track")) {
          type = "tracks"
        } else {
          type = "roles"
        }

        self.move(type, key, targetKey)
      },
    })
  },

  beforeCreate() {
    this.$store.dispatch("switchToTeam", this.$route.params.team.toLowerCase())
    firebaseApp.auth().onAuthStateChanged(user => {
      if (!user) {
        this.$router.push("/")
        this.snackbarOpen({
          message: "You need to be logged in to access this page.",
          color: "error",
        })
        return false
      }
    })
    return true
  },

  methods: {
    openPersonDialog() {
      this.$refs.personDialog.open()
    },

    snackbarOpen(args) {
      this.$store.commit("notify", args)
    },

    logout(event) {
      event.preventDefault()
      firebaseApp.auth().signOut()
    },

    saveHistory() {
      this.savingHistory = true

      const key = scaleDate(new Date().getTime())
      this.$firebaseRefs.history.child(key).set(this.team.current).then(() => {
        this.savingHistory = false

        this.snackbarOpen({
          message: "History recorded!",
          color: "success",
        })
      })
    },

    recommendPairs() {
      this.recommending = true
      setTimeout(async () => {
        const bestPairing = await findBestPairing({
          history: this.history,
          people: this.availablePeople,
          lanes: this.lanes.filter(({ locked }) => !locked),
          solos: this.solos,
        })

        if (bestPairing) {
          this.applyPairing(bestPairing)
        } else {
          this.snackbarOpen({
            message: "Cannot make a valid pairing assignment. Do you have too many lanes?",
            color: "error",
          })
        }
        this.recommending = false
      }, 200)
    },

    applyPairing(pairing) {
      this.$store.dispatch("applyPairing", pairing)
    },

    addTrack() {
      this.$store.dispatch("addTrack", { name: this.newTrackName })

      this.newTrackDialog = false
      this.newTrackName = ""
    },

    addRole() {
      this.$store.dispatch("addRole", { name: this.newRoleName })

      this.newRoleDialog = false
      this.newRoleName = ""
    },

    move(type, key, targetKey) {
      this.$store.dispatch("move", { type, key, targetKey })
    },
  },
}
</script>

<style lang="scss">
  .field.is-expanded {
    height: 26px;
  }

  .dropzone {
    min-height: 100px;
    width: 100%;
  }

  .people.unassigned {
    min-height: 221px;
  }

  .tracks.unassigned {
    min-height: 136px;
  }

  .roles.unassigned {
    min-height: 122px;
  }

  .dragging {
    z-index: 200;
    position: relative;
    transition: transform 0.4s ease-in-out,
    box-shadow 0.4s ease-in-out;
    transform: rotate(4deg);
  }

  .out {
    flex: 1 1 auto;
  }

  .deleting {
    opacity: 0.8;
  }

  #app .sidebar {
    display: flex;
    flex-flow: column;

    @media (min-width: 960px) {
      position: relative;
      top: -20px;
      margin-left: 30px;
      padding: 10px;
      padding-top: 20px;
      min-height: 92vh;
      width: 100%;
    }
  }

  #app .lanes {
    height: fit-content;
    padding: 0;
  }

  #app {
    overflow-x: hidden;
  }

  .highlight-enter-active {
    transition: transform 0.2s, filter 0.2s, -webkit-filter 0.2s;
  }

  .highlight-enter {
    transform: rotate(5deg);
    filter: brightness(140%);
  }

  #app .logo {
    background-image: url("../assets/pairist.svg");
    background-size: 45px;
    background-repeat: no-repeat;
    background-position: 10px 50%;
    padding-left: 40px !important;
  }
</style>
