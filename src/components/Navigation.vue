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

      <button class="button navbar-burger">
        <span/>
        <span/>
        <span/>
      </button>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <router-link
          class="navbar-item"
          to="/">
          Home
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navigation",
}
</script>

<style>
</style>
