<template>
  <div
    class="box person"
    :data-key="person['.key']"
  >
    <img
      :src="picture"
      @error="fixPicture"
    >
    <p>{{ person.name }}</p>
  </div>
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

<style scoped lang="scss">
.person {
  background-color: hsl(0, 0%, 100%);
  font-family: 'Permanent Marker', cursive;
  color: #2d0079;
  text-shadow: 0 0 1px black;
  display: inline-block;
  margin: 10px;
  text-align: center;
  padding: 7px;
  transform: rotate(-3deg);
  font-size: 0;
  height: 150px;
  width: 130px;

  img {
    border: 1px solid hsl(0, 0%, 90%);
    height: 120px;
    width: 120px;
  }
  p {
    font-size: 1rem;
  }
}
</style>
