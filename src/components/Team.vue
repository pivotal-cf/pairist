<template>
  <v-content>
    <v-toolbar
      class="primary"
      dark
    >
      <v-toolbar-title>
        Pairist
        <span v-if="team">
          - {{ teamName.toUpperCase() }}
        </span>
      </v-toolbar-title>
      <v-spacer/>
      <v-toolbar-side-icon class="hidden-md-and-up"/>
      <v-toolbar-items class="hidden-sm-and-down">
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
            <v-list-tile v-if="user">
              <v-list-tile-title @click="logout" >
                Logout <v-icon>mdi-logout</v-icon>
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>

    <v-container class="dropzone" grid-list-md fluid>
      <v-layout row wrap>
        <v-flex xs8>
          <v-list>
            <Lane
              class="dropzone"
              v-for="lane in lanesWithData"
              :toggle-lock-lane="toggleLockLane"
              :lane="lane"
              :key="lane['.key']"
              :data-key="lane['.key']"
            />
            <Lane
              class="dropzone"
              :lane="{'.key': 'new-lane'}"
              data-key="new-lane"
            />
          </v-list>
        </v-flex>

        <v-flex xs4>
          <div class="tracks unassigned">
            <h2>
              Tracks
              <v-dialog v-model="newTrackDialog" max-width="300px">
                <v-btn color="primary" dark slot="activator" icon>
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-card>
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
                            required/>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer/>
                    <v-btn color="blue darken-1" flat @click.native="newTrackDialog = false">Close</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="addTrack">Save</v-btn>
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
                <v-btn color="primary" dark slot="activator" icon>
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-card>
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
                            required/>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer/>
                    <v-btn color="blue darken-1" flat @click.native="newRoleDialog = false">Close</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="addRole">Save</v-btn>
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
              <v-dialog v-model="newPersonDialog" max-width="500px">
                <v-btn color="primary" dark slot="activator" icon>
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-card>
                  <v-card-title>
                    <span class="headline">New Person</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12 sm6>
                          <v-text-field
                            v-model="newPersonName"
                            label="Name"
                            @keyup.native.enter="addPerson"
                            required/>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-text-field
                            v-model="newPersonPicture"
                            @keyup.native.enter="addPerson"
                            type="url"
                            label="Picture URL"/>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer/>
                    <v-btn color="blue darken-1" flat @click.native="newPersonDialog = false">Close</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="addPerson">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </h2>
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
        </v-flex>

        <div
          class="delete-zone"
          :class="{ visible: showTrash }"
          data-key="delete"
        >
          <v-icon>close-circle</v-icon>
        </div>
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

import { findBestPairing, findMatchingLanes, scaleDate } from "@/lib/recommendation"

