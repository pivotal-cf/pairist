<template>
  <v-card class="person title" dark color="secondary" :data-key="person['.key']" @contextmenu="openMenu">
    <v-card-text>
      <v-avatar
        size="86px"
        class="grey lighten-4"
      >
        <img
          :src="picture"
          @error="fixPicture"
        >
      </v-avatar>
      <div class="name">{{ person.name }}</div>
    </v-card-text>

    <ContextMenu @remove="$emit('remove')" ref="menu" />
  </v-card>
</template>

<script>
import ContextMenu from "@/components/ContextMenu"

export default {
  name: "Person",
  components: { ContextMenu },

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

    openMenu(event) {
      this.$refs.menu.open(event)
    },
  },
}
</script>

<style lang="scss">
.person {
  display: inline-block;
  margin-right: 10px;
  text-align: center;

  .card__text {
    padding: 15px;

    .name {
      margin-top: 7px;
    }
  }
}
</style>
