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
          class="button is-primary"
          @click="addPerson">Go</button>
      </p>
    </b-field>

    <ul>
      <li
        v-for="person in people"
        :key="person['.key']">
        {{ person.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import firebase from "firebase"
import firebaseConfig from "@/firebaseConfig"

const db = firebase.initializeApp(firebaseConfig).database()

export default {
  name: "Team",
  firebase() {
    return {
      people: db.ref(`/team/${this.team}/people`),
    }
  },
  data () {
    return {
      newPersonName: "",
      team: this.$route.params.team,
    }
  },
  methods: {
    addPerson () {
      this.$firebaseRefs.people.push({
        name: this.newPersonName,
      })
      this.newPersonName = ""
    },
  },
}
</script>
