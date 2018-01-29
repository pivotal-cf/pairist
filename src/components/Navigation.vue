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

        <div v-if="user != ''">
          <button
            class="button is-danger"
            @click="logout"
          >
            Logout
          </button>
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
        this.$router.push("/")
      }
    })
  },
  methods: {
    logout(event) {
      event.preventDefault()
      firebaseApp.auth().signOut()
    },

    toggleNavbar() {
      this.navbarState = !this.navbarState
    },
  },
}
</script>

<style>
</style>
