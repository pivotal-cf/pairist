<template>
  <div v-if="!loggedIn">
    <label>
      <span>Email</span>
      <input
        type="email"
        v-model="email"
      >
    </label>
    <label>
      <span>Password</span>
      <input
        type="password"
        v-model="password"
      >
    </label>

    <button
      class="is-success"
      @click="login"
    >
      Login
    </button>
    <button
      class="is-success"
      @click="signup"
    >
      Signup
    </button>
  </div>
  <div v-else>
    <button
      class="is-success"
      @click="logout"
    >
      Logout
    </button>
  </div>
</template>

<script>
import { firebaseApp } from "@/firebase"

export default {
  name: "Hello",
  data() {
    return {
      loggedIn: false,
      email: "",
      password: "",
    }
  },
  created() {
    const self = this
    firebaseApp.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        self.loggedIn = true
      } else {
        self.loggedIn = false
      }
    })
  },
  methods: {
    login(event) {
      event.preventDefault()

      const auth = firebaseApp.auth()
      const email = this.email
      const password = this.password

      this.email = ""
      this.password = ""

      auth.signInWithEmailAndPassword(email, password).then(() => {
        this.$toast.open({
          message: "Welcome",
          type: "is-success",
        })
      }).catch(error => {
        this.$toast.open({
          message: error.message,
          type: "is-danger",
        })
      })
    },

    signup(event) {
      event.preventDefault()

      const auth = firebaseApp.auth()
      const email = this.email
      const password = this.password

      this.email = ""
      this.password = ""

      auth.createUserWithEmailAndPassword(email, password).then(() => {
        this.$toast.open({
          message: "Welcome",
          type: "is-success",
        })
      }).catch(error => {
        this.$toast.open({
          message: error.message,
          type: "is-danger",
        })
      })
    },

    logout(event) {
      event.preventDefault()
      firebaseApp.auth().signOut()
    },
  },
}
</script>
