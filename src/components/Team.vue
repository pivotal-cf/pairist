<template>
  <v-content>
    <v-toolbar
      class="primary"
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
          <v-btn icon slot="activator" dark>
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
              v-for="lane in lanesWithData"
              @savePerson="savePerson"
              @removePerson="removePerson"
              @removeRole="removeRole"
              @removeTrack="removeTrack"
              :toggle-lock-lane="toggleLockLane"
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
                @remove="removeTrack(track['.key'])"
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
                @remove="removeRole(role['.key'])"
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
                <PersonDialog ref="personDialog" :action-type="'New'" @save="savePerson"/>
              </h2>
              <Person
                v-for="person in unassignedPeople"
                @save="savePerson"
                @remove="removePerson(person['.key'])"
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
                @save="savePerson"
                @remove="remoevPerson(person['.key'])"
                :person="person"
                :key="person['.key']"
              />
            </div>
          </div>
        </v-flex>
      </v-layout>
      <v-snackbar
        :timeout="5000"
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
import { db, firebaseApp } from "@/firebase"
import _ from "lodash"

import Person from "@/components/Person"
import Role from "@/components/Role"
import TrackComponent from "@/components/Track"
import Lane from "@/components/Lane"
import PersonDialog from "@/components/PersonDialog"

import { findBestPairing, findMatchingLanes, scaleDate } from "@/lib/recommendation"

