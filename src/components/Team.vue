<template>
  <div class="dropzone">
    <h1 class="is-size-1 is-uppercase has-text-weight-bold">{{ team }}</h1>
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
        <div class="people available">
          <h1 class="is-size-3">People</h1>
          <b-field>
            <b-input
              placeholder="John Smith"
              @keyup.native.enter="addPerson"
              v-model="newPersonName"/>
            <p class="control">
              <button
                class="button is-success"
                @click="addPerson"><b-icon icon="plus"/></button>
            </p>
          </b-field>

          <Person
            v-for="person in availablePeople"
            :person="person"
            :key="person['.key']"
          />
        </div>
        <div class="tracks available">
          <h1 class="is-size-3">Tracks</h1>
          <b-field>
            <b-input
              placeholder="Xenial"
              @keyup.native.enter="addTrack"
              v-model="newTrackName"/>
            <p class="control">
              <button
                class="button is-success"
                @click="addTrack"><b-icon icon="plus"/></button>
            </p>
          </b-field>

          <TrackComponent
            v-for="track in availableTracks"
            :track="track"
            :key="track['.key']"
          />
        </div>
        <div class="roles available">
          <h1 class="is-size-3">Roles</h1>
          <b-field>
            <b-input
              placeholder="Interrupt"
              @keyup.native.enter="addRole"
              v-model="newRoleName"/>
            <p class="control">
              <button
                class="button is-success"
                @click="addRole"><b-icon icon="plus"/></button>
            </p>
          </b-field>

          <Role
            v-for="role in availableRoles"
            :role="role"
            :key="role['.key']"
          />
        </div>
      </div>
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
    Interact(".person, .track, .role").draggable({
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
      },
      ondragleave(event) {
        event.target.classList.remove("drop-target")
        event.relatedTarget.classList.remove("can-drop")
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

    move(type, key, targetKey) {
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

<style scoped lang="scss">
.drop-target {
  background-color: hsl(0, 0%, 98%);
}

.lane.drop-target {
  background-color: hsl(0, 0%, 97%);
}

.dropzone {
  min-height: 200px;
  width: 100%;
}

.people.available {
  min-height: 296px;
}

.tracks.available {
  min-height: 136px;
}

.roles.available {
  min-height: 122px;
}
</style>
