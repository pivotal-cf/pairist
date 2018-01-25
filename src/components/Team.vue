<template>
  <div>
    <h1>{{ team }}</h1>
  </div>
</template>

<script>
export default {
  name: "Team",
  data () {
    return {
      team: this.$route.params.team,
    }
  },
}
</script>
