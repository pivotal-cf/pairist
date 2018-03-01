import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Team from '@/components/team/Team'
import Pairs from '@/components/team/Pairs'
import { Auth, RedirectToTeam } from '@/router/auth'
import _ from 'lodash/fp'

Vue.use(Router)

const AddCurrentToTeamRoute = async (to, from, next) => {
  if (to.name === 'BaseTeam') {
    next({ name: 'TeamCurrent', params: to.params })
  } else {
    next()
  }
}

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      beforeEnter: RedirectToTeam,
    },
    {
      path: '/:team',
      name: 'BaseTeam',
      component: Team,
      beforeEnter: AddCurrentToTeamRoute,
      children: [
        {
          path: 'current',
          name: 'TeamCurrent',
          component: Pairs,
          beforeEnter: Auth,
        },
        {
          path: 'history/:date',
          name: 'TeamHistory',
          component: Pairs,
          beforeEnter: Auth,
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = 'Pairist'
  if (to.params.team) {
    document.title += ` - ${_.toUpper(to.params.team)}`
  }
  next()
})

export default router
