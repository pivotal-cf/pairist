<template>
  <v-container class="dropzone" pa-0 fluid fill-height>
    <v-layout row wrap>
      <Lists class="xs12 md4 order-xs3 order-md1" />
      <LaneList class="xs12 md5 order-xs1 order-md2" />
      <Sidebar class="xs12 md3 order-xs2 order-md2"/>
    </v-layout>
  </v-container>
</template>

<script>
import Lists from './Lists'
import LaneList from './LaneList'
import Sidebar from './Sidebar'

export default {
  components: { LaneList, Sidebar, Lists },
}
</script>

<style lang="stylus">
.phase-out
  position: relative

.phase-out:after
  content: '\A'
  position: absolute
  top: 0
  left: 0
  bottom: 0
  right: 0
  background:rgba(0,0,0,0.1)
  opacity: 1
</style>
