<template>
  <v-flex>
    <div class="lists">
      <v-toolbar color="secondary" flat dark>
        <span/>
        <v-toolbar-title flat>Lists</v-toolbar-title>
        <v-spacer/>
        <v-btn
          v-if="canWrite"
          id="add-list"
          icon
          @click="addList"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list class="pl-2" three-line>
        <draggable v-model="lists" :options="{ handle: '.outer-handle' }">
          <template v-for="list in lists">
            <List :list="list" :key="list['.key']" />
          </template>
        </draggable>
      </v-list>
    </div>
  </v-flex>
</template>

<script>
import List from '@/components/team/List'
import editable from '@/components/editable'
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'

export default {
  components: {
    editable,
    List,
    draggable,
  },

  computed: {
    ...mapGetters(['canWrite']),

    lists: {
      get () {
        return this.$store.getters['lists/all']
      },
      set (value) {
        this.$store.dispatch('lists/reorderLists', value)
      },
    },
  },

  methods: {
    async addList () {
      await this.$store.dispatch('lists/save', {})
    },
  },
}
</script>

<style lang="stylus">
#app .lists
  display: flex
  flex-flow: column

  .v-toolbar
    .v-toolbar__content
      height: 40px !important

  @media (min-width: 960px)
    position: relative
    height:100%
    width: 100%
</style>
