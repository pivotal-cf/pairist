<template>
  <span />
</template>

<script>
import Interact from 'interact.js'
import _ from 'lodash/fp'

import { mapActions, mapMutations } from 'vuex'

export default {
  props: {
    draggables: {
      type: Array,
      required: true,
    },
  },

  created () {
    const self = this
    const draggableClassList = _.map(d => `.${d}`, this.draggables).join(', ')

    Interact(draggableClassList).draggable({
      inertia: false,
      restrict: {
        restriction: 'main',
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        endOnly: false,
      },
      autoScroll: true,

      onstart (event) {
        self.setDragging(true)

        event.target.classList.add('dragging')
        event.target.classList.add('elevation-10')
      },

      onmove (event) {
        const target = event.target
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        target.style.left = `${x}px`
        target.style.top = `${y}px`

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
      },

      onend (event) {
        self.setDragging(false)
        const target = event.target

        target.classList.remove('dragging')
        target.classList.remove('elevation-10')
        target.style.left = ''
        target.style.top = ''

        target.removeAttribute('data-x')
        target.removeAttribute('data-y')
      },
    })

    Interact('.dropzone').dropzone({
      accept: draggableClassList,
      overlap: 0.50,

      ondragenter (event) {
        self.setDropTarget(event.target.dataset.key)
      },
      ondragleave () {
        self.setDropTarget(null)
      },
      ondropdeactivate () {
        self.setDropTarget(null)
      },

      ondrop (event) {
        const key = event.relatedTarget.dataset.key
        const targetKey = event.target.dataset.key

        self.move({ key, targetKey })
      },
    })
  },

  methods: {
    ...mapMutations(['setDragging', 'setDropTarget']),
    ...mapActions(['move']),
  },
}
</script>

<style lang="stylus">
.dropzone
  min-height: 100px
  width: 100%

.dragging
  z-index: 200
  position: relative
  transition: transform 0.4s ease-in-out
  box-shadow 0.4s ease-in-out
  transform: rotate(4deg)

.highlight-enter-active
  transition: transform 0.2s, filter 0.2s, -webkit-filter 0.2s

.highlight-enter
  transform: rotate(5deg)
  filter: brightness(140%)
</style>
