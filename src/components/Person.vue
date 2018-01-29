<template>
  <v-card class="person" :data-key="person['.key']">
    <v-card-text>
      <v-avatar
        size="80px"
        class="grey lighten-4"
      >
        <img
          :src="picture"
          @error="fixPicture"
        >
      </v-avatar>
    <span>{{ person.name }}<span/></span></v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Person",
  props: {
    person: {
      type: Object,
      required: true,
    },
  },

  computed: {
    picture() {
      if (this.person.picture && this.person.picture.length > 0) {
        return this.person.picture
      }
      return require("../assets/no-picture.svg")
    },
  },

  methods: {
    fixPicture(event) {
      event.target.src = require("../assets/error-image.svg")
    },
  },
}
</script>

<style lang="scss">
.person {
  display: inline-block;
  margin-right: 10px;
  text-align: center;
  width: 100px;

  .card__text {
    padding: 5px;
  }
}
</style>
