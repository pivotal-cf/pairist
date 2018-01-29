<template>
  <v-chip class="role" outline color="accent" :data-key="role['.key']">
    {{ role.name }}
  </v-chip>
</template>

<script>
export default {
  name: "Role",
  props: {
    role: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss">
</style>
