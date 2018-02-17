<template>
  <v-content>
    <v-container fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-container fill-height v-if="loading" class="loading-home">
              <v-progress-circular indeterminate :size="150" :width="6" color="accent"/>
            </v-container>

            <v-toolbar
              class="primary logo"
              dark
            >
              <v-toolbar-title>
                Pairist - Maintenance
              </v-toolbar-title>
            </v-toolbar>

            <v-card-text class="">
              <blockquote class="text-xs-center blockquote mb-2">
                <v-icon color="info" size="140px">update</v-icon>
                <p>We're currently upgrading Pair.ist.</p>
                <p>The system should be back momentarily.
                This page will automatically refresh when the upgrade is finished.</p>
              </blockquote>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <Notification/>
  </v-content>
</template>

<script>
import { mapGetters, mapActions } from "vuex"

import Notification from "@/components/Notification"

export default {
  components: {
    Notification,
  },

  data() {
    return {
      valid: true,
      user: "",
      name: "",
      nameRules: [
        (v) => !!v || "Team name is required",
        (v) => v && v.length <= 25 || "Team name must be less than 15 characters",
        (v) => v && /^[A-Za-z\-0-9]+$/.test(v) || "Team name must only contain letters numbers or dashes",
      ],
      password: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v && v.length >= 5 || "Password must be at least 6 characters",
      ],
    }
  },

  computed: {
    ...mapGetters(["loading"]),
  },

  methods: {
    ...mapActions(["signup", "signin"]),

    login() {
      if (this.$refs.form.validate()) {
        this.signin({ name: this.name, password: this. password })
      }
    },

    create() {
      if (this.$refs.form.validate()) {
        this.signup({ name: this.name, password: this.password })
      }
    },
  },
}
</script>

<style lang=scss>
#app .logo {
  background: url("../assets/pairist.svg");
  background-size: 45px;
  background-repeat: no-repeat;
  background-position: 10px 50%;
  padding-left: 40px !important;
}

.loading-home {
  margin: auto;
  position: absolute;
  z-index: 100;
  text-align: center;
  background: rgba(255, 255, 255, 0.3);

  div {
    margin: auto;
  }
}
</style>
