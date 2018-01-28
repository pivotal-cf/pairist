<template>
  <div
    class="box person"
    :data-key="person['.key']"
  >
    <img
      :src="picture"
      @error="fixPicture"
    >
    <span>{{ person.name }}</span>
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

<style lang="scss">
.person {
  position: relative;
  background-color: hsl(0, 0%, 100%);
  display: inline-block;
  margin: 10px;
  padding: 6px;

  img {
    height: 50px;
    display: inline-block;
  }
  span {
    margin-top: 14px;
    margin-left: 10px;
    margin-right: 10px;
    display: inline-block;
  }
}
</style>
