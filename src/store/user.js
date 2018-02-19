import { db, firebaseApp } from "@/firebase"
import router from "@/router"

const auth = firebaseApp.auth()

export default {
  state: {
    user: auth.currentUser,
  },

  mutations: {
    setUser(state, user) {
      state.user = user
    },
  },

  getters: {
    user(state) {
      return state.user
    },
  },

  actions: {
    async autoLogin({ commit }, payload) {
      const name = payload.email.replace("@pair.ist", "").toLowerCase()

      commit("setUser", {
        uid: payload.uid,
        name: name,
      })
    },

    async signup({ commit, dispatch }, { name, password }) {
      commit("loading", true)
      name = name.toLowerCase()
      const email = `${name}@pair.ist`
      let user

      try {
        user = await auth.createUserWithEmailAndPassword(email, password)
      } catch(error) {
        commit("notify", {
          message: error.message.replace("email address", "name"),
          color: "error",
        })
        commit("loading", false)
        return
      }

      try {
        await db.ref(`/teams/${name}`).child("ownerUID").set(user.uid)
      } catch(error) {
        commit("notify", {
          message: "You don't have permissions to view this team.",
          color: "error",
        })
        dispatch("logout")
        commit("loading", false)
        return
      }
      router.push({ name: "TeamCurrent", params: { team: name } })
      commit("loading", false)
    },

    async signin({ commit, dispatch }, { name, password }) {
      commit("loading", true)
      name = name.toLowerCase()
      const email = `${name}@pair.ist`

      try {
        const event = await auth.signInWithEmailAndPassword(email, password)
        dispatch("autoLogin", event)
        router.push({ name: "TeamCurrent", params: { team: name } })
      } catch(error) {
        commit("notify", {
          message: error.message.replace("email address", "name"),
          color: "error",
        })
        commit("loading", false)
      }
    },

    logout({ commit }) {
      commit("loading", true)
      commit("setUser", null)
      router.push({ name: "Home" })
      auth.signOut()
      commit("loading", false)
    },
  },
}