export default {
  name: "Team",
  components: {
    Person, Role, TrackComponent, Lane, PersonDialog,
  },

  firebase() {
    const teamRef = db.ref(`/teams/${this.teamName}`)
    const currentRef = teamRef.child("current")

    return {
      team:  {
        source: teamRef,
        asObject: true,
        cancelCallback: () => this.$router.push("/"),
      },
      people: currentRef.child("people").orderByChild("updatedAt"),
      tracks: currentRef.child("tracks").orderByChild("updatedAt"),
      roles: currentRef.child("roles").orderByChild("updatedAt"),
      lanes: currentRef.child("lanes"),
      history: teamRef.child("history").orderByKey().limitToLast(30),
    }
  },

  data() {
    return {
      snackbarColor: "",
      snackbar: false,
      snackbarText: "",

      newRoleDialog: false,
      newTrackDialog: false,

      newTrackName: "",
      newRoleName: "",
      savingHistory: false,
      recommending: false,
      showTrash: false,
      teamName: this.$route.params.team.toLowerCase(),
    }
  },

  computed: {
    lanesWithData() {
      return this.lanes.map(lane => {
        return Object.assign({
          people: this.people.filter(person => person.location == lane[".key"]),
          tracks: this.tracks.filter(track => track.location == lane[".key"]).reverse(),
          roles: this.roles.filter(role => role.location == lane[".key"]).reverse(),
        }, lane)
      })
    },

    lockedLaneKeys() {
      return this.lanes.filter(({locked}) => locked).map(lane => lane[".key"])
    },

    unassignedPeople() {
      return this.people.filter(person => person.location == "unassigned")
    },

    outPeople() {
      return this.people.filter(person => person.location == "out")
    },

    unassignedTracks() {
      return this.tracks.filter(track => track.location == "unassigned")
    },

    unassignedRoles() {
      return this.roles.filter(role => role.location == "unassigned")
    },

    availablePeople() {
      return this.people.filter(person =>
        person.location != "out" &&
        !this.lockedLaneKeys.some(laneKey => laneKey == person.location)
      )
    },

    peopleInLanes() {
      return this.people.filter(person =>
        person.location != "out" &&
        person.location != "unassigned" &&
        !this.lockedLaneKeys.some(laneKey => laneKey == person.location)
      )
    },

    solos() {
      return _.flatten(
        Object.values(_.groupBy(this.peopleInLanes, "location"))
          .filter(group => group.length === 1)
      )
    },
  },

  created() {
    const self = this

    Interact(".person, .track, .role").draggable({
      inertia: false,
      restrict: {
        restriction: "main",
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        endOnly: false,
      },
      autoScroll: true,

      onstart(event) {
        self.showTrash = true
        event.target.classList.add("dragging")
        event.target.classList.add("elevation-10")

        const width = event.target.offsetWidth

        if (event.target.classList.contains("person")) {
          event.target.style.marginRight = `-${width}px`
        } else {
          event.target.style.marginLeft = `-${width}px`
        }
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

        target.style.marginLeft = ""
        target.style.marginRight = ""

        target.removeAttribute("data-x")
        target.removeAttribute("data-y")

        self.showTrash = false
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

    logout(event) {
      event.preventDefault()
      firebaseApp.auth().signOut()
    },

    snackbarOpen({color, message}) {
      this.snackbarColor = color
      this.snackbarText = message
      this.snackbar = true
    },

    saveHistory() {
      this.savingHistory = true

      const key = scaleDate(new Date()).getTime()
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
          lanes: this.lanesWithData.filter(({locked}) => !locked),
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
      }, 100)
    },

    applyPairing(pairing) {
      const pairsAndLanes = findMatchingLanes({
        pairing,
        lanes: this.lanesWithData.filter(({locked}) => !locked),
        people: this.availablePeople,
      })

      let getNextLane = () => {
        const emptyLane = this.lanesWithData.find(lane => !lane.locked && lane.people.length === 0)
        if (emptyLane) {
          return emptyLane[".key"]
        }
        return this.$firebaseRefs.lanes.push({sortOrder: 0}).key
      }

      pairsAndLanes.forEach(({pair, lane}) => {
        lane = lane || getNextLane()
        pair.forEach(person => this.move("people", person[".key"], lane))
      })
    },

    savePerson(person) {
      if (person.name === "") {
        return
      }

      if (person[".key"]) {
        const personKey = person[".key"]
        delete person[".key"]

        this.$firebaseRefs.people.child(personKey).set(person)
      } else {
        this.$firebaseRefs.people.push({
          name: person.name,
          picture: person.picture || "",
          location: "unassigned",
          updatedAt: new Date().getTime(),
        })
      }
    },

    addTrack() {
      if (this.newTrackName === "") {
        return
      }
      this.$firebaseRefs.tracks.push({
        name: this.newTrackName,
        location: "unassigned",
        updatedAt: new Date().getTime(),
      })
      this.newTrackName = ""
      this.newTrackDialog = false
    },

    addRole() {
      if (this.newRoleName === "") {
        return
      }
      this.$firebaseRefs.roles.push({
        name: this.newRoleName,
        location: "unassigned",
        updatedAt: new Date().getTime(),
      })
      this.newRoleName = ""
      this.newRoleDialog = false
    },

    move(type, key, targetKey) {
      if (type !== "people" && targetKey === "out") {
        return
      }

      const thing = {...this[type].find(thing => thing[".key"] === key)}
      delete thing[".key"]

      if (targetKey == "new-lane") {
        const newLaneKey = this.$firebaseRefs.lanes.push({sortOrder: 0}).key

        thing.location = newLaneKey
      } else if (targetKey) {
        thing.location = targetKey
      } else {
        thing.location = "unassigned"
      }

      thing.updatedAt = new Date().getTime()

      this.$firebaseRefs[type].child(key).set(thing)
      this.clearEmptylanes()
    },

    clearEmptylanes() {
      this.lanesWithData.forEach(lane => {
        if (lane.people.length === 0 && lane.tracks.length === 0 && lane.roles.length === 0) {
          this.removeLane(lane[".key"])
        }
      })
    },

    removePerson(key) {
      this.$firebaseRefs.people.child(key).set(null)
      this.clearEmptylanes()
    },

    removeRole(key) {
      this.$firebaseRefs.roles.child(key).set(null)
      this.clearEmptylanes()
    },

    removeTrack(key) {
      this.$firebaseRefs.tracks.child(key).set(null)
      this.clearEmptylanes()
    },

    removeLane(key) {
      this.$firebaseRefs.lanes.child(key).remove()
    },

    toggleLockLane(lane) {
      this.$firebaseRefs.lanes.child(lane[".key"]).child("locked").set(!lane.locked)
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
</style>
