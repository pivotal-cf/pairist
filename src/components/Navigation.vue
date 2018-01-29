<template>
  <nav
    class="navbar"
    role="navigation"
    aria-label="main navigation">
    <div class="navbar-brand">
      <router-link
        class="navbar-item"
        to="/">
        <img
          src="https://bulma.io/images/bulma-logo.png"
          alt="Pair.ist - Pairing board for the modern age."
          width="112"
          height="28">
      </router-link>

      <button
        class="button navbar-burger"
        @click="toggleNavbar"
      >
        <span/>
        <span/>
        <span/>
      </button>
    </div>

    <div
      class="navbar-menu"
      :style="{ display: navbarState ? 'block' : '' }"
    >
      <div class="navbar-start">
        <router-link
          class="navbar-item"
          to="/">
          Home
        </router-link>

        <b-field class="navbar-item">
          <b-input
            placeholder="Go to team..."
            icon="account-multiple"
            @keyup.native.enter="gotoTeam"
            v-model="team"/>
          <p class="control">
            <button
              class="button is-primary"
              @click="gotoTeam">Go</button>
          </p>
        </b-field>

        <div v-if="user != ''">
          Logged in as {{ user.email }}
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { firebaseApp } from "@/firebase"

export default {
  name: "Navigation",
  data() {
    return {
      navbarState: false,
      team: "",
      user: "",
    }
  },
  beforeCreate() {
    firebaseApp.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.user = firebaseUser
      } else {
        this.user = ""
      }
    })
  },
  methods: {
    gotoTeam() {
      if (this.team) {
        this.$router.push({ name: "Team", params: { team: this.team } })
      }
    },
    toggleNavbar() {
      this.navbarState = !this.navbarState
    },
  },
}
</script>

<style>
</style>
