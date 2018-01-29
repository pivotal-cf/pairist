<template>
  <div>
    <div v-if="user === ''">
      <b-field>
        <b-input
          placeholder="Go to team..."
          icon="account-multiple"
          @keyup.native.enter="create"
          v-model="team"/>
      </b-field>
      <b-field>
        <b-input
          placeholder="Password"
          @keyup.native.enter="create"
          type="password"
          v-model="password"/>
      </b-field>
      <b-field>
        <p class="control">
          <button
            class="button is-success"
            @click="create"
          >
            Create
          </button>
        </p>
      </b-field>
    </div>
    <div v-if="user === ''">
      <b-field>
        <b-input
          placeholder="Go to team..."
          icon="account-multiple"
          @keyup.native.enter="login"
          v-model="team"/>
      </b-field>
      <b-field>
        <b-input
          placeholder="Password"
          @keyup.native.enter="login"
          type="password"
          v-model="password"/>
      </b-field>
      <b-field>
        <p class="control">
          <button
            class="button is-primary"
            @click="login"
          >
            Login
          </button>
        </p>
      </b-field>
    </div>
  </div>
</template>

<script>
import { db, firebaseApp } from "@/firebase"

export default {
  name: "Hello",
  data() {
    return {
      user: "",
      team: "",
      password: "",
    }
  },
  beforeCreate() {
    firebaseApp.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.user = firebaseUser
        this.$router.push({ name: "Team", params: { team: this.team } })
      } else {
        this.$router.push("/")
        this.user = ""
      }
    })
  },
  methods: {
    login(event) {
      event.preventDefault()

      const auth = firebaseApp.auth()
      const email = `${this.team}@pair.ist`
      const password = this.password

      auth.signInWithEmailAndPassword(email, password).catch(error => {
        this.email = ""
        this.password = ""

        this.$toast.open({
          message: error.message.replace("email address", "name"),
          type: "is-danger",
        })
      })
    },

    create(event) {
      event.preventDefault()

      const auth = firebaseApp.auth()
      const email = `${this.team}@pair.ist`
      const password = this.password

      auth.createUserWithEmailAndPassword(email, password).then(event => {
        db.ref(`/teams/${this.team}`).child("ownerUID").set(event.uid).catch(() => {
          firebaseApp.auth().signOut()
          this.$router.push("/")
          this.$toast.open({
            message: "You don't have permissions to view this team.",
            type: "is-danger",
          })
        })
      }).catch(error => {
        this.team = ""
        this.password = ""

        this.$toast.open({
          message: error.message.replace("email address", "name"),
          type: "is-danger",
        })
      })
    },
  },
}
</script>
