<template>
  <div class="dropzone">
    <h1 class="is-size-1 is-uppercase has-text-weight-bold">
      {{ team }}

    </h1>


    <button
      class="button is-info is-small"
      @click="saveHistory"
    >
      <b-icon icon="content-save"/>
      <span>Record</span>
    </button>
    <hr >

    <div class="columns">
      <div class="column is-three-fifths">
        <Lane
          class="dropzone"
          v-for="lane in lanesWithData"
          :lane="lane"
          :key="lane['.key']"
        />
        <Lane
          class="dropzone"
          :lane="{'.key': 'new-lane'}"
        />
      </div>

      <div class="column is-two-fifths">
        <div class="tracks available">
          <h1 class="is-size-3">Tracks</h1>
          <b-field grouped>
            <b-field expanded>
              <b-input
                placeholder="Xenial"
                @keyup.native.enter="addTrack"
                size="is-small"
                v-model="newTrackName"/>
            </b-field>
            <b-field expanded>
              <p class="control">
                <button
                  class="button is-success is-small"
                  @click="addTrack"><b-icon icon="plus"/></button>
              </p>
            </b-field>
          </b-field>

          <TrackComponent
            v-for="track in availableTracks"
            :track="track"
            :key="track['.key']"
          />
        </div>

        <div class="roles available">
          <h1 class="is-size-3">Roles</h1>
          <b-field grouped>
            <b-field expanded>
              <b-input
                placeholder="Interrupt"
                @keyup.native.enter="addRole"
                size="is-small"
                v-model="newRoleName"/>
            </b-field>
            <b-field expanded>
              <p class="control">
                <button
                  class="button is-success is-small"
                  @click="addRole"><b-icon icon="plus"/></button>
              </p>
            </b-field>
          </b-field>

          <Role
            v-for="role in availableRoles"
            :role="role"
            :key="role['.key']"
          />
        </div>

        <div class="people available">
          <h1 class="is-size-3">People</h1>
          <b-field grouped>
            <b-field expanded>
              <b-input
                placeholder="Name"
                @keyup.native.enter="addPerson"
                size="is-small"
                v-model="newPersonName"/>
            </b-field>
            <b-field expanded>
              <b-input
                placeholder="Picture URL"
                @keyup.native.enter="addPerson"
                type="url"
                size="is-small"
                v-model="newPersonPicture"/>
            </b-field>
            <b-field expanded>
              <p class="control">
                <button
                  class="button is-success is-small"
                  @click="addPerson"><b-icon icon="plus"/></button>
              </p>
            </b-field>
          </b-field>

          <Person
            v-for="person in availablePeople"
            :person="person"
            :key="person['.key']"
          />
        </div>

        <div
          class="people out dropzone"
          data-key="out"
        >
          <h1 class="is-size-3">PM / Out</h1>

          <Person
            v-for="person in outPeople"
            :person="person"
            :key="person['.key']"
          />
        </div>
      </div>
    </div>

    <div
      class="delete-zone"
      :class="{ visible: showTrash }"
      data-key="delete"
    >
      <b-icon
        icon="close-circle"
        custom-size="delete-icon"
      />
    </div>
  </div>
</template>

<script>
import Interact from "interact.js"
import db from "@/db"
import Person from "@/components/Person"
import Role from "@/components/Role"
import TrackComponent from "@/components/Track"
import Lane from "@/components/Lane"

export default {
  name: "Team",
  components: {
    Person, Role, TrackComponent, Lane,
  },

  firebase() {
    return {
      people: db.ref(`/team/${this.team}/people`),
      tracks: db.ref(`/team/${this.team}/tracks`),
      roles: db.ref(`/team/${this.team}/roles`),
      lanes: db.ref(`/team/${this.team}/lanes`),
    }
  },

  data () {
    return {
      newPersonName: "",
      newPersonPicture: "",
      newTrackName: "",
      newRoleName: "",
      showTrash: false,
      team: this.$route.params.team,
    }
  },

  computed: {
    lanesWithData() {
      return this.lanes.map(lane => {
        return {
          ".key": lane[".key"],
          "people": this.people.filter(person => person.location == lane[".key"]),
          "tracks": this.tracks.filter(track => track.location == lane[".key"]),
          "roles": this.roles.filter(role => role.location == lane[".key"]),
        }
      })
    },

    availablePeople() {
      return this.people.filter(person => person.location == "available")
    },

    outPeople() {
      return this.people.filter(person => person.location == "out")
    },

    availableTracks() {
      return this.tracks.filter(track => track.location == "available")
    },

    availableRoles() {
      return this.roles.filter(role => role.location == "available")
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

  methods: {
    saveHistory() {
      const loadingComponent = this.$loading.open()

      db.ref(`/team/${this.team}`).once("value").then(snapshot => {
        const team = snapshot.val()
        const key = ((new Date).getTime() / 3600000).toFixed(0)
        db.ref(`/history/${this.team}/${key}`).set(team).then(() => {
          loadingComponent.close()

          this.$toast.open({
            message: "History recorded!",
            type: "is-success",
          })
        })
      })
    },

    addPerson() {
      if (this.newPersonName === "") {
        return
      }
      this.$firebaseRefs.people.push({
        name: this.newPersonName,
        picture: this.newPersonPicture,
        location: "available",
      })
      this.newPersonName = ""
      this.newPersonPicture = ""
    },

    addTrack() {
      if (this.newTrackName === "") {
        return
      }
      this.$firebaseRefs.tracks.push({
        name: this.newTrackName,
        location: "available",
      })
      this.newTrackName = ""
    },

    addRole() {
      if (this.newRoleName === "") {
        return
      }
      this.$firebaseRefs.roles.push({
        name: this.newRoleName,
        location: "available",
      })
      this.newRoleName = ""
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
          thing.location = "available"
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
  },
}
</script>

<style lang="scss">
.drop-target {
  background-color: hsl(0, 0%, 98%);
}

.lane.drop-target {
  background-color: hsl(0, 0%, 97%);
}

.field.is-expanded {
  height: 26px;
}

.dropzone {
  min-height: 100px;
  width: 100%;
}

.people.available {
  min-height: 221px;
}

.tracks.available {
  min-height: 136px;
}

.roles.available {
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
