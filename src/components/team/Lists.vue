<template>
  <v-flex>
    <div class="lists elevation-6">
      <v-toolbar color="secondary" dark>
        <span/>
        <v-toolbar-title>Lists</v-toolbar-title>
        <v-spacer/>
        <v-btn icon id="add-list" @click="addList">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list class="pl-2">
        <template v-for="list in lists">
          <List :list="list" :key="list['.key']" />
        </template>
      </v-list>
    </div>
  </v-flex>
</template>

<script>
import List from "@/components/team/List"
import editable from "@/components/editable"
import { mapGetters } from "vuex"

export default {
  components: {
    editable,
    List,
  },

  computed: {
    ...mapGetters("lists", { lists: "all" }),
  },

  methods: {
    async addList() {
      await this.$store.dispatch("lists/save", {})
    },
  },
}
</script>

<style lang="scss">
#app .lists {
  display: flex;
  flex-flow: column;

  @media (min-width: 960px) {
    position: relative;
    margin-left: -30px;
    height:100%;
    width: 100%;
  }
}
</style>
