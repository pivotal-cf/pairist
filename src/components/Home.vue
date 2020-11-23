<template>
  <v-content>
    <v-container fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-container v-if="loading" fill-height class="loading-home">
              <v-progress-circular :size="150" :width="6" color="accent" indeterminate />
            </v-container>

            <v-toolbar
              class="primary logo"
              dark
            >
              <v-toolbar-title>
                Pairist - Create Team / Login
              </v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  :counter="25"
                  label="Team Name"
                  prepend-icon="person"
                  required
                  @keyup.enter="login"
                />
                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  type="password"
                  label="Password"
                  prepend-icon="lock"
                  required
                  @keyup.enter="login"
                />
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-btn :disabled="loading" color="secondary" @click="create">
                <v-icon>mdi-plus</v-icon>
                create
              </v-btn>
              <v-spacer/>
              <v-btn :disabled="loading" color="primary" @click="login">
                <v-icon>mdi-check</v-icon>
                login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <SunsetNotification/>
    <Notification/>
  </v-content>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Notification from '@/components/Notification'
import SunsetNotification from '@/components/SunsetNotification'

export default {
  components: {
    Notification,
    SunsetNotification,
  },

  data () {
    return {
      valid: true,
      user: '',
      name: '',
      nameRules: [
        (v) => !!v || 'Team name is required',
        (v) => (!!v && v.length <= 25) || 'Team name must be less than 15 characters',
        (v) => (!!v && /^[A-Za-z\-0-9]+$/.test(v)) || 'Team name must only contain letters numbers or dashes',
      ],
      password: '',
      passwordRules: [
        (v) => !!v || 'Password is required',
        (v) => (!!v && v.length >= 5) || 'Password must be at least 6 characters',
      ],
    }
  },

  computed: {
    ...mapGetters(['loading']),
  },

  methods: {
    ...mapActions(['signup', 'signin']),

    login () {
      if (this.$refs.form.validate()) {
        this.signin({ name: this.name, password: this.password })
      }
    },

    create () {
      if (this.$refs.form.validate()) {
        this.signup({ name: this.name, password: this.password })
      }
    },
  },
}
</script>

<style lang="stylus">
#app .logo
  background: url("../assets/pairist.svg")
  background-size: 45px
  background-repeat: no-repeat
  background-position: 10px 50%
  padding-left: 40px !important

.loading-home
  margin: auto
  position: absolute
  z-index: 100
  text-align: center
  background: rgba(255, 255, 255, 0.3)

  div
    margin: auto
</style>
