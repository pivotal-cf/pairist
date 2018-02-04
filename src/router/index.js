import Vue from "vue"
import Router from "vue-router"
import Home from "@/components/Home"
import Team from "@/components/Team"
import { Auth, RedirectToTeam } from "@/router/auth"

Vue.use(Router)

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
      beforeEnter: RedirectToTeam,
    },
    {
      path: "/:team",
      name: "Team",
      component: Team,
      beforeEnter: Auth,
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = "Pairist"
  if (to.params.team) {
    document.title += ` - ${to.params.team.toUpperCase()}`
  }
  next()
})

export default router
