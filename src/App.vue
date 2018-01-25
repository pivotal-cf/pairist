<template>
  <div id="app">
    <div id="wrapper">
      <Navigation/>
      <div
        id="content"
        class="container is-fluid">
        <router-view/>
      </div>
    </div>
    <Footer/>
  </div>
</template>

<script>
import Navigation from "./components/Navigation.vue"
import Footer from "./components/Footer.vue"

export default {
  name: "App",
  components: {
    Navigation,
    Footer,
  },
}
</script>

<style>
#app {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}
#wrapper {
  flex: 1 0 auto;
}
</style>
