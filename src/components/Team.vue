<template>
  <div>
    <h1>{{ team }}</h1>

    <b-field>
      <b-input
        placeholder="John Smith"
        @keyup.native.enter="addPerson"
        v-model="newPersonName"/>
      <p class="control">
        <button
          class="button is-success"
          @click="addPerson"><b-icon icon="plus"/><span>Person</span></button>
      </p>
    </b-field>

    <b-field>
      <b-input
        placeholder="Xenial"
        @keyup.native.enter="addTrack"
        v-model="newTrackName"/>
      <p class="control">
        <button
          class="button is-success"
          @click="addTrack"><b-icon icon="plus"/><span>Track</span></button>
      </p>
    </b-field>

    <b-field>
      <b-input
        placeholder="Interrupt"
        @keyup.native.enter="addRole"
        v-model="newRoleName"/>
      <p class="control">
        <button
          class="button is-success"
          @click="addRole"><b-icon icon="plus"/><span>Role</span></button>
      </p>
    </b-field>

    <div class="columns">
      <div class="column is-three-fifths">
        <div
          class="level box lane dropzone"
          v-for="lane in lanesWithData"
          :data-key="lane['.key']"
          :key="lane['.key']">
          <div class="level-left">
            <div
              class="box person level-item"
              v-for="person in lane.people"
              :data-key="person['.key']"
              :key="person['.key']">
              {{ person.name }}
            </div>
          </div>
          <div class="level-right">
            <b-tag
              class="track level-item"
              type="is-primary"
              size="is-large"
              v-for="track in lane.tracks"
              :data-key="track['.key']"
              :key="track['.key']">
              {{ track.name }}
            </b-tag>
          </div>
        </div>
        <div
          data-key="new-lane"
          class="level box lane dropzone">
          <div class="level-left"/>
        </div>
      </div>

      <div class="column is-two-fifths">
        <div class="box available dropzone">
          <div
            class="box person"
            v-for="person in availablePeople"
            :data-key="person['.key']"
            :key="person['.key']">
            {{ person.name }}
          </div>
        </div>
        <div class="box available">
          <b-tag
            class="track"
            type="is-primary"
            size="is-large"
            v-for="track in availableTracks"
            :data-key="track['.key']"
            :key="track['.key']">
            {{ track.name }}
          </b-tag>
        </div>
        <div class="box available">
          <b-tag
            class="role"
            type="is-info"
            size="is-small"
            v-for="role in availableRoles"
            :data-key="role['.key']"
            :key="role['.key']">
            {{ role.name }}
          </b-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Interact from "interact.js"
import db from "@/db"

export default {
  name: "Team",
  components: { },

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
      newTrackName: "",
      newRoleName: "",
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

    availableTracks() {
      return this.tracks.filter(track => track.location == "available")
    },

    availableRoles() {
      return this.roles.filter(role => role.location == "available")
    },
  },

  created() {
    const self = this
    Interact(".person, .track").draggable({
      inertia: false,
      restrict: false,
      autoScroll: true,

      onmove(event) {
        const target = event.target,
          x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
          y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy

        target.style.webkitTransform =
          target.style.transform =
          `translate(${x}px, ${y}px)`

        target.setAttribute("data-x", x)
        target.setAttribute("data-y", y)
      },

      onend(event) {
        const target = event.target

        target.style.webkitTransform = target.style.transform = ""

        target.removeAttribute("data-x")
        target.removeAttribute("data-y")
      },
    })

    Interact(".dropzone").dropzone({
      accept: ".person, .track",
      overlap: 0.50,

      ondropactivate(event) {
        event.target.classList.add("drop-active")
      },
      ondragenter(event) {
        const draggableElement = event.relatedTarget,
          dropzoneElement = event.target

        dropzoneElement.classList.add("drop-target")
        draggableElement.classList.add("can-drop")
      },
      ondragleave(event) {
        event.target.classList.remove("drop-target")
        event.relatedTarget.classList.remove("can-drop")
      },
      ondrop(event) {
        const key = event.relatedTarget.dataset.key,
          targetKey = event.target.dataset.key
        if (event.relatedTarget.classList.contains("person")) {
          self.movePerson(key, targetKey)
        } else {
          self.moveTrack(key, targetKey)
        }
      },
      ondropdeactivate(event) {
        event.target.classList.remove("drop-active")
        event.target.classList.remove("drop-target")
      },
    })
  },

  methods: {
    addPerson() {
      this.$firebaseRefs.people.push({
        name: this.newPersonName,
        location: "available",
      })
      this.newPersonName = ""
    },

    addTrack() {
      this.$firebaseRefs.tracks.push({
        name: this.newTrackName,
        location: "available",
      })
      this.newTrackName = ""
    },

    addRole() {
      this.$firebaseRefs.roles.push({
        name: this.newRoleName,
        location: "available",
      })
      this.newRoleName = ""
    },

    movePerson(personKey, targetKey) {
      const person = {...this.people.find(person => person[".key"] === personKey)}
      delete person[".key"]

      if (targetKey == "new-lane") {
        const newLaneKey = this.$firebaseRefs.lanes.push({sortOrder: 0}).key

        person.location = newLaneKey
      } else if (targetKey) {
        person.location = targetKey
      } else {
        person.location = "available"
      }

      this.$firebaseRefs.people.child(personKey).set(person)

      this.lanesWithData.forEach(lane => {
        if (lane.people.length === 0 && lane.tracks.length === 0) {
          this.removeLane(lane[".key"])
        }
      })
    },

    moveTrack(trackKey, targetKey) {
      const track = {...this.tracks.find(track => track[".key"] === trackKey)}
      delete track[".key"]

      if (targetKey == "new-lane") {
        const newLaneKey = this.$firebaseRefs.lanes.push({sortOrder: 0}).key

        track.location = newLaneKey
      } else if (targetKey) {
        track.location = targetKey
      } else {
        track.location = "available"
      }

      this.$firebaseRefs.tracks.child(trackKey).set(track)

      this.lanesWithData.forEach(lane => {
        if (lane.people.length === 0 && lane.tracks.length === 0) {
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

<style scoped lang="scss">
.person {
  background-color: hsl(0, 0%, 98%);
  margin: 10px;
  display: inline-block;
  padding-top: 70px;
  text-align: center;
  height: 180px;
  width: 140px;
}

.lane.drop-target {
  background-color: hsl(0, 0%, 97%);
}

.lane {
  height: 200px;
  margin-bottom: 1.0rem;
}

.dropzone {
  min-height: 200px;
  width: 100%;
}

.track {
  margin-right: 0.75rem;
}

.role {
  margin-right: 0.25rem !important;
}
</style>
