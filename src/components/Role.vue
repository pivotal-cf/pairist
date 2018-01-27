<template>
  <b-tag
    class="role"
    type="is-info"
    size="is-small"
    :data-key="role['.key']"
  >
    {{ role.name }}
  </b-tag>
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

<style scoped lang="scss">
.role {
  margin-right: 0.25rem !important;
}
</style>
