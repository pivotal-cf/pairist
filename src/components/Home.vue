<template>
  <v-content>
    <v-toolbar
      class="primary logo"
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
              v-model="name"
              :rules="nameRules"
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

            <v-btn @click="create" color="secondary" :disabled="loading">
              <v-icon>mdi-plus</v-icon>
              create
            </v-btn>
            <v-btn @click="login" color="primary" :disabled="loading">
              <v-icon>mdi-check</v-icon>
              login
            </v-btn>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>

    <Notification/>
  </v-content>
</template>

<script>
import { mapState, mapActions } from "vuex"

import Notification from "@/components/Notification"

export default {
  name: "Home",

  components: {
    Notification,
  },

  data() {
    return {
      valid: true,
      user: "",
      name: "",
      nameRules: [
        (v) => !!v || "Team name is required",
        (v) => v && v.length <= 25 || "Team name must be less than 15 characters",
        (v) => v && /^[A-Za-z\-0-9]+$/.test(v) || "Team name must only contain letters numbers or dashes",
      ],
      password: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v && v.length >= 5 || "Password must be at least 6 characters",
      ],
    }
  },

  computed: {
    ...mapState(["loading"]),
  },

  methods: {
    ...mapActions(["signup", "signin"]),

    login() {
      if (this.$refs.form.validate()) {
        this.signin({ name: this.name, password: this. password })
      }
    },

    create() {
      if (this.$refs.form.validate()) {
        this.signup({ name: this.name, password: this.password })
      }
    },
  },
}
</script>

<style lang=scss>
#app .logo {
  background: url("../assets/pairist.svg");
  background-size: 45px;
  background-repeat: no-repeat;
  background-position: 10px 50%;
  padding-left: 40px !important;
}
</style>
