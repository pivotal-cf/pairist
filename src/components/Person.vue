<template>
  <div
    class="box person"
    :data-key="person['.key']"
  >
    {{ person.name }}
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
}
</script>

<style scoped lang="scss">
.person {
  background-color: hsl(0, 0%, 98%);
  margin: 10px;
  display: inline-block;
  padding-top: 70px;
  text-align: center;
  height: 180px;
  width: 140px;
}
</style>
