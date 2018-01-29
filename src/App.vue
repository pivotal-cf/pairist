<template>
  <v-app id="app">
    <router-view :key="$route.fullPath"/>
    <Footer/>
  </v-app>
</template>

<script>
import Footer from "./components/Footer.vue"

export default {
  name: "App",
  components: {
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
