<template>
  <v-chip
    :text-color="textColor"
    :color="color"
    :label="entity.type === 'track'"
  >
    <v-avatar v-if="entity.icon" :class="iconColor" :tile="entity.type === 'track'">
      <v-icon>{{ entity.icon }}</v-icon>
    </v-avatar>
    <span v-if="entity.name">{{ entity.name }}</span>
    <slot/>
  </v-chip>
</template>

<script>
export default {
  props: {
    entity: {
      type: Object,
      required: true,
    },
  },

  computed: {
    iconColor () {
      const components = this.color.split(' ')
      if (components.length === 2) {
        const adjustments = components[1].split('-')
        if (adjustments[0] === 'lighten') {
          if (adjustments[1] === '1') {
            components[1] = 'darken-1'
          } else {
            components[1] = `lighten-${parseInt(adjustments[1]) - 2}`
          }
        } else {
          components[1] = `darken-${parseInt(adjustments[1]) + 2}`
        }
      } else {
        components.push('darken-2')
      }
      return components.join(' ')
    },

    textColor () {
      if (['white', 'transparent'].includes(this.color) ||
        this.color.indexOf('light') > -1
      ) { return 'black' }
      return 'white'
    },

    color () {
      if (this.entity.color) { return this.entity.color }
      if (this.entity.type === 'role') { return 'accent lighten-2' }
      return 'accent'
    },
  },
}
</script>

<style lang="stylus" scoped>
.chip
  height: 34px
  font-size: 17px

  .avatar
    height: 32px !important
    width: 32px !important
</style>