export default {
  name: "Team",
  components: {
    Person, Role, TrackComponent, Lane,
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
      people: currentRef.child("people"),
      tracks: currentRef.child("tracks"),
      roles: currentRef.child("roles"),
      lanes: currentRef.child("lanes"),
      history: teamRef.child("history").orderByKey().limitToLast(30),
    }
  },

  data() {
    return {
      user: null,

      snackbarColor: "",
      snackbar: false,
      snackbarText: "",

      newPersonDialog: false,
      newRoleDialog: false,
      newTrackDialog: false,

      newPersonName: "",
      newPersonPicture: "",
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
          tracks: this.tracks.filter(track => track.location == lane[".key"]),
          roles: this.roles.filter(role => role.location == lane[".key"]),
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
      restrict: false,
      autoScroll: false,

      onstart(event) {
        self.showTrash = true
        event.target.classList.add("dragging")
      },

      onmove(event) {
        const target = event.target,
          x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
          y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy

        target.style.webkitTransform =
          target.style.transform =
          `translate(${x}px, ${y}px) rotate(1deg)`

        target.setAttribute("data-x", x)
        target.setAttribute("data-y", y)
      },

      onend(event) {
        const target = event.target

        target.classList.remove("dragging")
        target.style.webkitTransform = target.style.transform = ""

        target.removeAttribute("data-x")
        target.removeAttribute("data-y")

        self.showTrash = false
      },
    })

    Interact(".dropzone, .delete-zone").dropzone({
      accept: ".person, .track, .role",
      overlap: 0.50,

      ondropactivate(event) {
        event.target.classList.add("drop-active")
      },
      ondragenter(event) {
        const draggableElement = event.relatedTarget,
          dropzoneElement = event.target

        dropzoneElement.classList.add("drop-target")
        draggableElement.classList.add("can-drop")
        if (dropzoneElement.classList.contains("delete-zone")) {
          draggableElement.classList.add("deleting")
        }
      },
      ondragleave(event) {
        event.target.classList.remove("drop-target")
        event.relatedTarget.classList.remove("can-drop")
        if (event.target.classList.contains("delete-zone")) {
          event.relatedTarget.classList.remove("deleting")
        }
      },
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
      ondropdeactivate(event) {
        event.target.classList.remove("drop-active")
        event.target.classList.remove("drop-target")
      },
    })
  },

  beforeCreate() {
    firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
      } else {
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

      const key = scaleDate((new Date()).getTime())
      this.$firebaseRefs.history.child(key).set(this.team.current).then(() => {
        this.savingHistory = false

        this.snackbarOpen({
          message: "History recorded!",
          color: "success",
        })
      })
    },

    async recommendPairs() {
      this.recommending = true
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
    },

    applyPairing(pairing) {
      const pairsAndLanes = findMatchingLanes({
        pairing,
        lanes: this.lanesWithData.filter(({locked}) => !locked),
        people: this.availablePeople,
      })

      let getNextLane = () => {
        const emptyLane = this.lanesWithData.find(lane => lane.people.length === 0)
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

    addPerson() {
      if (this.newPersonName === "") {
        return
      }
      this.$firebaseRefs.people.push({
        name: this.newPersonName,
        picture: this.newPersonPicture,
        location: "unassigned",
      })
      this.newPersonName = ""
      this.newPersonPicture = ""
      this.newPersonDialog = false
    },

    addTrack() {
      if (this.newTrackName === "") {
        return
      }
      this.$firebaseRefs.tracks.push({
        name: this.newTrackName,
        location: "unassigned",
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
      })
      this.newRoleName = ""
      this.newRoleDialog = false
    },

    move(type, key, targetKey) {
      if (targetKey === "delete") {
        this.$firebaseRefs[type].child(key).set(null)
      } else {
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

        this.$firebaseRefs[type].child(key).set(thing)
      }

      this.lanesWithData.forEach(lane => {
        if (lane.people.length === 0 && lane.tracks.length === 0 && lane.roles.length === 0) {
          this.removeLane(lane[".key"])
        }
      })
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
.drop-target {
  background-color: hsl(0, 0%, 98%);
}

.lane.drop-target {
  border: 10px solid green !important;
}

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

.delete-zone {
  transition: opacity 0.3s linear;

  text-align: center;
  position: fixed;
  bottom: 0;
  z-index: 100;
  right: 0;
  height: 100vh;
  width: 8rem;
  background: linear-gradient(to left, rgba(100, 0, 0, 0.4) 0%,rgba(255,255,255,0) 100%);
  opacity: 0;
  display: none;

  &.drop-target {
    background: linear-gradient(to left, rgba(100, 0, 0, 0.6) 0%,rgba(255,255,255,0) 100%);

    .delete-icon:before {
      color: rgb(200, 0, 0);
    }
  }

  .delete-icon:before {
    transition: top 0.3s linear;
    top: 45vh;
    left: 100px;
    position: absolute;
    font-size: 100px;
    color: rgba(200, 0, 0, 0.7);
  }

  &.visible {
    display: block;
    opacity: 1;

    .delete-icon:before {
      left: -20px;
    }
  }
}

.dragging {
  z-index: 200;
  position: relative;
}

.deleting {
  opacity: 0.8;
}

.people.out {
  border: 3px dashed rgba(200, 120, 120, 0.4);
  padding: 10px;
}
</style>
