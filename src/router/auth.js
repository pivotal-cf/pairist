import { store } from "@/store"

export const Auth = async (to, from, next) => {
  await store.dispatch("authorize", to.params.team)
  if (store.getters.canRead) {
    await store.dispatch("loadTeam", to.params.team)
    next()
    return
  } else if (store.getters.user) {
    store.commit("notify", {
      message: "You do not have access to this team.",
      color: "error",
    })
  } else {
    store.commit("notify", {
      message: "You need to be logged in to access this page.",
      color: "error",
    })
  }
  next("/")
}

export const RedirectToTeam = async (to, from, next) => {
  if (store.getters.user) {
    next({ name: "Team", params: { team: store.getters.user.name } })
  } else {
    next()
  }
}
