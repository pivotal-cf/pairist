import Vue from 'vue'
import VueShowdown from 'vue-showdown'

Vue.use(VueShowdown, {
  flavor: 'github',
  options: {
    emoji: true,
    openLinksInNewWindow: true,
  },
})
