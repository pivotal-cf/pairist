<template>
  <transition name="highlight">
    <v-card
      :data-key="person['.key']"
      class="person title" dark color="secondary"
    >
      <v-btn v-if="canWrite" class="edit-hover" color="primary" depressed small @click="edit">
        <v-icon>edit</v-icon>
        Edit
      </v-btn>
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
        <div class="name" >
          <span :style="{ 'font-size': fontSize }">{{ person.name }}</span>
        </div>
      </v-card-text>

      <PersonDialog ref="personDialog" :person="Object.assign({}, person)"/>
    </v-card>
  </transition>
</template>

<script>
import PersonDialog from './PersonDialog'
import { mapGetters } from 'vuex'

export default {
  components: { PersonDialog },

  props: {
    person: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters(['canWrite']),

    picture () {
      if (this.person.picture && this.person.picture.length > 0) {
        return this.person.picture
      }
      return require('@/assets/no-picture.svg')
    },

    fontSize () {
      if (this.person.name.length < 8) {
        return '18px'
      } else if (this.person.name.length < 9) {
        return '16px'
      } else if (this.person.name.length < 10) {
        return '15px'
      } else if (this.person.name.length < 12) {
        return '12px'
      } else if (this.person.name.length < 15) {
        return '11px'
      } else if (this.person.name.length < 18) {
        return '10px'
      } else {
        return '9px'
      }
    },
  },

  methods: {
    fixPicture (event) {
      event.target.src = require('@/assets/error-image.svg')
    },

    openMenu (event) {
      if (this.canWrite) {
        this.$refs.menu.open(event)
      }
    },

    edit () {
      this.$refs.personDialog.open()
    },
  },
}
</script>

<style lang="stylus">
.person
  display: inline-block
  margin-right: 10px
  margin-top: 3px
  text-align: center
  overflow-y: hidden

  .edit-hover
    bottom: -30px
    left: 0
    margin: 0
    width: 100%
    opacity: 0
    position: absolute
    transition: bottom linear .1s
    z-index: 100

  &:hover
    .edit-hover
      display: block
      bottom: 0
      opacity: 0.9

  .avatar img
    object-fit: cover

  @media (min-width: 960px)
    height: 113px !important
    width: 100px

  .v-card__text
    padding: 3px

    .name
      height: 20px

  @media (max-width: 960px)
    margin: 5px

    .v-card__text
      padding: 5px

      .avatar
        height: 70px !important
        width: 70px !important

    .name
      display: inline-block
</style>
