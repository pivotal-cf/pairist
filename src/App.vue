<template>
  <v-app id="app">
    <v-content>
      <router-view :key="$route.fullPath"/>
    </v-content>
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
