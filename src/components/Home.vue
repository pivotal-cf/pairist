<template>
  <v-content>
    <v-toolbar
      class="primary"
      dark
    >
      <v-toolbar-title>
        Pairist
      </v-toolbar-title>
    </v-toolbar>

    <v-container class="dropzone" grid-list-md>
      <v-layout row wrap>
        <v-flex xs3/>
        <v-flex xs6>
          <h3 class="display-2 grey--text text--darken-1">Login/Create Team</h3>
          <v-form v-model="valid" ref="form">
            <v-text-field
              label="Team Name"
              v-model="team"
              :rules="teamRules"
              :counter="25"
              @keyup.native.enter="login"
              required
            />
            <v-text-field
              label="Password"
              v-model="password"
              type="password"
              :rules="passwordRules"
              @keyup.native.enter="login"
              required
            />

            <v-btn @click="create" color="secondary" :disabled="!create">
              <v-icon>mdi-plus</v-icon>
              create
            </v-btn>
            <v-btn @click="login" color="primary" :disabled="!create">
              <v-icon>mdi-check</v-icon>
              login
            </v-btn>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>

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
  </v-content>
</template>

<script>
import { db, firebaseApp } from "@/firebase"

export default {
  name: "Hello",
  data() {
    return {
      snackbarColor: "",
      snackbar: false,
      snackbarText: "",

      valid: true,
      user: "",
      team: "",
      teamRules: [
        (v) => !!v || "Team name is required",
        (v) => v && v.length <= 25 || "Team name must be less than 15 characters",
        (v) => v && /^[A-Za-z\-0-9]+$/.test(v) || "Team name must only contails letters numbers or dashes",
      ],
      password: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v && v.length >= 5 || "Password must be at least 6 characters",
      ],
    }
  },
  beforeCreate() {
    firebaseApp.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.user = firebaseUser
        this.$router.push({ name: "Team", params: { team: this.user.email.replace("@pair.ist", "") } })
      } else {
        this.$router.push("/")
        this.user = ""
      }
    })
  },
  methods: {
    snackbarOpen({color, message}) {
      this.snackbarColor = color
      this.snackbarText = message
      this.snackbar = true
    },

    login() {
      if (this.$refs.form.validate()) {
        const auth = firebaseApp.auth()
        const email = `${this.team}@pair.ist`
        const password = this.password

        auth.signInWithEmailAndPassword(email, password).catch(error => {
          this.snackbarOpen({
            message: error.message.replace("email address", "name"),
            color: "error",
          })
        })
      }
    },

    create() {
      if (this.$refs.form.validate()) {
        const auth = firebaseApp.auth()
        const email = `${this.team}@pair.ist`
        const password = this.password

        auth.createUserWithEmailAndPassword(email, password).then(event => {
          db.ref(`/teams/${this.team}`).child("ownerUID").set(event.uid).catch(() => {
            firebaseApp.auth().signOut()
            this.$router.push("/")
            this.snackbarOpen({
              message: "You don't have permissions to view this team.",
              color: "error",
            })
          })
        }).catch(error => {
          this.snackbarOpen({
            message: error.message.replace("email address", "name"),
            color: "error",
          })
        })
      }
    },
  },
}
</script>
