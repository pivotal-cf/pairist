<template>
  <v-list-tile>
    <v-list-tile-action>
      <v-checkbox v-model="item.checked" @change="save"/>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>
        <editable placeholder="Add title..." :content="title"
                  :class="{ checked: item.checked }"
                  @update="title = $event"/>
      </v-list-tile-title>
    </v-list-tile-content>
    <v-progress-circular v-if="loading" indeterminate color="primary"/>
    <v-list-tile-action>
      <v-btn icon ripple class="remove-item" @click="remove">
        <v-icon color="grey lighten-1">close</v-icon>
      </v-btn>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import editable from "@/components/editable"

export default {
  components: { editable },

  props: {
    item: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    title: {
      get() { return this.item.title },
      async set(value) {
        const item = { ...this.item, title: value }
        this.$emit("update", item)
      },
    },
  },

  methods: {
    save() {
      this.$emit("update", this.item)
    },

    remove() {
      this.$emit("remove", this.item[".key"])
    },
  },
}
</script>

<style lang="scss">
.checked {
  text-decoration: line-through;
}
</style>
