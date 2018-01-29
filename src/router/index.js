import Vue from "vue"
import Router from "vue-router"
import Home from "@/components/Home"
import Team from "@/components/Team"

Vue.use(Router)

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/:team",
      name: "Team",
      component: Team,
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
